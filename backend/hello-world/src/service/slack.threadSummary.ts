/**
 * thread_summary service
 * 비즈니스 로직: 스레드 요약(thread_summary) 실행 시, 스레드 내용을 읽은 후 요약 내용과 추천 동작을 응답
 */
import {sendMessage, SqsMessageBody} from "../libs/sqs";
import {SlackMessageAction, slackWeb} from "../libs/slack";
import {ChatRow, summaryChatContext} from "../libs/openAi";

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

  const response = await summaryChatContext({
    request: '주제 요약',
    context: contexts
  })

  const summaryMessage = response[0].message?.content ?? '요약 실패'

  await slackWeb.chat.postMessage({
    thread_ts: payload.message.thread_ts,
    text: summaryMessage,
    blocks: [
      {
        type: "section",
        text: {
          type: "plain_text",
          text: summaryMessage
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

// export async function slackMessageActionThreadSummary(payload: SlackMessageAction) {
//   console.log('slackMessageActionThreadSummary', JSON.stringify(payload))
//
//   const conversationList = await slackWeb.conversations.replies({
//     ts: payload.message.thread_ts,
//     channel: payload.channel.id
//   })
//
//   const contexts: ChatRow[] = conversationList.messages ? conversationList.messages
//       .map(message => {
//         return {
//           speeches: message.user ?? 'unknown',
//           message: message.text ?? ''
//         }
//       })
//       .filter(msg => msg.speeches !== 'unknown')
//     : []
//
//   const response = await summaryChatContext({
//     request: '주제 요약',
//     context: contexts
//   })
//
//   const summaryMessage = response[0].message?.content ?? '요약 실패'
//
//   await slackWeb.chat.postMessage({
//     thread_ts: payload.message.thread_ts,
//     text: summaryMessage,
//     blocks: [
//       {
//         type: "section",
//         text: {
//           type: "plain_text",
//           text: summaryMessage
//         }
//       },
//       {
//         type: "divider"
//       },
//       {
//         type: "section",
//         text: {
//           type: "mrkdwn",
//           text: "이슈 생성 미리보기"
//         },
//         accessory: {
//           type: "button",
//           text: {
//             type: "plain_text",
//             text: "이슈 생성",
//             emoji: true
//           },
//           value: "issue_preview",
//           action_id: "issue_preview"
//         }
//       }
//     ],
//     channel: payload.channel.id
//   })
// }
