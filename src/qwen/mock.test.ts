import { afterEach, describe, expect, it, vi } from 'vitest'
import { createQwenClient, isMockQwen } from './factory'
import { createMockQwenClient, MOCK_REPLY_MARKER, mockReplyFor } from './mock'

describe('mock Qwen client', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('streams a local reply and never calls fetch', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    const client = createMockQwenClient()
    const deltas: string[] = []
    const full = await client.streamChat({
      apiKey: 'sk-should-not-be-sent',
      baseURL: 'https://example.invalid',
      model: 'qwen-plus',
      messages: [{ role: 'user', content: '你好呀' }],
      onDelta: (text) => deltas.push(text)
    })

    expect(client.kind).toBe('mock')
    expect(full).toContain(MOCK_REPLY_MARKER)
    expect(full).toContain('你好呀')
    expect(deltas.join('')).toBe(full)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('createQwenClient uses mock when MOMO_MOCK_QWEN=1', () => {
    expect(isMockQwen({ MOMO_MOCK_QWEN: '1' })).toBe(true)
    expect(createQwenClient({ MOMO_MOCK_QWEN: '1' }).kind).toBe('mock')
    expect(createQwenClient({}).kind).toBe('dashscope')
  })

  it('echoes the user text inside the canned reply', () => {
    expect(mockReplyFor([{ role: 'user', content: '摸摸头' }])).toContain('摸摸头')
  })
})
