import { mkdtempSync, readFileSync } from 'fs'
import { tmpdir } from 'os'
import { join } from 'path'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { looksLikeApiKey } from './keyFormat'
import { SettingsStore } from './store'

describe('looksLikeApiKey', () => {
  it('accepts DashScope-style sk- keys', () => {
    expect(looksLikeApiKey('sk-abcdef123456')).toBe(true)
  })

  it('rejects empty or obviously invalid values', () => {
    expect(looksLikeApiKey('')).toBe(false)
    expect(looksLikeApiKey('not-a-key')).toBe(false)
  })
})

describe('SettingsStore', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('saves an API key to disk without any network call', () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    const dir = mkdtempSync(join(tmpdir(), 'momo-settings-'))
    const filePath = join(dir, 'settings.json')
    const store = new SettingsStore({
      filePath: () => filePath,
      env: {},
      mockMode: () => false
    })

    const publicSettings = store.save({
      apiKey: 'sk-mocklocalkey99',
      baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
      model: 'qwen-plus'
    })

    expect(publicSettings.apiKey).toBe('sk-mocklocalkey99')
    expect(publicSettings.apiKeyLooksValid).toBe(true)
    expect(publicSettings.hasApiKey).toBe(true)
    expect(fetchMock).not.toHaveBeenCalled()

    const onDisk = JSON.parse(readFileSync(filePath, 'utf8')) as { apiKey: string }
    expect(onDisk.apiKey).toBe('sk-mocklocalkey99')
    expect(store.get().apiKey).toBe('sk-mocklocalkey99')
  })

  it('treats mock mode as ready to chat even without a saved key', () => {
    const dir = mkdtempSync(join(tmpdir(), 'momo-settings-'))
    const store = new SettingsStore({
      filePath: () => join(dir, 'settings.json'),
      env: {},
      mockMode: () => true
    })
    expect(store.getPublic().hasApiKey).toBe(true)
    expect(store.getPublic().mockMode).toBe(true)
  })

  it('defaults pet prefs and does not wipe them when saving an API key', () => {
    const dir = mkdtempSync(join(tmpdir(), 'momo-settings-'))
    const filePath = join(dir, 'settings.json')
    const store = new SettingsStore({
      filePath: () => filePath,
      env: {},
      mockMode: () => false
    })

    expect(store.get().alwaysOnTop).toBe(true)
    expect(store.get().proactiveBubblesEnabled).toBe(true)
    expect(store.get().petRenderer).toBe('3d')

    store.save({
      alwaysOnTop: false,
      proactiveBubblesEnabled: false,
      proactiveBubbleIntervalMs: 60_000,
      petRenderer: '2d'
    })
    store.save({ apiKey: 'sk-mocklocalkey99' })

    const saved = store.get()
    expect(saved.alwaysOnTop).toBe(false)
    expect(saved.proactiveBubblesEnabled).toBe(false)
    expect(saved.proactiveBubbleIntervalMs).toBe(60_000)
    expect(saved.petRenderer).toBe('2d')
    expect(saved.apiKey).toBe('sk-mocklocalkey99')
    expect(store.getPublic().alwaysOnTop).toBe(false)
  })
})
