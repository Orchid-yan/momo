import { app } from 'electron'
import { join } from 'path'
import { isMockQwen } from '../qwen/factory'
import { SettingsStore } from '../settings/store'

let store: SettingsStore | null = null

export function initSettingsStore(next: SettingsStore): void {
  store = next
}

export function getSettingsStore(): SettingsStore {
  if (!store) {
    throw new Error('SettingsStore has not been initialized')
  }
  return store
}

export function createElectronSettingsStore(): SettingsStore {
  return new SettingsStore({
    filePath: () => join(app.getPath('userData'), 'settings.json'),
    env: process.env,
    mockMode: () => isMockQwen()
  })
}
