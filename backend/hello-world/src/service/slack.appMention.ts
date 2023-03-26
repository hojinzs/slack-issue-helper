/**
 * app_mention service
 * 비즈니스 로직: 봇 언급 (app_mention)시 GPT에 관련 내용 질의 후 응답
 */
import {SlackEventCallback, slackWeb} from "../libs/slack";
import {sendMessage, SqsMessageBody} from "../libs/sqs";
import {summaryChatContext} from "../libs/openAi";

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

  const response = await summaryChatContext({
    request: message
  })

  const responseMessage = response[0].message?.content ?? '요약 실패'

  await slackWeb.chat.postMessage({
    thread_ts: payload.body.event.thread_ts,
    channel: payload.body.event.channel,
    text: responseMessage
  })
}
