export const SNAP_THRESHOLD_PX = 28

export interface Rect {
  x: number
  y: number
  width: number
  height: number
}

export interface Point {
  x: number
  y: number
}

/**
 * Snap a window to the nearest work-area edge when the drag ends close enough,
 * and clamp so Momo stays on-screen (sits on the edge rather than sliding off).
 */
export function snapWindowToWorkArea(
  pos: Point,
  size: { width: number; height: number },
  workArea: Rect,
  threshold = SNAP_THRESHOLD_PX
): Point {
  const minX = workArea.x
  const minY = workArea.y
  const maxX = workArea.x + workArea.width - size.width
  const maxY = workArea.y + workArea.height - size.height
  const clampMaxX = Math.max(minX, maxX)
  const clampMaxY = Math.max(minY, maxY)

  let x = pos.x
  let y = pos.y

  if (x - minX <= threshold) {
    x = minX
  } else if (clampMaxX - x <= threshold) {
    x = clampMaxX
  }

  if (y - minY <= threshold) {
    y = minY
  } else if (clampMaxY - y <= threshold) {
    y = clampMaxY
  }

  x = Math.min(Math.max(x, minX), clampMaxX)
  y = Math.min(Math.max(y, minY), clampMaxY)

  return { x: Math.round(x), y: Math.round(y) }
}
