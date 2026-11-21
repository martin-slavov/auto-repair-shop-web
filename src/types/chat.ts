export type ChatRole = 'USER' | 'ASSISTANT'

export interface ChatMessage {
  role: ChatRole
  content: string
}

export interface ChatRequest {
  message: string
  history?: ChatMessage[]
}

export interface ChatResponse {
  reply: string
}
