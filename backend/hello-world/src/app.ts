import Express, { json, urlencoded } from 'express'
import {slackController} from "./routes/slack.controller";

const app = Express()

app.use(json())
app.use(urlencoded({ extended: true }))

app.use('/slack', slackController)

export default app
