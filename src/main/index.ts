import { app, BrowserWindow, ipcMain, Menu, nativeImage, Tray } from 'electron'
import { join } from 'path'
import { sendChatMessage } from '../chat/service'
import { createQwenClient } from '../qwen/factory'
import { loadEnvFile } from '../settings/env'
import type { AppSettings, ChatMessage } from '../shared/types'
import {
  createChatWindow,
  createPetWindow,
  destroyWindows,
  hideChatWindow,
  openChatFromPet,
  toggleChatWindow
} from '../ui/windows'
import { runSmokeTest } from './smoke'
import {
  createElectronSettingsStore,
  getSettingsStore,
  initSettingsStore
} from './store-singleton'

let tray: Tray | null = null
let chatAbort: AbortController | null = null

function isLinux(): boolean {
  return process.platform === 'linux'
}

function isSmokeTest(): boolean {
  return process.env.MOMO_SMOKE_TEST === '1'
}

if (isLinux()) {
  app.commandLine.appendSwitch('enable-transparent-visuals')
}

if (process.env.MOMO_NO_SANDBOX === '1' || isLinux()) {
  app.commandLine.appendSwitch('no-sandbox')
}

function registerIpc(): void {
  const store = getSettingsStore()

  ipcMain.handle('settings:get', () => store.getPublic())

  ipcMain.handle('settings:save', (_event, patch: Partial<AppSettings>) => {
    return store.save(patch ?? {})
  })

  ipcMain.handle('chat:send', async (event, messages: ChatMessage[]) => {
    const settings = store.resolve()
    chatAbort?.abort()
    chatAbort = new AbortController()
    const result = await sendChatMessage({
      messages,
      settings,
      client: createQwenClient(),
      signal: chatAbort.signal,
      onDelta: (text) => {
        if (!event.sender.isDestroyed()) {
          event.sender.send('chat:chunk', { type: 'delta', text })
        }
      }
    })
    if (!event.sender.isDestroyed()) {
      event.sender.send('chat:chunk', {
        type: result.ok ? 'done' : 'error',
        error: result.error
      })
    }
    return result
  })

  ipcMain.on('pet:open-chat', () => {
    openChatFromPet()
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
        click: () => openChatFromPet()
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
      { label: '打开聊天', click: () => openChatFromPet() },
      { label: '设置', click: () => toggleChatWindow(true) },
      { type: 'separator' },
      { label: '退出 Momo', click: () => app.quit() }
    ])
  )
  tray.on('click', () => openChatFromPet())
}

function bootstrap(): void {
  loadEnvFile(join(process.cwd(), '.env'))
  loadEnvFile(join(app.getPath('userData'), '.env'))
  initSettingsStore(createElectronSettingsStore())
  registerIpc()
  createPetWindow()
  createChatWindow()
  if (!isSmokeTest()) {
    createTray()
  }
  if (isSmokeTest()) {
    void runSmokeTest().catch((error) => {
      console.error(error)
      app.exit(1)
    })
  }
}

const ready = (): void => {
  bootstrap()
}

if (isLinux() && !isSmokeTest()) {
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
