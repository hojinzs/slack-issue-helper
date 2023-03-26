import {SlackMessageAction} from "../libs/slack";
import {sendMessage, SqsMessageBody} from "../libs/sqs";


export type SlackIssueCreateMessageBody = SqsMessageBody<'issue_create', SlackMessageAction>

export async function pubIssueCreate(payload: SlackMessageAction) {
  const message: SlackIssueCreateMessageBody = {
    eventType: 'issue_create',
    body: payload
  }

  return sendMessage(JSON.stringify(message))
}

export async function subIssueCreate(data: SlackIssueCreateMessageBody) {
  console.log('slackMessageActionIssueCreate', JSON.stringify(data))
}
