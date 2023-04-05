import {SlackMessageAction, slackWeb} from "../libs/slack";
import {chatCompletion} from "../libs/openAi";
import {Block, KnownBlock} from "@slack/web-api";
import {sendMessage, SqsMessageBody} from "../libs/sqs";
import {getChatCompletionProps} from "../libs/airtable";
import {JiraClient} from "../libs/jira";
import * as process from "process";

export type SlackIssuePreviewMessageBody = SqsMessageBody<'issue_preview', SlackMessageAction>

export async function pubIssuePreview(payload: SlackMessageAction) {
  const messageBody: SlackIssuePreviewMessageBody = {
    eventType: 'issue_preview',
    body: payload
  }

  return sendMessage(JSON.stringify(messageBody))
}

export async function subIssuePreview(body: SlackIssuePreviewMessageBody) {
  const payload = body.body

  const placeholderMsg = await slackWeb.chat.postMessage({
    thread_ts: payload.message.thread_ts ?? undefined,
    channel: payload.channel.id,
    text: '이슈 생성을 위한 미리보기를 만들고 있어요. 잠시만 기다려주세요'
  })

  const summaryText = payload.message.text

  const { request, ...props } = await getChatCompletionProps('issue_preview')

  const response = await chatCompletion({
    request: `${request}
    아래 형식으로만 출력
    - 요약: ${summaryText},
    - 형식: { "title": ###, "description": ### }`,
    ...props
  })

  const responseMessage = response.message?.content

  console.log("response message => ", responseMessage)

  if(placeholderMsg.ts) {
    await slackWeb.chat.delete({
      ts: placeholderMsg.ts,
      channel: placeholderMsg.channel ?? payload.channel.id
    })
  }

  if(!responseMessage) {
    await slackWeb.chat.postMessage({
      thread_ts: payload.message.thread_ts ?? undefined,
      channel: payload.channel.id,
      text: '이슈 미리보기 생성 실패'
    })
  } else {
    const issue = JSON.parse(`${responseMessage.replaceAll('\n','')}`) as { title: string, description: string }

    const jira = JiraClient.create({
      host: process.env.JIRA_HOST,
      username: process.env.JIRA_USERNAME,
      token: process.env.JIRA_API_TOKEN
    })

    const [
      projects,
      issueTypes
    ] = await Promise.all([
      jira.getAllProjects(),
      jira.getIssueTypes()
    ])

    await slackWeb.chat.postMessage({
      thread_ts: payload.message.thread_ts ?? undefined,
      channel: payload.channel.id,
      text: '이슈 생성 미리보기: '+issue.title,
      blocks: generateJiraIssueCreateForm({
        projects: projects.map(proj => ({ id: proj.id, name: proj.name })),
        issueTypes: issueTypes.map(types => ({ id: types.id, name: types.name })),
        titleDraft: issue.title,
        descriptionDraft: issue.description
      })
    })
  }
}

export function generateJiraIssueCreateForm(props: {
  projects: { id: string, name: string }[],
  issueTypes: { id: string, name: string}[],
  titleDraft: string
  descriptionDraft: string,
}): Array<Block|KnownBlock> {
  return [
    {
      type: "section",
      text: {
        type: "plain_text",
        text: "이슈 생성 미리보기",
        emoji: true
      }
    },
    // Project
    {
      type: 'input',
      block_id: 'project',
      label: {
        type: "plain_text",
        text: "프로젝트",
        emoji: true
      },
      element: {
        type: "static_select",
        placeholder: {
          type: "plain_text",
          text: "프로젝트 선택",
          emoji: true
        },
        options: props.projects.map(project => ({
          text: {
            type: 'plain_text',
            text: project.name,
            emoji: true
          },
          value: project.id
        }))
      }
    },
    // Issue Types
    {
      type: 'input',
      block_id: 'issue',
      label: {
        type: "plain_text",
        text: "유형",
        emoji: true
      },
      element: {
        type: "static_select",
        placeholder: {
          type: "plain_text",
          text: "이슈 유형 선택",
          emoji: true
        },
        options: props.issueTypes.map(type => ({
          text: {
            type: 'plain_text',
            text: type.name,
            emoji: true
          },
          value: type.id
        }))
      }
    },
    // Project Title
    {
      type: "input",
      block_id: 'title',
      element: {
        type: "plain_text_input",
        initial_value: props.titleDraft,
        action_id: "plain_text_input-action"
      },
      label: {
        type: "plain_text",
        text: "제목",
        emoji: true
      }
    },
    // Project Description
    {
      type: "input",
      block_id: 'description',
      element: {
        type: "plain_text_input",
        initial_value: props.descriptionDraft,
        multiline: true,
        action_id: "plain_text_input-action"
      },
      label: {
        type: "plain_text",
        text: "내용",
        emoji: true
      }
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: "위 내용으로 이슈를 생성합니다"
      },
      accessory: {
        type: "button",
        text: {
          type: "plain_text",
          text: "등록",
          emoji: true
        },
        value: "click_me_123",
        action_id: "issue_create"
      }
    }
  ]
}
