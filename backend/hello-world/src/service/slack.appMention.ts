/**
 * app_mention service
 * 비즈니스 로직: 봇 언급 (app_mention)시 GPT에 관련 내용 질의 후 응답
 */
import {SlackEventCallback, slackWeb} from "../libs/slack";
import {sendMessage, SqsMessageBody} from "../libs/sqs";
import {chatCompletion} from "../libs/openAi";
import {getChatCompletionProps} from "../libs/airtable";

export type SlackAppMentionMessageBody = SqsMessageBody<'app_mention', SlackEventCallback>

export async function pubAppMention(payload: SlackEventCallback) {
  const messageBody: SlackAppMentionMessageBody = {
    eventType: 'app_mention',
    body: payload
  }
  return sendMessage(JSON.stringify(messageBody))
}

export async function subAppMention(payload: SlackAppMentionMessageBody) {

  const message = payload.body.event.text.replace(/(<@\w+>)/g, '')

  const { request, ...props } = await getChatCompletionProps('app_mention')

  const response = await chatCompletion({
    messages: [
      { role: 'system', content: request },
      { role: 'user', content: message }
    ],
    ...props
  })

  const responseMessage = response.message?.content ?? '실패'

  await slackWeb.chat.postMessage({
    thread_ts: payload.body.event.thread_ts,
    channel: payload.body.event.channel,
    text: responseMessage
  })
}
