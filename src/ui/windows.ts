import { BrowserWindow, screen, shell, type BrowserWindowConstructorOptions } from 'electron'
import { join } from 'path'
import { getSettingsStore } from '../main/store-singleton'

let petWindow: BrowserWindow | null = null
let chatWindow: BrowserWindow | null = null
let quitting = false

function preloadPath(): string {
  return join(__dirname, '../preload/index.js')
}

function loadView(win: BrowserWindow, view: 'pet' | 'chat'): void {
  const rendererUrl = process.env.ELECTRON_RENDERER_URL
  if (rendererUrl) {
    void win.loadURL(`${rendererUrl}#/${view}`)
    return
  }
  void win.loadFile(join(__dirname, '../renderer/index.html'), { hash: `/${view}` })
}

function attachWindowOpenHandler(win: BrowserWindow): void {
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https:') || url.startsWith('http:')) {
      void shell.openExternal(url)
    }
    return { action: 'deny' }
  })
}

function notifyPetChatVisible(): void {
  if (!petWindow || petWindow.isDestroyed()) {
    return
  }
  petWindow.webContents.send('pet:chat-visible', isChatVisible())
}

function applyAlwaysOnTop(win: BrowserWindow, enabled: boolean): void {
  if (enabled) {
    win.setAlwaysOnTop(true, 'screen-saver')
    return
  }
  win.setAlwaysOnTop(false)
}

export function createPetWindow(): BrowserWindow {
  if (petWindow && !petWindow.isDestroyed()) {
    return petWindow
  }

  const workArea = screen.getPrimaryDisplay().workArea
  const width = 240
  const height = 300
  const x = workArea.x + workArea.width - width - 28
  const y = workArea.y + workArea.height - height - 24
  const alwaysOnTop = getSettingsStore().get().alwaysOnTop

  const petOptions: BrowserWindowConstructorOptions = {
    width,
    height,
    x,
    y,
    frame: false,
    transparent: true,
    backgroundColor: '#00000000',
    alwaysOnTop,
    skipTaskbar: true,
    movable: true,
    resizable: false,
    maximizable: false,
    minimizable: false,
    fullscreenable: false,
    hasShadow: false,
    show: false,
    roundedCorners: false,
    focusable: process.platform !== 'win32',
    webPreferences: {
      preload: preloadPath(),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      backgroundThrottling: false
    }
  }
  if (process.platform === 'linux') {
    petOptions.type = 'toolbar'
  }

  petWindow = new BrowserWindow(petOptions)

  applyAlwaysOnTop(petWindow, alwaysOnTop)
  if (alwaysOnTop) {
    petWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true })
  }
  attachWindowOpenHandler(petWindow)
  loadView(petWindow, 'pet')

  petWindow.once('ready-to-show', () => {
    petWindow?.showInactive()
  })

  petWindow.on('close', (event) => {
    if (quitting || process.env.MOMO_SMOKE_TEST === '1') {
      return
    }
    event.preventDefault()
    petWindow?.hide()
  })

  petWindow.on('closed', () => {
    petWindow = null
  })

  return petWindow
}

export function createChatWindow(): BrowserWindow {
  if (chatWindow && !chatWindow.isDestroyed()) {
    return chatWindow
  }

  const alwaysOnTop = getSettingsStore().get().alwaysOnTop

  chatWindow = new BrowserWindow({
    width: 400,
    height: 560,
    frame: false,
    transparent: true,
    backgroundColor: '#00000000',
    alwaysOnTop,
    skipTaskbar: true,
    resizable: true,
    minimizable: false,
    maximizable: false,
    fullscreenable: false,
    hasShadow: false,
    show: false,
    minWidth: 320,
    minHeight: 420,
    webPreferences: {
      preload: preloadPath(),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  })

  applyAlwaysOnTop(chatWindow, alwaysOnTop)
  attachWindowOpenHandler(chatWindow)
  loadView(chatWindow, 'chat')

  chatWindow.on('close', (event) => {
    if (quitting || !chatWindow) {
      return
    }
    event.preventDefault()
    chatWindow.hide()
  })

  chatWindow.on('hide', () => {
    notifyPetChatVisible()
  })

  chatWindow.on('show', () => {
    notifyPetChatVisible()
  })

  chatWindow.on('closed', () => {
    chatWindow = null
  })

  return chatWindow
}

export function positionChatNearPet(): void {
  if (!chatWindow || chatWindow.isDestroyed()) {
    return
  }
  const chatBounds = chatWindow.getBounds()
  const workArea = screen.getPrimaryDisplay().workArea
  let x = workArea.x + workArea.width - chatBounds.width - 280
  let y = workArea.y + workArea.height - chatBounds.height - 36

  if (petWindow && !petWindow.isDestroyed() && petWindow.isVisible()) {
    const pet = petWindow.getBounds()
    x = pet.x - chatBounds.width - 12
    y = pet.y + pet.height - chatBounds.height
    if (x < workArea.x) {
      x = pet.x + pet.width + 12
    }
    if (y < workArea.y) {
      y = workArea.y + 16
    }
    if (y + chatBounds.height > workArea.y + workArea.height) {
      y = workArea.y + workArea.height - chatBounds.height - 16
    }
  }

  chatWindow.setPosition(Math.round(x), Math.round(y))
}

/** Same path as clicking the pet: open (or toggle) the chat card. */
export function openChatFromPet(): void {
  toggleChatWindow(false)
}

export function toggleChatWindow(showSettings = false): void {
  const chat = createChatWindow()
  if (chat.isVisible() && !showSettings) {
    chat.hide()
    return
  }
  positionChatNearPet()
  if (showSettings) {
    chat.webContents.send('chat:show-settings')
  }
  chat.show()
  chat.focus()
}

export function hideChatWindow(): void {
  if (chatWindow && !chatWindow.isDestroyed()) {
    chatWindow.hide()
  }
}

export function isChatVisible(): boolean {
  return Boolean(chatWindow && !chatWindow.isDestroyed() && chatWindow.isVisible())
}

export function isPetVisible(): boolean {
  return Boolean(petWindow && !petWindow.isDestroyed() && petWindow.isVisible())
}

export function hidePetWindow(): void {
  if (petWindow && !petWindow.isDestroyed()) {
    petWindow.hide()
  }
}

export function showPetWindow(): void {
  const pet = createPetWindow()
  pet.showInactive()
}

export function togglePetVisible(): boolean {
  if (isPetVisible()) {
    hidePetWindow()
    return false
  }
  showPetWindow()
  return true
}

export function setWindowsAlwaysOnTop(enabled: boolean): void {
  if (petWindow && !petWindow.isDestroyed()) {
    applyAlwaysOnTop(petWindow, enabled)
    if (enabled) {
      petWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true })
    }
  }
  if (chatWindow && !chatWindow.isDestroyed()) {
    applyAlwaysOnTop(chatWindow, enabled)
  }
}

export function getPetWindow(): BrowserWindow | null {
  return petWindow
}

export function getChatWindow(): BrowserWindow | null {
  return chatWindow
}

export function destroyWindows(): void {
  quitting = true
  if (chatWindow && !chatWindow.isDestroyed()) {
    chatWindow.removeAllListeners('close')
    chatWindow.close()
  }
  if (petWindow && !petWindow.isDestroyed()) {
    petWindow.removeAllListeners('close')
    petWindow.close()
  }
  chatWindow = null
  petWindow = null
}
