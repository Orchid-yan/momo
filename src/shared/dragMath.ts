export const DRAG_THRESHOLD_PX = 5

export function isSignificantDrag(
  dx: number,
  dy: number,
  threshold = DRAG_THRESHOLD_PX
): boolean {
  return dx * dx + dy * dy > threshold * threshold
}

export function dragOffsetFrom(
  cursor: { x: number; y: number },
  windowOrigin: { x: number; y: number }
): { x: number; y: number } {
  return { x: cursor.x - windowOrigin.x, y: cursor.y - windowOrigin.y }
}

export function nextWindowPosition(
  cursor: { x: number; y: number },
  offset: { x: number; y: number }
): { x: number; y: number } {
  return {
    x: Math.round(cursor.x - offset.x),
    y: Math.round(cursor.y - offset.y)
  }
}
