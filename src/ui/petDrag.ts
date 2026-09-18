import { BrowserWindow, screen } from 'electron'
import { dragOffsetFrom, nextWindowPosition } from '../shared/dragMath'
import { snapWindowToWorkArea } from '../shared/edgeSnap'

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

export function endPetDrag(win: BrowserWindow | null = null): void {
  if (win && !win.isDestroyed()) {
    const bounds = win.getBounds()
    const display = screen.getDisplayNearestPoint({
      x: bounds.x + Math.round(bounds.width / 2),
      y: bounds.y + Math.round(bounds.height / 2)
    })
    const snapped = snapWindowToWorkArea(
      { x: bounds.x, y: bounds.y },
      { width: bounds.width, height: bounds.height },
      display.workArea
    )
    if (snapped.x !== bounds.x || snapped.y !== bounds.y) {
      win.setPosition(snapped.x, snapped.y)
    }
  }
  offset = null
}
