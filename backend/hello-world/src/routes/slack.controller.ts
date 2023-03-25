import {Router} from "express";
import {
  SlackBlockAction,
  SlackEventCallback,
  SlackMessageAction,
  SlackShortcutPayload,
  slackWeb,
  verifyingRequest
} from "../libs/slack";
import {summaryChatContext} from "../libs/openAi";
import {
  slackEventAppMentionService,
  slackMessageActionIssueCreate,
  slackMessageActionThreadSummary
} from "./slack.service";

export const slackController = Router()

slackController.get('/', (req, res) => {
  res
    .status(200)
    .send('done')
})

slackController.post(
  '/hello',
  async (req, res) => {
    console.log('request.slack.hello', JSON.stringify(req.body))

    const requestMessage = req.body.text

    await slackWeb.chat.postMessage({
      text: `'${requestMessage}'라고 말씀하셨어요. 잠시만 기다려주세요!`,
      channel: req.body.channel_id
    })

    const result = await summaryChatContext({
      request: '발랄한 막내 느낌으로 질문에 답변',
      context: [
        { speeches: req.body.user_id, message: requestMessage }
      ]
    })

    const response = result[0].message?.content

    await slackWeb.chat.postMessage({
      text: response,
      channel: req.body.channel_id
    })

    res
      .status(200)
      .send('')
  }
)

slackController.post('/shortcut', async (req, res) => {
  console.log("request.slack.shortcut", JSON.stringify(req.body))

  const request = JSON.parse(req.body.payload) as SlackShortcutPayload

  if (request.type === 'block_actions') {
    const blockActionsPayload = request as SlackBlockAction
    const actionId = blockActionsPayload.actions[0].action_id

    switch (actionId) {
      case 'issue_create':
        await slackMessageActionIssueCreate(request as SlackMessageAction)
        break
    }

  } else {
    switch (request.callback_id) {
      case 'thread_summary':
        await slackMessageActionThreadSummary(request as SlackMessageAction)
        break;
      default:
        console.log("global action => ", JSON.stringify(request))
        break;
    }
  }

  res
    .status(200)
    .send('summary')
})

slackController.post(
  '/event',
  verifyingRequest,
  async (req, res) => {
    console.log("request.slack.event", JSON.stringify(req.body))

    const payload = req.body as SlackEventCallback

    switch (payload.event.type) {
      case 'app_mention':
        await slackEventAppMentionService(payload)
        break;
    }

    res
      .status(200)
      .json({
        challenge: req.body.challenge
      })
  }
)
