import {SlackMessageAction, slackWeb} from "../libs/slack";
import {sendMessage, SqsMessageBody} from "../libs/sqs";

export type SlackIssueCreateMessageBody = SqsMessageBody<'issue_create', any>

export async function pubIssueCreate(payload: SlackMessageAction) {
  const message: SlackIssueCreateMessageBody = {
    eventType: 'issue_create',
    body: payload
  }

  return sendMessage(JSON.stringify(message))
}

export async function subIssueCreate(data: SlackIssueCreateMessageBody) {
  console.log('slackMessageActionIssueCreate', JSON.stringify(data))

  console.log("payload", JSON.stringify({
    ts: data.body.message.ts,
    channel: data.body.channel.id,
    text: '이슈 등록 완료 (사실 안됨)',
    blocks: [
      {
        "type": "section",
        "text": {
          "type": "mrkdwn",
          "text": '이슈 등록 완료 (사실 안됨)',
        }
      },
      {
        "type": "section",
        "text": {
          "type": "mrkdwn",
          "text": "This is a section block with a button."
        },
        "accessory": {
          "type": "button",
          "text": {
            "type": "plain_text",
            "text": "Click Me",
            "emoji": true
          },
          "value": "click_me_123",
          "url": "https://google.com",
          "action_id": "button-action"
        }
      }
    ]
  }))

  await slackWeb.chat.update({
    ts: data.body.message.ts,
    channel: data.body.channel.id,
    text: '이슈 등록 완료 (사실 안됨)',
    blocks: [
      {
        "type": "section",
        "text": {
          "type": "mrkdwn",
          "text": '이슈 등록 완료 (사실 안됨)',
        }
      },
      {
        "type": "section",
        "text": {
          "type": "mrkdwn",
          "text": "대충 이슈 번호"
        },
        "accessory": {
          "type": "button",
          "text": {
            "type": "plain_text",
            "text": "열기",
            "emoji": true
          },
          "value": "click_me_123",
          "url": "https://google.com",
          "action_id": "button-action"
        }
      }
    ]
  })
}
