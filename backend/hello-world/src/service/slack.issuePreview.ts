import {SlackMessageAction, slackWeb} from "../libs/slack";
import {summaryChatContext} from "../libs/openAi";
import {Block, KnownBlock} from "@slack/web-api";
import {sendMessage, SqsMessageBody} from "../libs/sqs";

export type SlackIssuePreviewMessageBody = SqsMessageBody<'issue_preview', SlackMessageAction>

const dummyProjects = [
  { id: 'project1', name: '프로젝트 1'},
  { id: 'project2', name: '프로젝트 2'},
  { id: 'project3', name: '프로젝트 3'},
]

export async function pubIssuePreview(payload: SlackMessageAction) {
  const messageBody: SlackIssuePreviewMessageBody = {
    eventType: 'issue_preview',
    body: payload
  }

  return sendMessage(JSON.stringify(messageBody))
}

export async function subIssuePreview(body: SlackIssuePreviewMessageBody) {
  const payload = body.body

  const response = await summaryChatContext({
    request: `요약 내용으로 일감 생성. 아래 형식으로만 출력
    요약: ${payload.message.text},
    형식: { "title": ###, "description": ### }
    `,
    option: {
      temperature: 0
    }
  })

  const issue = JSON.parse(response[0].message.content) as { title: string, description: string }


  await slackWeb.chat.postMessage({
    thread_ts: payload.message.thread_ts ?? undefined,
    channel: payload.channel.id,
    text: JSON.stringify(issue),
    blocks: generateJiraIssueCreateForm({
      projects: dummyProjects,
      titleDraft: issue.title,
      descriptionDraft: issue.description
    })
  })
}

export function generateJiraIssueCreateForm(props: {
  projects: { id: string, name: string }[],
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
    {
      type: 'input',
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
    {
      type: "input",
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
    {
      type: "input",
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
