import { mkdirSync, readFileSync, writeFileSync } from 'fs'
import { dirname } from 'path'
import {
  clampProactiveIntervalMs,
  DEFAULT_ALWAYS_ON_TOP,
  DEFAULT_PET_RENDERER,
  DEFAULT_PROACTIVE_BUBBLES_ENABLED,
  DEFAULT_PROACTIVE_INTERVAL_MS,
  normalizePetRenderer
} from '../shared/petLife'
import {
  DEFAULT_BASE_URL,
  DEFAULT_MODEL,
  type AppSettings,
  type PublicSettings
} from '../shared/types'
import { looksLikeApiKey } from './keyFormat'

export interface SettingsStoreOptions {
  filePath: () => string
  env?: NodeJS.Dict<string>
  mockMode?: () => boolean
}

export class SettingsStore {
  constructor(private readonly options: SettingsStoreOptions) {}

  private env(): NodeJS.Dict<string> {
    return this.options.env ?? process.env
  }

  private isMock(): boolean {
    return this.options.mockMode?.() ?? false
  }

  private readStored(): Partial<AppSettings> {
    try {
      const raw = readFileSync(this.options.filePath(), 'utf8')
      return JSON.parse(raw) as Partial<AppSettings>
    } catch {
      return {}
    }
  }

  get(): AppSettings {
    const stored = this.readStored()
    return {
      apiKey: (stored.apiKey ?? '').trim(),
      baseURL: (stored.baseURL ?? '').trim() || DEFAULT_BASE_URL,
      model: (stored.model ?? '').trim() || DEFAULT_MODEL,
      alwaysOnTop: stored.alwaysOnTop ?? DEFAULT_ALWAYS_ON_TOP,
      proactiveBubblesEnabled: stored.proactiveBubblesEnabled ?? DEFAULT_PROACTIVE_BUBBLES_ENABLED,
      proactiveBubbleIntervalMs: clampProactiveIntervalMs(
        stored.proactiveBubbleIntervalMs ?? DEFAULT_PROACTIVE_INTERVAL_MS
      ),
      petRenderer: normalizePetRenderer(stored.petRenderer ?? DEFAULT_PET_RENDERER)
    }
  }

  resolve(): AppSettings {
    const stored = this.get()
    const env = this.env()
    return {
      ...stored,
      apiKey: stored.apiKey || (env.DASHSCOPE_API_KEY ?? '').trim(),
      baseURL:
        stored.baseURL && stored.baseURL !== DEFAULT_BASE_URL
          ? stored.baseURL
          : (env.DASHSCOPE_BASE_URL ?? '').trim() || stored.baseURL,
      model:
        stored.model && stored.model !== DEFAULT_MODEL
          ? stored.model
          : (env.DASHSCOPE_MODEL ?? '').trim() || stored.model
    }
  }

  getPublic(): PublicSettings {
    const resolved = this.resolve()
    const stored = this.get()
    const mockMode = this.isMock()
    return {
      apiKey: stored.apiKey,
      baseURL: resolved.baseURL,
      model: resolved.model,
      alwaysOnTop: stored.alwaysOnTop,
      proactiveBubblesEnabled: stored.proactiveBubblesEnabled,
      proactiveBubbleIntervalMs: stored.proactiveBubbleIntervalMs,
      petRenderer: stored.petRenderer,
      hasApiKey: Boolean(resolved.apiKey) || mockMode,
      mockMode,
      apiKeyLooksValid: stored.apiKey ? looksLikeApiKey(stored.apiKey) : false
    }
  }

  save(patch: Partial<AppSettings>): PublicSettings {
    const current = this.get()
    const next: AppSettings = {
      apiKey: patch.apiKey !== undefined ? patch.apiKey.trim() : current.apiKey,
      baseURL: patch.baseURL !== undefined ? patch.baseURL.trim() : current.baseURL,
      model: patch.model !== undefined ? patch.model.trim() : current.model,
      alwaysOnTop: patch.alwaysOnTop !== undefined ? Boolean(patch.alwaysOnTop) : current.alwaysOnTop,
      proactiveBubblesEnabled:
        patch.proactiveBubblesEnabled !== undefined
          ? Boolean(patch.proactiveBubblesEnabled)
          : current.proactiveBubblesEnabled,
      proactiveBubbleIntervalMs:
        patch.proactiveBubbleIntervalMs !== undefined
          ? clampProactiveIntervalMs(patch.proactiveBubbleIntervalMs)
          : current.proactiveBubbleIntervalMs,
      petRenderer:
        patch.petRenderer !== undefined ? normalizePetRenderer(patch.petRenderer) : current.petRenderer
    }
    if (!next.baseURL) {
      next.baseURL = DEFAULT_BASE_URL
    }
    if (!next.model) {
      next.model = DEFAULT_MODEL
    }
    const filePath = this.options.filePath()
    mkdirSync(dirname(filePath), { recursive: true })
    writeFileSync(filePath, JSON.stringify(next, null, 2), 'utf8')
    return this.getPublic()
  }
}
