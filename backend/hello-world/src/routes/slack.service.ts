import {SlackEventCallback, SlackMessageAction, slackWeb} from "../libs/slack";
import {ChatRow, summaryChatContext} from "../libs/openAi";
import {Block, KnownBlock} from "@slack/web-api";


export async function slackMessageActionThreadSummary(payload: SlackMessageAction) {
  console.log('slackMessageActionThreadSummary', JSON.stringify(payload))

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
          value: "generate issue",
          action_id: "issue_create"
        }
      }
    ],
    channel: payload.channel.id
  })
}

const dummyProjects = [
  { id: 'project1', name: '프로젝트 1'},
  { id: 'project2', name: '프로젝트 2'},
  { id: 'project3', name: '프로젝트 3'},
]

export async function slackMessageActionIssueCreate(payload: SlackMessageAction) {
  console.log('slackMessageActionIssueCreate', JSON.stringify(payload))

  const response = await summaryChatContext({
    request: `요약 내용으로 일감 생성. 아래 형식으로만 출력
    요약내용: ${payload.message.text},
    형식: { "title": ###, "description": ### }
    `,
    option: {
      temperature: 0
    }
  })

  const issue = JSON.parse(response[0].message.content) as { title: string, description: string }

  console.log("issue => ", issue)

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
        url: "https://google.com",
        action_id: "button-action"
      }
    }
  ]
}


export async function slackEventAppMentionService(payload: SlackEventCallback) {
  console.log('slackEventAppMentionService', payload)
}
