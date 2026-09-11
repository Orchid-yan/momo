import { app, BrowserWindow, ipcMain, Menu, nativeImage, Tray } from 'electron'
import { join } from 'path'
import type { AppSettings, ChatMessage } from '../shared/types'
import { streamChat } from './dashscope'
import { getPublicSettings, getResolvedSettings, loadDotEnv, saveSettings } from './settings'
import {
  createChatWindow,
  createPetWindow,
  destroyWindows,
  hideChatWindow,
  toggleChatWindow
} from './windows'

let tray: Tray | null = null
let chatAbort: AbortController | null = null

function isLinux(): boolean {
  return process.platform === 'linux'
}

if (isLinux()) {
  app.commandLine.appendSwitch('enable-transparent-visuals')
}

if (process.env.MOMO_NO_SANDBOX === '1' || isLinux()) {
  app.commandLine.appendSwitch('no-sandbox')
}

function registerIpc(): void {
  ipcMain.handle('settings:get', () => getPublicSettings())

  ipcMain.handle('settings:save', (_event, patch: Partial<AppSettings>) => {
    return saveSettings(patch ?? {})
  })

  ipcMain.handle('chat:send', async (event, messages: ChatMessage[]) => {
    const settings = getResolvedSettings()
    if (!settings.apiKey) {
      return {
        ok: false,
        error: '还没有设置 API Key。请点击右上角齿轮，填写阿里云百炼（DashScope）密钥。'
      }
    }

    chatAbort?.abort()
    chatAbort = new AbortController()

    try {
      const content = await streamChat({
        apiKey: settings.apiKey,
        baseURL: settings.baseURL,
        model: settings.model,
        messages,
        signal: chatAbort.signal,
        onDelta: (text) => {
          if (!event.sender.isDestroyed()) {
            event.sender.send('chat:chunk', { type: 'delta', text })
          }
        }
      })
      if (!event.sender.isDestroyed()) {
        event.sender.send('chat:chunk', { type: 'done' })
      }
      return { ok: true, content }
    } catch (error) {
      if ((error as { name?: string }).name === 'AbortError') {
        return { ok: false, error: '已取消' }
      }
      const message = error instanceof Error ? error.message : String(error)
      if (!event.sender.isDestroyed()) {
        event.sender.send('chat:chunk', { type: 'error', error: message })
      }
      return { ok: false, error: message }
    }
  })

  ipcMain.on('pet:open-chat', () => {
    toggleChatWindow(false)
  })

  ipcMain.on('pet:open-settings', () => {
    toggleChatWindow(true)
  })

  ipcMain.on('chat:close', () => {
    hideChatWindow()
  })

  ipcMain.on('app:quit', () => {
    app.quit()
  })

  ipcMain.on('pet:menu', (event) => {
    const menu = Menu.buildFromTemplate([
      {
        label: '打开聊天',
        click: () => toggleChatWindow(false)
      },
      {
        label: '设置',
        click: () => toggleChatWindow(true)
      },
      { type: 'separator' },
      {
        label: '退出 Momo',
        click: () => app.quit()
      }
    ])
    menu.popup({
      window: BrowserWindow.fromWebContents(event.sender) ?? undefined
    })
  })
}

function createTray(): void {
  const iconPath = app.isPackaged
    ? join(process.resourcesPath, 'icon.png')
    : join(app.getAppPath(), 'resources', 'icon.png')

  let image = nativeImage.createFromPath(iconPath)
  if (image.isEmpty()) {
    image = nativeImage.createFromDataURL(
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAhklEQVR4nO2UwQ2AMAwD7c8M7L8yIh+VClWqJIRU9iNFsd04BgAAAADgj4jY9t7XzMy9q+pbROaU0lJVayJizjl/ATvn3PdI5AOq+tZaW2Y+pJTmnPObkYjYjDHccw5m3lT1LSJ7KeX+GeD9E3DOaX9/nYiYcs77Z0BE1lLKq6q+iYh7z/8fAAAAAAD4kx7V2RGf1nYQowAAAABJRU5ErkJggg=='
    )
  }
  tray = new Tray(image.resize({ width: 16, height: 16 }))
  tray.setToolTip('Momo')
  tray.setContextMenu(
    Menu.buildFromTemplate([
      { label: '打开聊天', click: () => toggleChatWindow(false) },
      { label: '设置', click: () => toggleChatWindow(true) },
      { type: 'separator' },
      { label: '退出 Momo', click: () => app.quit() }
    ])
  )
  tray.on('click', () => toggleChatWindow(false))
}

function bootstrap(): void {
  loadDotEnv()
  registerIpc()
  createPetWindow()
  createChatWindow()
  createTray()
}

const ready = (): void => {
  bootstrap()
}

if (isLinux()) {
  app.whenReady().then(() => setTimeout(ready, 400))
} else {
  app.whenReady().then(ready)
}

app.on('window-all-closed', () => {
  app.quit()
})

app.on('before-quit', () => {
  chatAbort?.abort()
  if (tray) {
    tray.destroy()
    tray = null
  }
  destroyWindows()
})
