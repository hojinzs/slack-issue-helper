import { WebClient } from "@slack/web-api";
import * as process from "process";
import {RequestHandler} from "express";

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
