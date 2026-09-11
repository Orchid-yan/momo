import type { QwenClient } from './client'
import { createDashScopeClient } from './dashscope'
import { createMockQwenClient } from './mock'

export function isMockQwen(env: NodeJS.Dict<string> = process.env): boolean {
  return env.MOMO_MOCK_QWEN === '1' || env.MOMO_SMOKE_TEST === '1'
}

export function createQwenClient(env: NodeJS.Dict<string> = process.env): QwenClient {
  if (isMockQwen(env)) {
    return createMockQwenClient()
  }
  return createDashScopeClient()
}
