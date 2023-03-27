/**
 * thread_summary service
 * 비즈니스 로직: 스레드 요약(thread_summary) 실행 시, 스레드 내용을 읽은 후 요약 내용과 추천 동작을 응답
 */
import {sendMessage, SqsMessageBody} from "../libs/sqs";
import {SlackMessageAction, slackWeb} from "../libs/slack";
import {chatCompletion, ChatRow} from "../libs/openAi";
import {getChatCompletionProps} from "../libs/airtable";

export type SlackThreadSummaryMessageBody = SqsMessageBody<'thread_summary', SlackMessageAction>

export async function pubSummaryMessage(payload: SlackMessageAction) {
  const messageBody: SlackThreadSummaryMessageBody = {
    eventType: 'thread_summary',
    body: payload
  }

  return sendMessage(JSON.stringify(messageBody))
}

export async function subSummaryMessage(body: SlackThreadSummaryMessageBody) {

  const payload = body.body

  const { request, ...props } = await getChatCompletionProps('thread_summary')

  const conversationList = await slackWeb.conversations.replies({
    ts: payload.message.thread_ts,
    channel: payload.channel.id
  })

  const contexts: ChatRow[] = conversationList.messages ? conversationList.messages
      .map(message => {
        return {
          speeches: message.user ?? 'unknown',
          message: message.text ?? ''
        }
      })
      .filter(msg => msg.speeches !== 'unknown')
    : []

  const response = await chatCompletion({
    request: request ?? '주제 요약',
    chat: contexts,
    ...props
  })

  const responseMessage = response.message?.content ?? '실패'

  await slackWeb.chat.postMessage({
    thread_ts: payload.message.thread_ts,
    text: responseMessage,
    blocks: [
      {
        type: "section",
        text: {
          type: "plain_text",
          text: responseMessage
        }
      },
      {
        type: "divider"
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: "이슈 생성 미리보기"
        },
        accessory: {
          type: "button",
          text: {
            type: "plain_text",
            text: "이슈 생성",
            emoji: true
          },
          value: "issue_preview",
          action_id: "issue_preview"
        }
      }
    ],
    channel: payload.channel.id
  })
}
