import { describe, expect, it } from 'vitest'
import {
  BUBBLE_INTERVAL_PRESETS,
  canSpeakProactively,
  clampProactiveIntervalMs,
  DEFAULT_PROACTIVE_INTERVAL_MS,
  firstProactiveAt,
  MAX_PROACTIVE_INTERVAL_MS,
  MIN_PROACTIVE_INTERVAL_MS,
  moodDurationMs,
  nextIdleDelayMs,
  nextProactiveBubble,
  normalizePetRenderer,
  pickIdleTransition,
  postponeAfterBubble,
  PROACTIVE_BUBBLES,
  PROACTIVE_COOLDOWN_MS,
  PROACTIVE_STARTUP_GRACE_MS,
  scheduleNextProactiveAt
} from './petLife'

describe('pickIdleTransition', () => {
  it('covers sleepy, stretch, hop, slide, and idle', () => {
    expect(pickIdleTransition(() => 0)).toBe('sleepy')
    expect(pickIdleTransition(() => 0.29)).toBe('stretch')
    expect(pickIdleTransition(() => 0.51)).toBe('hop')
    expect(pickIdleTransition(() => 0.73)).toBe('slide')
    expect(pickIdleTransition(() => 0.95)).toBe('idle')
  })
})

describe('moodDurationMs', () => {
  it('gives short hops and longer sleepy naps', () => {
    expect(moodDurationMs('hop')).toBeLessThan(moodDurationMs('sleepy'))
    expect(moodDurationMs('idle')).toBe(0)
    expect(moodDurationMs('stretch')).toBeGreaterThan(0)
  })
})

describe('nextIdleDelayMs', () => {
  it('stays in an 8–18s idle window', () => {
    expect(nextIdleDelayMs(() => 0)).toBe(8_000)
    expect(nextIdleDelayMs(() => 1)).toBe(18_000)
  })
})

describe('proactive bubbles', () => {
  it('cycles Chinese lines', () => {
    const seen: string[] = []
    let index = 0
    for (let i = 0; i < PROACTIVE_BUBBLES.length; i += 1) {
      const step = nextProactiveBubble(index)
      seen.push(step.text)
      index = step.nextIndex
    }
    expect(seen).toEqual([...PROACTIVE_BUBBLES])
    expect(nextProactiveBubble(index).text).toBe(PROACTIVE_BUBBLES[0])
  })

  it('does not speak while disabled, chatting, hidden, or cooling down', () => {
    const base = {
      now: 100_000,
      nextAt: 90_000,
      enabled: true,
      chatOpen: false,
      petHidden: false
    }
    expect(canSpeakProactively(base)).toBe(true)
    expect(canSpeakProactively({ ...base, enabled: false })).toBe(false)
    expect(canSpeakProactively({ ...base, chatOpen: true })).toBe(false)
    expect(canSpeakProactively({ ...base, petHidden: true })).toBe(false)
    expect(canSpeakProactively({ ...base, now: 80_000 })).toBe(false)
  })

  it('clamps interval and adds jitter without going below the last time', () => {
    expect(clampProactiveIntervalMs(100)).toBe(MIN_PROACTIVE_INTERVAL_MS)
    expect(clampProactiveIntervalMs(999_999_999)).toBe(MAX_PROACTIVE_INTERVAL_MS)
    expect(clampProactiveIntervalMs(Number.NaN)).toBe(DEFAULT_PROACTIVE_INTERVAL_MS)
    expect(scheduleNextProactiveAt(0, 60_000, () => 0)).toBe(60_000)
    expect(scheduleNextProactiveAt(0, 60_000, () => 1)).toBe(81_000)
  })

  it('waits a startup grace before the first unprompted line', () => {
    const at = firstProactiveAt(1_000, 90_000, () => 0)
    expect(at).toBeGreaterThanOrEqual(1_000 + PROACTIVE_STARTUP_GRACE_MS)
  })

  it('enforces cooldown after any bubble', () => {
    const next = postponeAfterBubble(50_000, 20_000, () => 0)
    expect(next).toBeGreaterThanOrEqual(50_000 + PROACTIVE_COOLDOWN_MS)
  })

  it('exposes interval presets for settings', () => {
    expect(BUBBLE_INTERVAL_PRESETS.some((item) => item.ms === DEFAULT_PROACTIVE_INTERVAL_MS)).toBe(
      true
    )
  })
})

describe('normalizePetRenderer', () => {
  it('defaults the visual prototype to 3D and only switches on an explicit 2d value', () => {
    expect(normalizePetRenderer(undefined)).toBe('3d')
    expect(normalizePetRenderer('3d')).toBe('3d')
    expect(normalizePetRenderer('2d')).toBe('2d')
    expect(normalizePetRenderer('webgpu')).toBe('3d')
  })
})
