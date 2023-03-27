import Airtable, { type FieldSet, type Record } from "airtable";
import {ChatCompletionProps} from "./openAi";

export const issueMaker = new Airtable({
  apiKey: process.env.AIRTABLE_TOKEN,
})
  .base(process.env.AIRTABLE_BASE)

export interface EventsFieldSet extends FieldSet {
  "name": string
  "prompt": string
  "temperature": number
  "presence_penalty": number
  "frequency_penalty": number
  "top_p": number
  "stop": string
  "max_tokens": number
}

export const eventFields = [
  'name',
  'prompt',
  'temperature',
  'presence_penalty',
  'frequency_penalty',
  'top_p',
  'stop',
  'max_tokens'
]

export const eventsTable = issueMaker.table<EventsFieldSet>('events')

export async function getChatCompletionProps(eventName: string) {

  const eventConfig = await eventsTable
    .select({
      filterByFormula: `{name} = "${eventName}"`,
      maxRecords: 1,
      fields: eventFields
    })
    .all()

  const config = eventConfig.length > 0 ? eventConfig[0] : undefined

  return config ? castChatCompletionProps(config) : undefined
}

function castChatCompletionProps(record: Record<EventsFieldSet>): Partial<ChatCompletionProps> {
  return {
    request: record?.get('prompt'),
    temperature: record?.get('temperature'),
    presence_penalty: record?.get('presence_penalty'),
    frequency_penalty: record?.get('frequency_penalty'),
    top_p: record?.get('top_p'),
    stop: record?.get('stop'),
    max_tokens: record?.get('max_tokens')
  }
}
