import {SlackEventCallback, SlackMessageAction, slackWeb} from "../libs/slack";
import {ChatRow, summaryChatContext} from "../libs/openAi";


export async function slackShortcutThreadSummaryService(payload: SlackMessageAction) {
  console.log('shortcutThreadSummaryService', JSON.stringify(payload))

  const conversationList = await slackWeb.conversations.replies({
    ts: payload.message.ts,
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

  const response = await summaryChatContext({
    request: '주제 요약',
    context: contexts
  })

  const summaryMessage = response[0].message?.content ?? '요약 실패'

  await slackWeb.chat.postMessage({
    thread_ts: payload.message.thread_ts,
    text: summaryMessage,
    channel: payload.channel.id
  })
}

export async function slackEventAppMentionService(payload: SlackEventCallback) {
  console.log('slackEventAppMentionService', payload)
}
