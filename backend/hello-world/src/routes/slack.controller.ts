import {Router} from "express";
import {verifyingRequest} from "../libs/slack";

export const slackController = Router()

slackController.get('/', (req, res) => {
  res
    .status(200)
    .send('done')
})

slackController.post('/hello', (req, res) => {
  res
    .status(200)
    .send('done')
})

slackController.post(
  '/event',
  verifyingRequest,
  (req, res) => {

    const payload = req.body

    console.log("payload => ", payload)

    res
      .status(200)
      .json({
        challenge: req.body.challenge
      })
  }
)
