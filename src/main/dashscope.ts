import type { ChatMessage } from '../shared/types'

export const SYSTEM_PROMPT =
  '你是 Momo，一只住在用户 Windows 桌面上的可爱小猫。性格温柔、俏皮、有点黏人。请用简体中文回复，语气可爱但不过度卖萌，尽量简短（一两段之内）。你可以陪用户聊天、解压、回答日常问题。不要声称自己能操作电脑、偷看屏幕或录音。'

export function parseSseLine(line: string): string | null {
  const trimmed = line.trim()
  if (!trimmed.startsWith('data:')) {
    return null
  }
  const data = trimmed.slice(5).trim()
  if (!data || data === '[DONE]') {
    return null
  }
  try {
    const json = JSON.parse(data) as {
      choices?: Array<{ delta?: { content?: string | null } }>
    }
    return json.choices?.[0]?.delta?.content ?? null
  } catch {
    return null
  }
}

export function parseDashScopeError(status: number, body: string): string {
  try {
    const json = JSON.parse(body) as {
      error?: { message?: string; code?: string }
      message?: string
    }
    const message = json.error?.message || json.message
    const code = json.error?.code
    if (status === 401 || code === 'invalid_api_key') {
      return 'API Key 无效，或与所选地域不一致。请到设置中检查密钥和 Base URL。'
    }
    if (status === 429) {
      return '请求过于频繁，请稍后再试。'
    }
    if (message) {
      return `通义千问返回错误：${message}`
    }
  } catch {
    // fall through
  }
  if (status === 404) {
    return '接口地址不正确。请确认 Base URL 以 /compatible-mode/v1 结尾，且不要带 /chat/completions。'
  }
  return `请求失败（HTTP ${status}）。请检查网络、Base URL 和模型名称。`
}

export function buildChatCompletionsUrl(baseURL: string): string {
  return `${baseURL.replace(/\/+$/, '')}/chat/completions`
}

export async function streamChat(options: {
  apiKey: string
  baseURL: string
  model: string
  messages: ChatMessage[]
  signal?: AbortSignal
  onDelta: (text: string) => void
}): Promise<string> {
  const url = buildChatCompletionsUrl(options.baseURL)
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${options.apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: options.model,
      stream: true,
      messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...options.messages]
    }),
    signal: options.signal
  })

  if (!response.ok) {
    const body = await response.text()
    throw new Error(parseDashScopeError(response.status, body))
  }

  if (!response.body) {
    throw new Error('接口没有返回内容，请稍后重试。')
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  let full = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) {
      break
    }
    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() ?? ''
    for (const line of lines) {
      const text = parseSseLine(line)
      if (text) {
        full += text
        options.onDelta(text)
      }
    }
  }

  const leftover = parseSseLine(buffer)
  if (leftover) {
    full += leftover
    options.onDelta(leftover)
  }

  if (!full.trim()) {
    throw new Error('通义千问没有返回文字。请确认模型名称可用，或稍后重试。')
  }

  return full
}
