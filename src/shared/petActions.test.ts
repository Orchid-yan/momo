import { describe, expect, it } from 'vitest'
import {
  isDoubleClick,
  nextPetAction,
  PET_ACTION_BUBBLES,
  PET_ACTIONS
} from './petActions'

describe('nextPetAction', () => {
  it('cycles through every cute action', () => {
    const seen: string[] = []
    let index = 0
    for (let i = 0; i < PET_ACTIONS.length; i += 1) {
      const step = nextPetAction(index)
      seen.push(step.action)
      index = step.nextIndex
    }
    expect(seen).toEqual([...PET_ACTIONS])
    expect(nextPetAction(index).action).toBe(PET_ACTIONS[0])
  })

  it('gives each action a Chinese bubble', () => {
    for (const action of PET_ACTIONS) {
      expect(PET_ACTION_BUBBLES[action].length).toBeGreaterThan(0)
    }
  })
})

describe('isDoubleClick', () => {
  it('opens chat only when the second tap is quick', () => {
    expect(isDoubleClick(1000, 750)).toBe(true)
    expect(isDoubleClick(1000, 500)).toBe(false)
    expect(isDoubleClick(1000, null)).toBe(false)
  })
})
