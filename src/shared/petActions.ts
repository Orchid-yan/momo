export const DOUBLE_CLICK_MS = 400

export const PET_ACTIONS = ['roll', 'nuzzle', 'stretch', 'wave', 'sparkle'] as const

export type PetAction = (typeof PET_ACTIONS)[number]

export const PET_ACTION_BUBBLES: Record<PetAction, string> = {
  roll: '打滚～',
  nuzzle: '再摸摸',
  stretch: '伸懒腰',
  wave: '喵～',
  sparkle: '喜欢你'
}

export const PET_ACTION_MS = 1400

export function nextPetAction(index: number): { action: PetAction; nextIndex: number } {
  const action = PET_ACTIONS[((index % PET_ACTIONS.length) + PET_ACTIONS.length) % PET_ACTIONS.length]
  return { action, nextIndex: index + 1 }
}

export function isDoubleClick(
  now: number,
  pendingClickAt: number | null,
  windowMs = DOUBLE_CLICK_MS
): boolean {
  return pendingClickAt !== null && now - pendingClickAt <= windowMs
}
