import type { AppSettings, ChatMessage, ChatResult } from '../shared/types'
import type { QwenClient } from '../qwen/client'

export const MISSING_API_KEY =
  '还没有设置 API Key。请点击右上角齿轮，填写阿里云百炼（DashScope）密钥。'

export async function sendChatMessage(options: {
  messages: ChatMessage[]
  settings: AppSettings
  client: QwenClient
  onDelta: (text: string) => void
  signal?: AbortSignal
}): Promise<ChatResult> {
  if (!options.settings.apiKey && options.client.kind !== 'mock') {
    return { ok: false, error: MISSING_API_KEY }
  }

  try {
    const content = await options.client.streamChat({
      apiKey: options.settings.apiKey,
      baseURL: options.settings.baseURL,
      model: options.settings.model,
      messages: options.messages,
      signal: options.signal,
      onDelta: options.onDelta
    })
    return { ok: true, content }
  } catch (error) {
    if ((error as { name?: string }).name === 'AbortError') {
      return { ok: false, error: '已取消' }
    }
    const message = error instanceof Error ? error.message : String(error)
    return { ok: false, error: message }
  }
}
