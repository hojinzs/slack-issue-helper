import { WebClient } from "@slack/web-api";
import * as process from "process";
import {RequestHandler} from "express";

export interface SlackUser {
  id: string;
  username: string
  team_id: string
}

export interface SlackTeam {
  id: string
  domain: string
}

export interface SlackChannel {
  id: string
  name: string
}

export interface SlackShortcutRequest {
  payload: SlackShortcutPayload
}

export interface SlackShortcutPayload {
  type: string;
  token: string;
  action_ts: string;
  team: SlackTeam
  user: SlackUser
  is_enterprise_install: boolean;
  enterprise: null | any;
  callback_id: string;
  trigger_id: string
}

export interface SlackMessageAction extends SlackShortcutPayload {
  channel: SlackChannel
  response_url: string;
  message_ts: string;
  message: SlackMessage
}

export interface SlackMessage {
  client_msg_id: string;
  type: string;
  text: string;
  user: string;
  ts: string;
  blocks: Array<SlackBlock>
  team: string
  thread_ts: string
  reply_count: number;
  reply_users_count: number;
  latest_reply: string;
  reply_users: string[];
  is_locked: boolean;
  subscribed: boolean;
  last_read: string;
}

export interface SlackBlock {
  type: string
  block_id: string
  elements: Array<SlackBlockElement>
}

export interface SlackBlockElement {
  type: string
  elements: Array<{
    type: string
    text: string
  }>
}

export interface SlackEvent {
  client_msg_id: string;
  type: string;
  text: string;
  user: string;
  ts: string;
  blocks: Array<{
    type: string;
    block_id: string;
    elements: Array<{
      type: string;
      user_id?: string;
      text?: string;
    }>;
  }>;
  team: string;
  channel: string;
  event_ts: string;
}

export interface SlackAuthorization {
  enterprise_id: string | null;
  team_id: string;
  user_id: string;
  is_bot: boolean;
  is_enterprise_install: boolean;
}

export interface SlackEventCallback {
  token: string;
  team_id: string;
  api_app_id: string;
  event: SlackEvent;
  type: string;
  event_id: string;
  event_time: number;
  authorizations: SlackAuthorization[];
  is_ext_shared_channel: boolean;
  event_context: string;
}


export const slackWeb = new WebClient(process.env.SLACK_TOKEN)

export const verifyingRequest: RequestHandler = (req, res, next) => {

  const signature = req.header('x-slack-signature')
  const timestamp = req.header('x-slack-request-timestamp')

  console.log("signature : ", signature, 'timestamp : ', timestamp)

  if(signature && timestamp) {
    next()
  } else {
    res
      .status(403)
      .send('invalid header')
  }
}
