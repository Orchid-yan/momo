import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  buildChatCompletionsUrl,
  parseDashScopeError,
  parseSseLine,
  streamChat,
  SYSTEM_PROMPT
} from './dashscope'

describe('parseSseLine', () => {
  it('extracts delta content from OpenAI-compatible SSE', () => {
    const line = 'data: {"choices":[{"delta":{"content":"喵"},"index":0}]}'
    expect(parseSseLine(line)).toBe('喵')
  })

  it('ignores [DONE] and empty lines', () => {
    expect(parseSseLine('data: [DONE]')).toBeNull()
    expect(parseSseLine('')).toBeNull()
    expect(parseSseLine(': keep-alive')).toBeNull()
  })
})

describe('parseDashScopeError', () => {
  it('maps invalid key to a Chinese hint', () => {
    const body = JSON.stringify({
      error: { message: 'Incorrect API key provided', code: 'invalid_api_key' }
    })
    expect(parseDashScopeError(401, body)).toContain('API Key')
  })

  it('hints when the base URL is wrong', () => {
    expect(parseDashScopeError(404, 'not found')).toContain('Base URL')
  })
})

describe('buildChatCompletionsUrl', () => {
  it('joins /chat/completions without duplicating slashes', () => {
    expect(
      buildChatCompletionsUrl('https://dashscope.aliyuncs.com/compatible-mode/v1/')
    ).toBe('https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions')
  })
})

describe('system prompt', () => {
  it('identifies Momo without surveillance claims', () => {
    expect(SYSTEM_PROMPT).toContain('Momo')
    expect(SYSTEM_PROMPT).toMatch(/录音|偷看/)
  })
})

describe('streamChat (mocked HTTP only, never DashScope)', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('posts to the OpenAI-compatible endpoint and streams text', async () => {
    const chunks = [
      'data: {"choices":[{"delta":{"content":"你好"}}]}\n\n',
      'data: {"choices":[{"delta":{"content":"呀"}}]}\n\n',
      'data: [DONE]\n\n'
    ]
    const encoder = new TextEncoder()
    let i = 0
    const body = new ReadableStream<Uint8Array>({
      pull(controller) {
        if (i < chunks.length) {
          controller.enqueue(encoder.encode(chunks[i]))
          i += 1
        } else {
          controller.close()
        }
      }
    })

    const fetchMock = vi.fn().mockResolvedValue(
      new Response(body, {
        status: 200,
        headers: { 'Content-Type': 'text/event-stream' }
      })
    )
    vi.stubGlobal('fetch', fetchMock)

    const deltas: string[] = []
    const full = await streamChat({
      apiKey: 'sk-test',
      baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
      model: 'qwen-plus',
      messages: [{ role: 'user', content: 'hi' }],
      onDelta: (text) => deltas.push(text)
    })

    expect(full).toBe('你好呀')
    expect(deltas.join('')).toBe('你好呀')
    expect(fetchMock).toHaveBeenCalledOnce()
    const [url] = fetchMock.mock.calls[0] as [string]
    expect(url).toBe(
      'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions'
    )
  })
})
