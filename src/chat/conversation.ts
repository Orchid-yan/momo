import type { ChatMessage, ChatResult } from '../shared/types'

export interface UiMessage {
  id: string
  role: 'user' | 'assistant' | 'error'
  content: string
}

export function startTurn(
  messages: UiMessage[],
  text: string,
  now = Date.now()
): { messages: UiMessage[]; assistantId: string; history: ChatMessage[] } {
  const userMessage: UiMessage = { id: `u-${now}`, role: 'user', content: text }
  const assistantId = `a-${now}`
  const next = [
    ...messages,
    userMessage,
    { id: assistantId, role: 'assistant' as const, content: '' }
  ]
  const history: ChatMessage[] = [...messages, userMessage]
    .filter((item) => item.role === 'user' || item.role === 'assistant')
    .map((item) => ({ role: item.role as 'user' | 'assistant', content: item.content }))
    .filter((item) => item.content.trim().length > 0)
  return { messages: next, assistantId, history }
}

export function appendDelta(
  messages: UiMessage[],
  assistantId: string,
  text: string
): UiMessage[] {
  return messages.map((item) =>
    item.id === assistantId ? { ...item, content: item.content + text } : item
  )
}

export function completeTurn(
  messages: UiMessage[],
  assistantId: string,
  result: ChatResult,
  now = Date.now()
): UiMessage[] {
  if (result.ok) {
    if (!result.content) {
      return messages
    }
    return messages.map((item) =>
      item.id === assistantId && item.content.trim() === ''
        ? { ...item, content: result.content as string }
        : item
    )
  }
  const withoutEmpty = messages.filter(
    (item) => !(item.id === assistantId && item.content.trim() === '')
  )
  return [
    ...withoutEmpty,
    {
      id: `e-${now}`,
      role: 'error',
      content: result.error || '发送失败，请稍后重试。'
    }
  ]
}
