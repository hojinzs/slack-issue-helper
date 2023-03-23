import {ChatCompletionRequestMessage, Configuration, CreateChatCompletionRequest, OpenAIApi} from "openai";

const configuration = new Configuration({
  apiKey: process.env.OPEN_AI_SECRET_KEY,
  organization: process.env.OPEN_AI_ORG_ID
})

export const openAi = new OpenAIApi(configuration)

export interface ChatRow {
  speeches: string,
  message: string
}

export interface SummaryChatContextProps {
  context: ChatRow[]
  request?: string
  option?: Partial<CreateChatCompletionRequest>
}

export async function summaryChatContext({
  context,
  request,
  option
}: SummaryChatContextProps) {

  const messages: ChatCompletionRequestMessage[] = context.map(chat => ({ role: 'user', name: chat.speeches, content: chat.message }))
  const response = await openAi.createChatCompletion({
    model: 'gpt-3.5-turbo',
    messages: [
      ...messages,
      { role: 'system', content: request ?? '주제 요약' }
    ],
    ...option
  })

  return response.data.choices
}
