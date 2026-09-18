import { PET_ACTION_MS } from './petActions'

/** Idle / sleepy / stretch / hop-slide / click-react. One PNG + CSS only. */
export type PetMood = 'idle' | 'sleepy' | 'stretch' | 'hop' | 'slide' | 'reacting'

export const DEFAULT_ALWAYS_ON_TOP = true
export const DEFAULT_PROACTIVE_BUBBLES_ENABLED = true
/** Visual prototype: 3D is the default so it can be judged on a real desktop. */
export const DEFAULT_PET_RENDERER = '3d'
export type PetRenderer = '3d' | '2d'

export function normalizePetRenderer(value: unknown): PetRenderer {
  return value === '2d' ? '2d' : '3d'
}

/** Base gap between unprompted bubbles. Easy to tune; settings can override. */
export const DEFAULT_PROACTIVE_INTERVAL_MS = 90_000
export const MIN_PROACTIVE_INTERVAL_MS = 20_000
export const MAX_PROACTIVE_INTERVAL_MS = 15 * 60_000
/** Extra floor so click bubbles and proactive lines cannot stack. */
export const PROACTIVE_COOLDOWN_MS = 25_000
/** First unprompted line waits at least this long after launch. */
export const PROACTIVE_STARTUP_GRACE_MS = 20_000

export const BUBBLE_INTERVAL_PRESETS = [
  { ms: 30_000, label: '约 30 秒' },
  { ms: 60_000, label: '约 1 分钟' },
  { ms: 90_000, label: '约 1.5 分钟' },
  { ms: 120_000, label: '约 2 分钟' },
  { ms: 300_000, label: '约 5 分钟' }
] as const

export const PROACTIVE_BUBBLES = [
  '想你了～',
  '肚子饿饿…',
  '该休息一下啦',
  '陪我玩嘛',
  '今天也要开心呀',
  '摸摸头～',
  '喝杯水吧',
  '有点想睡觉…'
] as const

const IDLE_MIN_MS = 8_000
const IDLE_SPAN_MS = 10_000

export function clampProactiveIntervalMs(ms: number): number {
  if (!Number.isFinite(ms)) {
    return DEFAULT_PROACTIVE_INTERVAL_MS
  }
  return Math.min(MAX_PROACTIVE_INTERVAL_MS, Math.max(MIN_PROACTIVE_INTERVAL_MS, Math.round(ms)))
}

export function nextProactiveBubble(index: number): { text: string; nextIndex: number } {
  const text = PROACTIVE_BUBBLES[((index % PROACTIVE_BUBBLES.length) + PROACTIVE_BUBBLES.length) % PROACTIVE_BUBBLES.length]
  return { text, nextIndex: index + 1 }
}

export function nextIdleDelayMs(rng: () => number = Math.random): number {
  return IDLE_MIN_MS + Math.floor(clamp01(rng()) * IDLE_SPAN_MS)
}

/** Weighted pick of a gentle idle action. Staying idle is allowed. */
export function pickIdleTransition(rng: () => number = Math.random): PetMood {
  const roll = clamp01(rng())
  if (roll < 0.28) {
    return 'sleepy'
  }
  if (roll < 0.5) {
    return 'stretch'
  }
  if (roll < 0.72) {
    return 'hop'
  }
  if (roll < 0.9) {
    return 'slide'
  }
  return 'idle'
}

export function moodDurationMs(mood: PetMood): number {
  switch (mood) {
    case 'sleepy':
      return 10_000
    case 'stretch':
      return 1_600
    case 'hop':
      return 800
    case 'slide':
      return 900
    case 'reacting':
      return PET_ACTION_MS
    default:
      return 0
  }
}

export interface ProactiveSpeakInput {
  now: number
  nextAt: number
  enabled: boolean
  chatOpen: boolean
  petHidden: boolean
}

export function canSpeakProactively(input: ProactiveSpeakInput): boolean {
  return (
    input.enabled &&
    !input.chatOpen &&
    !input.petHidden &&
    input.now >= input.nextAt
  )
}

/** Schedule the next unprompted bubble, with jitter so it is not metronomic. */
export function scheduleNextProactiveAt(
  lastAt: number,
  intervalMs: number,
  rng: () => number = Math.random
): number {
  const interval = clampProactiveIntervalMs(intervalMs)
  const spread = Math.floor(interval * 0.35)
  return lastAt + interval + Math.floor(clamp01(rng()) * spread)
}

export function firstProactiveAt(now: number, intervalMs: number, rng: () => number = Math.random): number {
  const interval = clampProactiveIntervalMs(intervalMs)
  const grace = Math.max(PROACTIVE_STARTUP_GRACE_MS, Math.floor(interval * 0.35))
  const spread = Math.floor(interval * 0.25)
  return now + grace + Math.floor(clamp01(rng()) * spread)
}

/** After any bubble (click or proactive), wait at least cooldown + remaining interval. */
export function postponeAfterBubble(
  now: number,
  intervalMs: number,
  rng: () => number = Math.random
): number {
  const scheduled = scheduleNextProactiveAt(now, intervalMs, rng)
  return Math.max(scheduled, now + PROACTIVE_COOLDOWN_MS)
}

function clamp01(value: number): number {
  if (!Number.isFinite(value)) {
    return 0
  }
  return Math.min(1, Math.max(0, value))
}
