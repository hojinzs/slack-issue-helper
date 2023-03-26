import {
  APIGatewayProxyResult,
  Context,
  SQSEvent
} from "aws-lambda";
import {SqsMessageBody} from "./libs/sqs";
import {SlackAppMentionMessageBody, subAppMention} from "./service/slack.appMention";
import {SlackThreadSummaryMessageBody, subSummaryMessage} from "./service/slack.threadSummary";
import {SlackIssuePreviewMessageBody, subIssuePreview} from "./service/slack.issuePreview";
import {SlackIssueCreateMessageBody, subIssueCreate} from "./service/slack.issueCreate";

const handler = async (event: SQSEvent, context: Context): Promise<APIGatewayProxyResult> => {

  const body = JSON.parse(event.Records[0].body) as SqsMessageBody<string, any>

  switch (body.eventType) {
    case 'app_mention':
      await subAppMention(body as SlackAppMentionMessageBody)
      break;
    case 'thread_summary':
      await subSummaryMessage(body as SlackThreadSummaryMessageBody)
      break;
    case 'issue_preview':
      await subIssuePreview(body as SlackIssuePreviewMessageBody)
      break;
    case 'issue_create':
      await subIssueCreate(body as SlackIssueCreateMessageBody)
      break;
    default:
      break;
  }

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: 'SQS event processed.',
      input: event,
    }),
  }
}

export {
  handler
}
