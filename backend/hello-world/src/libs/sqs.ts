import {SQS} from "aws-sdk";
import * as process from "process";

export const sqs = new SQS()

export async function sendMessage(data: string) {

  // const queueUrl = await sqs.getQueueUrl({
  //   QueueName: 'MyQueue'
  // }).promise()
  //
  // if(!queueUrl.QueueUrl) {
  //   throw new Error('queue url undefined')
  // }

  console.log("sqsSendMessage.data", data)

  const response = await sqs.sendMessage({
    MessageBody: data,
    QueueUrl: process.env.AWS_QUEUE_URL
  }).promise()

  console.log("response => ", response)

  return response
}


export interface SqsMessageBody<P extends string, T> {
  eventType: P
  body: T
}
