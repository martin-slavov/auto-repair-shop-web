import type { ChatRequest, ChatResponse } from '../types/chat'
import { apiPost } from './client'

export function sendChatMessage(body: ChatRequest): Promise<ChatResponse> {
  return apiPost<ChatResponse>('/api/chat', body)
}
