import { BrowserWindow, screen } from 'electron'
import { dragOffsetFrom, nextWindowPosition } from '../shared/dragMath'

let offset: { x: number; y: number } | null = null

export function beginPetDrag(win: BrowserWindow | null): void {
  if (!win || win.isDestroyed()) {
    return
  }
  const cursor = screen.getCursorScreenPoint()
  const [x, y] = win.getPosition()
  offset = dragOffsetFrom(cursor, { x, y })
}

export function movePetDrag(win: BrowserWindow | null): void {
  if (!win || win.isDestroyed() || !offset) {
    return
  }
  const cursor = screen.getCursorScreenPoint()
  const next = nextWindowPosition(cursor, offset)
  win.setPosition(next.x, next.y)
}

export function endPetDrag(): void {
  offset = null
}
