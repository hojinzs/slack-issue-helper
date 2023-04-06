/**
 * thread_summary service
 * 비즈니스 로직: 스레드 요약(thread_summary) 실행 시, 스레드 내용을 읽은 후 요약 내용과 추천 동작을 응답
 */
import {sendMessage, SqsMessageBody} from "../libs/sqs";
import {SlackMessageAction, slackWeb} from "../libs/slack";
import {chatCompletion, ChatRow} from "../libs/openAi";
import {getChatCompletionProps} from "../libs/airtable";

export type SlackThreadSummaryMessageBody = SqsMessageBody<'thread_summary', SlackMessageAction>


/**
 * 주제 요약 Provider
 * @param payload
 */
export async function pubSummaryMessage(payload: SlackMessageAction) {
  const messageBody: SlackThreadSummaryMessageBody = {
    eventType: 'thread_summary',
    body: payload
  }

  return sendMessage(JSON.stringify(messageBody))
}


/**
 * 주제 요약 Consumer
 * @param body
 */
export async function subSummaryMessage(body: SlackThreadSummaryMessageBody) {
  const payload = body.body
  const originTs = payload.message.thread_ts ?? payload.message_ts

  const { request, ...props } = await getChatCompletionProps('thread_summary')

  const conversationList = await slackWeb.conversations.replies({
    ts: originTs,
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

  const processingMessage = await slackWeb.chat.postMessage({
    thread_ts: originTs,
    text: '주제를 요약하고 있어요. 잠시만 기다려주세요~',
    channel: payload.channel.id
  })

  const response = await chatCompletion({
    request: request ?? '주제 요약',
    chat: contexts,
    ...props
  })

  const responseMessage = response.message?.content ?? '실패'

  if (responseMessage === '실패') {
    try {
      await slackWeb.chat.postMessage({
        thread_ts: payload.message.thread_ts ?? undefined,
        channel: payload.channel.id,
        text: '요약을 생성하는 도중 오류가 발생했습니다. 나중에 다시 시도해주세요.',
      });
    } catch (error) {
      console.error('요약이 실패했다는 Slack message 날리는 도중 에러 발생 :', error);
    }
    return;
  }

  if(processingMessage.ts) {
    await slackWeb.chat.delete({
      ts: processingMessage.ts,
      channel: payload.channel.id,
    })
  }

  await slackWeb.chat.postMessage({
    thread_ts: originTs,
    text: responseMessage,
    channel: payload.channel.id,
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
  })
}
