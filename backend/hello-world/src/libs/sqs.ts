import {SQS} from "aws-sdk";
import * as process from "process";

export const sqs = new SQS()

export const queueUrl = `https://sqs.${process.env.AWS_REGION}.amazonaws.com/${process.env.AWS_ACCOUNT_ID}/${process.env.AWS_QUEUE_NAME}`

export async function sendMessage(data: string) {

  console.log("sqsSendMessage.data", data)

  const response = await sqs.sendMessage({
    MessageBody: data,
    QueueUrl: queueUrl
  }).promise()

  return response
}


export interface SqsMessageBody<P extends string, T> {
  eventType: P
  body: T
}
