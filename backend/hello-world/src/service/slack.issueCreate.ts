import {SlackMessageAction, slackWeb} from "../libs/slack";
import {sendMessage, SqsMessageBody} from "../libs/sqs";
import {JiraClient, JiraIssueCreatePayload} from "../libs/jira";
import * as process from "process";

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

  const jira = JiraClient.create({
    host: process.env.JIRA_HOST || "",
    username: process.env.JIRA_USERNAME || "",
    token: process.env.JIRA_API_TOKEN || ""
  })

  const issue = await jira.createIssue(extractFormData(data.body.state))

  await slackWeb.chat.update({
    ts: data.body.message.ts,
    channel: data.body.channel.id,
    text: `이슈 등록 완료 (${issue.key})`,
    blocks: [
      {
        "type": "section",
        "text": {
          "type": "mrkdwn",
          "text": `이슈 등록 완료 (${issue.key})`,
        }
      },
      {
        "type": "section",
        "text": {
          "type": "mrkdwn",
          "text": issue.key
        },
        "accessory": {
          "type": "button",
          "text": {
            "type": "plain_text",
            "text": "열기",
            "emoji": true
          },
          "value": issue.key,
          "url": `${process.env.JIRA_HOST}/jira/software/projects/IS/boards/1?selectedIssue=${issue.key}`,
          "action_id": "button-action"
        }
      }
    ]
  })
}

export function extractFormData(state: any): JiraIssueCreatePayload {

  const projectKey = Object.keys(state.values.project)[0]
  const issueKey = Object.keys(state.values.issue)[0]

  const project = state.values.project[projectKey].selected_option.value
  const issue = state.values.issue[issueKey].selected_option.value
  const title = state.values.title['plain_text_input-action'].value
  const description = state.values.description['plain_text_input-action'].value

  return {
    projectId: project,
    issueTypeId: issue,
    summary: title,
    description: description
  }
}
