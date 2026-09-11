import type { ChatMessage } from '../shared/types'
import type { QwenClient, StreamChatRequest } from './client'

export const MOCK_REPLY_MARKER = '【模拟】'

export function mockReplyFor(messages: ChatMessage[]): string {
  const lastUser = [...messages].reverse().find((item) => item.role === 'user')
  const heard = lastUser?.content?.trim() || '（空）'
  return `${MOCK_REPLY_MARKER}喵～我听到了「${heard}」。这是本地假回复，没有调用通义千问。`
}

export function createMockQwenClient(): QwenClient {
  return {
    kind: 'mock',
    async streamChat(request: StreamChatRequest): Promise<string> {
      const reply = mockReplyFor(request.messages)
      const parts = [MOCK_REPLY_MARKER, reply.slice(MOCK_REPLY_MARKER.length)]
      for (const part of parts) {
        request.signal?.throwIfAborted()
        request.onDelta(part)
      }
      return reply
    }
  }
}
