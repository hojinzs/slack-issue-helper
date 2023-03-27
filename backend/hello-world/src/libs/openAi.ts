import {
  ChatCompletionRequestMessage,
  ChatCompletionRequestMessageRoleEnum,
  Configuration,
  CreateChatCompletionRequest, CreateChatCompletionResponseChoicesInner,
  OpenAIApi
} from "openai";

const configuration = new Configuration({
  apiKey: process.env.OPEN_AI_SECRET_KEY,
  organization: process.env.OPEN_AI_ORG_ID
})

export const openAi = new OpenAIApi(configuration)

export interface ChatRow {
  speeches: string,
  message: string
}

export interface ChatCompletionProps extends Partial<CreateChatCompletionRequest> {
  request?: string
  chat?: ChatRow[]
}

export async function chatCompletion({ request, chat, ...props}: ChatCompletionProps): Promise<CreateChatCompletionResponseChoicesInner> {

  const chatMessages: ChatCompletionRequestMessage[]|undefined = chat?.map(chat => ({
    role: 'user' as ChatCompletionRequestMessageRoleEnum,
    name: chat.speeches,
    content: chat.message
  })) || []

  const response = await openAi.createChatCompletion({
    model: 'gpt-3.5-turbo',
    messages: request
      ? [...chatMessages, { role: 'system', content: request }]
      : [...chatMessages],
    ...props
  })

  return response.data.choices[0]
}
