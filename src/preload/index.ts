import { contextBridge, ipcRenderer } from 'electron'
import type {
  AppSettings,
  ChatChunk,
  ChatMessage,
  ChatResult,
  PublicSettings
} from '../shared/types'

const momo = {
  getSettings: (): Promise<PublicSettings> => ipcRenderer.invoke('settings:get'),
  saveSettings: (patch: Partial<AppSettings>): Promise<PublicSettings> =>
    ipcRenderer.invoke('settings:save', patch),
  sendChat: (messages: ChatMessage[]): Promise<ChatResult> =>
    ipcRenderer.invoke('chat:send', messages),
  openChat: (): void => {
    ipcRenderer.send('pet:open-chat')
  },
  openSettings: (): void => {
    ipcRenderer.send('pet:open-settings')
  },
  closeChat: (): void => {
    ipcRenderer.send('chat:close')
  },
  quit: (): void => {
    ipcRenderer.send('app:quit')
  },
  showMenu: (): void => {
    ipcRenderer.send('pet:menu')
  },
  beginDrag: (): void => {
    ipcRenderer.send('pet:drag-start')
  },
  dragMove: (): void => {
    ipcRenderer.send('pet:drag-move')
  },
  endDrag: (): void => {
    ipcRenderer.send('pet:drag-end')
  },
  onChatChunk: (callback: (chunk: ChatChunk) => void): (() => void) => {
    const listener = (_event: Electron.IpcRendererEvent, chunk: ChatChunk): void => {
      callback(chunk)
    }
    ipcRenderer.on('chat:chunk', listener)
    return () => {
      ipcRenderer.removeListener('chat:chunk', listener)
    }
  },
  onShowSettings: (callback: () => void): (() => void) => {
    const listener = (): void => {
      callback()
    }
    ipcRenderer.on('chat:show-settings', listener)
    return () => {
      ipcRenderer.removeListener('chat:show-settings', listener)
    }
  }
}

contextBridge.exposeInMainWorld('momo', momo)
