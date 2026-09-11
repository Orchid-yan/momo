import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs'
import { dirname, join } from 'path'
import { app } from 'electron'
import {
  DEFAULT_BASE_URL,
  DEFAULT_MODEL,
  type AppSettings,
  type PublicSettings
} from '../shared/types'

function settingsPath(): string {
  return join(app.getPath('userData'), 'settings.json')
}

export function loadEnvFile(filePath: string): void {
  if (!existsSync(filePath)) {
    return
  }
  const text = readFileSync(filePath, 'utf8')
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) {
      continue
    }
    const eq = trimmed.indexOf('=')
    if (eq <= 0) {
      continue
    }
    const key = trimmed.slice(0, eq).trim()
    let value = trimmed.slice(eq + 1).trim()
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    if (process.env[key] === undefined) {
      process.env[key] = value
    }
  }
}

export function loadDotEnv(): void {
  loadEnvFile(join(process.cwd(), '.env'))
  loadEnvFile(join(app.getPath('userData'), '.env'))
}

function readStoredSettings(): Partial<AppSettings> {
  try {
    const raw = readFileSync(settingsPath(), 'utf8')
    return JSON.parse(raw) as Partial<AppSettings>
  } catch {
    return {}
  }
}

export function getSettings(): AppSettings {
  const stored = readStoredSettings()
  return {
    apiKey: (stored.apiKey ?? '').trim(),
    baseURL: (stored.baseURL ?? '').trim() || DEFAULT_BASE_URL,
    model: (stored.model ?? '').trim() || DEFAULT_MODEL
  }
}

export function getResolvedSettings(): AppSettings {
  const stored = getSettings()
  return {
    apiKey: stored.apiKey || (process.env.DASHSCOPE_API_KEY ?? '').trim(),
    baseURL:
      stored.baseURL && stored.baseURL !== DEFAULT_BASE_URL
        ? stored.baseURL
        : (process.env.DASHSCOPE_BASE_URL ?? '').trim() || stored.baseURL,
    model:
      stored.model && stored.model !== DEFAULT_MODEL
        ? stored.model
        : (process.env.DASHSCOPE_MODEL ?? '').trim() || stored.model
  }
}

export function getPublicSettings(): PublicSettings {
  const resolved = getResolvedSettings()
  const stored = getSettings()
  return {
    apiKey: stored.apiKey,
    baseURL: resolved.baseURL,
    model: resolved.model,
    hasApiKey: Boolean(resolved.apiKey)
  }
}

export function saveSettings(patch: Partial<AppSettings>): PublicSettings {
  const current = getSettings()
  const next: AppSettings = {
    apiKey: patch.apiKey !== undefined ? patch.apiKey.trim() : current.apiKey,
    baseURL: patch.baseURL !== undefined ? patch.baseURL.trim() : current.baseURL,
    model: patch.model !== undefined ? patch.model.trim() : current.model
  }
  if (!next.baseURL) {
    next.baseURL = DEFAULT_BASE_URL
  }
  if (!next.model) {
    next.model = DEFAULT_MODEL
  }
  const dir = dirname(settingsPath())
  mkdirSync(dir, { recursive: true })
  writeFileSync(settingsPath(), JSON.stringify(next, null, 2), 'utf8')
  return getPublicSettings()
}
