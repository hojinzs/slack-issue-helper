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

  if (responseMessage === '실패') {
    try {
      await slackWeb.chat.postMessage({
        thread_ts: payload.body.event.thread_ts,
        channel: payload.body.event.channel,
        text: '답변을 생성하는 도중 오류가 발생했습니다. 다시 이야기 해주세요.',
      });
    } catch (error) {
      console.error('답변을 생성하는 도중 실패했다는 Slack message 날리는 도중 에러 발생 :', error);
    }
    return;
  }

  try {
    await slackWeb.chat.postMessage({
      thread_ts: payload.body.event.thread_ts,
      channel: payload.body.event.channel,
      text: responseMessage,
    });
  } catch (error) {
    console.error('쳇봇 답변은 제대로 왔으나 슬랙 메세지로 보내는 것은 실패함:', error);
     
    try {
      await slackWeb.chat.postMessage({
      thread_ts: payload.body.event.thread_ts,
      channel: payload.body.event.channel,
      text: '죄송합니다. 저의 답변 메시지를 슬랙에 보내는 중에 문제가 발생했습니다. 나중에 다시 시도해주세요.',
      });
    } catch(error){
      console.error('답변 메세지를 보내는 중에 실패했다는 메세지를 슬랙에 Sending 하다가 실패 :', error);
    }
  }
}