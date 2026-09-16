import { describe, expect, it } from 'vitest'
import { snapWindowToWorkArea } from './edgeSnap'

const workArea = { x: 0, y: 0, width: 1920, height: 1080 }
const size = { width: 200, height: 240 }

describe('snapWindowToWorkArea', () => {
  it('snaps to nearby edges', () => {
    expect(snapWindowToWorkArea({ x: 18, y: 20 }, size, workArea)).toEqual({ x: 0, y: 0 })
    expect(snapWindowToWorkArea({ x: 400, y: 830 }, size, workArea)).toEqual({ x: 400, y: 840 })
  })

  it('snaps to the right edge', () => {
    expect(snapWindowToWorkArea({ x: 1705, y: 200 }, size, workArea)).toEqual({ x: 1720, y: 200 })
  })

  it('leaves a centered window alone', () => {
    expect(snapWindowToWorkArea({ x: 800, y: 400 }, size, workArea)).toEqual({ x: 800, y: 400 })
  })

  it('clamps a window dragged past the work area', () => {
    expect(snapWindowToWorkArea({ x: -80, y: 2000 }, size, workArea)).toEqual({ x: 0, y: 840 })
  })
})
