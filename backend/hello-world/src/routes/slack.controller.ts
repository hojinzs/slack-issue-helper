import {Router} from "express";
import {
  SlackBlockAction,
  SlackEventCallback,
  SlackMessageAction,
  SlackShortcutPayload,
  verifyingRequest
} from "../libs/slack";
import {pubAppMention} from "../service/slack.appMention";
import {pubSummaryMessage} from "../service/slack.threadSummary";
import {pubIssuePreview} from "../service/slack.issuePreview";
import {pubIssueCreate} from "../service/slack.issueCreate";

export const slackController = Router()

slackController.get('/', (req, res) => {
  res
    .status(200)
    .send('done')
})

slackController.post('/shortcut', async (req, res) => {
  console.log("request.slack.shortcut", JSON.stringify(req.body))

  const request = JSON.parse(req.body.payload) as SlackShortcutPayload

  if (request.type === 'block_actions') {
    const blockActionsPayload = request as SlackBlockAction
    const actionId = blockActionsPayload.actions[0].action_id

    switch (actionId) {
      case 'issue_preview':
        await pubIssuePreview(request as SlackMessageAction)
        break
      case 'issue_create':
        await pubIssueCreate(request as SlackMessageAction)
        break;
    }

  } else {

    switch (request.callback_id) {
      case 'thread_summary':
        await pubSummaryMessage(request as SlackMessageAction)
        break;
      default:
        console.log("global action => ", JSON.stringify(request))
        break;
    }
  }

  res
    .status(200)
    .send('ok')
})

slackController.post(
  '/event',
  verifyingRequest,
  async (req, res) => {
    console.log("request.slack.event", JSON.stringify(req.body))

    const payload = req.body as SlackEventCallback

    switch (payload.event.type) {
      case 'app_mention':
        await pubAppMention(payload)
        break;
    }

    res
      .status(200)
      .json({
        challenge: req.body.challenge
      })
  }
)
