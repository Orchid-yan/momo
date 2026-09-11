import type { ChatMessage } from '../shared/types'

export interface StreamChatRequest {
  apiKey: string
  baseURL: string
  model: string
  messages: ChatMessage[]
  signal?: AbortSignal
  onDelta: (text: string) => void
}

export interface QwenClient {
  readonly kind: 'dashscope' | 'mock'
  streamChat(request: StreamChatRequest): Promise<string>
}
