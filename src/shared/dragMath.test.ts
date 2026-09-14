import { describe, expect, it } from 'vitest'
import { dragOffsetFrom, isSignificantDrag, nextWindowPosition } from './dragMath'

describe('isSignificantDrag', () => {
  it('treats tiny movement as a click', () => {
    expect(isSignificantDrag(2, 2)).toBe(false)
    expect(isSignificantDrag(0, 0)).toBe(false)
  })

  it('treats larger movement as a drag', () => {
    expect(isSignificantDrag(8, 0)).toBe(true)
    expect(isSignificantDrag(4, 4)).toBe(true)
  })
})

describe('window position helpers', () => {
  it('keeps the grab point under the cursor', () => {
    const offset = dragOffsetFrom({ x: 120, y: 80 }, { x: 100, y: 60 })
    expect(offset).toEqual({ x: 20, y: 20 })
    expect(nextWindowPosition({ x: 200, y: 140 }, offset)).toEqual({ x: 180, y: 120 })
  })
})
