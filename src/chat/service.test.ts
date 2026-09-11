import { afterEach, describe, expect, it, vi } from 'vitest'
import { appendDelta, completeTurn, startTurn } from './conversation'
import { MISSING_API_KEY, sendChatMessage } from './service'
import { createMockQwenClient } from '../qwen/mock'
import { DEFAULT_BASE_URL, DEFAULT_MODEL } from '../shared/types'

describe('sendChatMessage wiring', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('returns a mock reply without touching the network', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    const deltas: string[] = []
    const result = await sendChatMessage({
      messages: [{ role: 'user', content: '你好呀' }],
      settings: {
        apiKey: 'sk-mocklocalkey99',
        baseURL: DEFAULT_BASE_URL,
        model: DEFAULT_MODEL
      },
      client: createMockQwenClient(),
      onDelta: (text) => deltas.push(text)
    })

    expect(result.ok).toBe(true)
    expect(result.content).toContain('【模拟】')
    expect(result.content).toContain('你好呀')
    expect(deltas.length).toBeGreaterThan(0)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('refuses to call DashScope when no API key is configured', async () => {
    const result = await sendChatMessage({
      messages: [{ role: 'user', content: 'hi' }],
      settings: { apiKey: '', baseURL: DEFAULT_BASE_URL, model: DEFAULT_MODEL },
      client: { kind: 'dashscope', streamChat: async () => 'should-not-run' },
      onDelta: () => undefined
    })
    expect(result.ok).toBe(false)
    expect(result.error).toBe(MISSING_API_KEY)
  })
})

describe('conversation UI state', () => {
  it('shows the assistant reply after streaming deltas', () => {
    const started = startTurn([], '你好呀', 1)
    const streamed = appendDelta(started.messages, started.assistantId, '【模拟】喵')
    const finished = completeTurn(streamed, started.assistantId, {
      ok: true,
      content: '【模拟】喵'
    })
    const assistant = finished.find((item) => item.role === 'assistant')
    expect(assistant?.content).toBe('【模拟】喵')
  })

  it('surfaces errors as a chat bubble', () => {
    const started = startTurn([], '你好呀', 2)
    const finished = completeTurn(started.messages, started.assistantId, {
      ok: false,
      error: '还没有设置 API Key'
    })
    expect(finished.some((item) => item.role === 'error')).toBe(true)
  })
})
