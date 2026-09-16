import type {
  AppSettings,
  ChatChunk,
  ChatMessage,
  ChatResult,
  PublicSettings
} from '../shared/types'

export interface MomoApi {
  getSettings: () => Promise<PublicSettings>
  saveSettings: (patch: Partial<AppSettings>) => Promise<PublicSettings>
  sendChat: (messages: ChatMessage[]) => Promise<ChatResult>
  openChat: () => void
  openSettings: () => void
  closeChat: () => void
  quit: () => void
  showMenu: () => void
  beginDrag: () => void
  dragMove: () => void
  endDrag: () => void
  onChatChunk: (callback: (chunk: ChatChunk) => void) => () => void
  onShowSettings: (callback: () => void) => () => void
  onSettingsChanged: (callback: (settings: PublicSettings) => void) => () => void
  onChatVisible: (callback: (visible: boolean) => void) => () => void
}

declare global {
  interface Window {
    momo: MomoApi
  }
}

export {}
