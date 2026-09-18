export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export interface AppSettings {
  apiKey: string
  baseURL: string
  model: string
  alwaysOnTop: boolean
  proactiveBubblesEnabled: boolean
  proactiveBubbleIntervalMs: number
  petRenderer: '3d' | '2d'
}

export interface PublicSettings {
  apiKey: string
  baseURL: string
  model: string
  alwaysOnTop: boolean
  proactiveBubblesEnabled: boolean
  proactiveBubbleIntervalMs: number
  petRenderer: '3d' | '2d'
  hasApiKey: boolean
  mockMode: boolean
  apiKeyLooksValid: boolean
}

export interface ChatChunk {
  type: 'delta' | 'done' | 'error'
  text?: string
  error?: string
}

export interface ChatResult {
  ok: boolean
  content?: string
  error?: string
}

export const DEFAULT_BASE_URL = 'https://dashscope.aliyuncs.com/compatible-mode/v1'
export const DEFAULT_MODEL = 'qwen-plus'

export const BASE_URL_PRESETS = [
  {
    id: 'beijing',
    label: '北京（中国站）',
    url: 'https://dashscope.aliyuncs.com/compatible-mode/v1'
  },
  {
    id: 'singapore',
    label: '新加坡（国际站）',
    url: 'https://dashscope-intl.aliyuncs.com/compatible-mode/v1'
  },
  {
    id: 'virginia',
    label: '美东弗吉尼亚',
    url: 'https://dashscope-us.aliyuncs.com/compatible-mode/v1'
  }
] as const

export const MODEL_PRESETS = ['qwen-plus', 'qwen-turbo', 'qwen-max'] as const
