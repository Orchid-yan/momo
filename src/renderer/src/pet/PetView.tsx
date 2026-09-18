import { useEffect, useRef, useState, type JSX, type PointerEvent as ReactPointerEvent } from 'react'
import { isSignificantDrag } from '@shared/dragMath'
import {
  DOUBLE_CLICK_MS,
  PET_ACTION_BUBBLES,
  PET_ACTION_MS,
  nextPetAction,
  type PetAction
} from '@shared/petActions'
import {
  canSpeakProactively,
  DEFAULT_PROACTIVE_BUBBLES_ENABLED,
  DEFAULT_PROACTIVE_INTERVAL_MS,
  firstProactiveAt,
  moodDurationMs,
  nextIdleDelayMs,
  nextProactiveBubble,
  normalizePetRenderer,
  pickIdleTransition,
  postponeAfterBubble,
  type PetMood,
  type PetRenderer
} from '@shared/petLife'
import type { PublicSettings } from '@shared/types'
import MomoCat from './MomoCat'
import MomoCat3D from './MomoCat3D'

const SPEECH_HOLD_MS = 2800

export default function PetView(): JSX.Element {
  const [dragging, setDragging] = useState(false)
  const [mood, setMood] = useState<PetMood>('idle')
  const [action, setAction] = useState<PetAction | null>(null)
  const [bubble, setBubble] = useState<string | null>(null)
  const [petRenderer, setPetRenderer] = useState<PetRenderer>('3d')
  const actionIndex = useRef(0)
  const bubbleIndex = useRef(0)
  const clickTimer = useRef<number | null>(null)
  const actionTimer = useRef<number | null>(null)
  const moodTimer = useRef<number | null>(null)
  const proactiveTimer = useRef<number | null>(null)
  const speechTimer = useRef<number | null>(null)
  const nextProactiveAt = useRef(Date.now() + DEFAULT_PROACTIVE_INTERVAL_MS)
  const chatOpen = useRef(false)
  const bubblesEnabled = useRef(DEFAULT_PROACTIVE_BUBBLES_ENABLED)
  const bubbleIntervalMs = useRef(DEFAULT_PROACTIVE_INTERVAL_MS)
  const bubbleRef = useRef<string | null>(null)
  const moodRef = useRef<PetMood>('idle')
  const draggingRef = useRef(false)
  const gesture = useRef({
    active: false,
    dragged: false,
    startX: 0,
    startY: 0
  })

  const setMoodSafe = (next: PetMood): void => {
    moodRef.current = next
    setMood(next)
  }

  const showBubble = (text: string, holdMs = SPEECH_HOLD_MS): void => {
    bubbleRef.current = text
    setBubble(text)
    if (speechTimer.current !== null) {
      window.clearTimeout(speechTimer.current)
    }
    speechTimer.current = window.setTimeout(() => {
      bubbleRef.current = null
      setBubble(null)
      speechTimer.current = null
    }, holdMs)
  }

  const clearTimer = (slot: { current: number | null }): void => {
    if (slot.current !== null) {
      window.clearTimeout(slot.current)
      slot.current = null
    }
  }

  const startIdleLoop = (): void => {
    clearTimer(moodTimer)
    if (draggingRef.current || moodRef.current === 'reacting') {
      return
    }
    moodTimer.current = window.setTimeout(() => {
      if (draggingRef.current || moodRef.current === 'reacting') {
        startIdleLoop()
        return
      }
      const next = pickIdleTransition()
      if (next === 'idle') {
        startIdleLoop()
        return
      }
      setMoodSafe(next)
      moodTimer.current = window.setTimeout(() => {
        setMoodSafe('idle')
        startIdleLoop()
      }, moodDurationMs(next))
    }, nextIdleDelayMs())
  }

  const armProactive = (at: number): void => {
    nextProactiveAt.current = at
    clearTimer(proactiveTimer)
    const delay = Math.max(250, at - Date.now())
    proactiveTimer.current = window.setTimeout(() => {
      trySpeak()
    }, delay)
  }

  const trySpeak = (): void => {
    const now = Date.now()
    if (
      !canSpeakProactively({
        now,
        nextAt: nextProactiveAt.current,
        enabled: bubblesEnabled.current,
        chatOpen: chatOpen.current,
        petHidden: document.hidden
      })
    ) {
      if (!bubblesEnabled.current) {
        return
      }
      const retry = chatOpen.current || document.hidden ? now + 2_000 : nextProactiveAt.current
      armProactive(Math.max(retry, now + 1_000))
      return
    }
    if (bubbleRef.current || moodRef.current === 'reacting' || draggingRef.current) {
      armProactive(now + 3_000)
      return
    }
    const step = nextProactiveBubble(bubbleIndex.current)
    bubbleIndex.current = step.nextIndex
    showBubble(step.text)
    armProactive(postponeAfterBubble(now, bubbleIntervalMs.current))
  }

  const applyPrefs = (settings: PublicSettings): void => {
    const enabled = settings.proactiveBubblesEnabled
    const interval = settings.proactiveBubbleIntervalMs
    const enabledChanged = enabled !== bubblesEnabled.current
    const intervalChanged = interval !== bubbleIntervalMs.current
    bubblesEnabled.current = enabled
    bubbleIntervalMs.current = interval
    if (!enabled) {
      clearTimer(proactiveTimer)
      return
    }
    if (enabledChanged || intervalChanged) {
      armProactive(firstProactiveAt(Date.now(), interval))
    }
  }

  useEffect(() => {
    void window.momo.getSettings().then((settings) => {
      setPetRenderer(normalizePetRenderer(settings.petRenderer))
      applyPrefs(settings)
      armProactive(firstProactiveAt(Date.now(), settings.proactiveBubbleIntervalMs))
    })
    const stopSettings = window.momo.onSettingsChanged((settings) => {
      setPetRenderer(normalizePetRenderer(settings.petRenderer))
      applyPrefs(settings)
    })
    const stopChat = window.momo.onChatVisible((visible) => {
      chatOpen.current = visible
      if (!visible && bubblesEnabled.current) {
        armProactive(Math.max(nextProactiveAt.current, Date.now() + 1_500))
      }
    })
    const onVisibility = (): void => {
      if (!document.hidden && bubblesEnabled.current) {
        armProactive(Math.max(nextProactiveAt.current, Date.now() + 1_000))
      }
    }
    document.addEventListener('visibilitychange', onVisibility)
    startIdleLoop()
    return () => {
      stopSettings()
      stopChat()
      document.removeEventListener('visibilitychange', onVisibility)
      clearTimer(clickTimer)
      clearTimer(actionTimer)
      clearTimer(moodTimer)
      clearTimer(proactiveTimer)
      clearTimer(speechTimer)
    }
    // Mount-only: timers and IPC subscriptions.
  }, [])

  const openChat = (): void => {
    window.momo.openChat()
  }

  const playCuteAction = (): void => {
    const step = nextPetAction(actionIndex.current)
    actionIndex.current = step.nextIndex
    setAction(step.action)
    setMoodSafe('reacting')
    showBubble(PET_ACTION_BUBBLES[step.action], PET_ACTION_MS)
    clearTimer(moodTimer)
    clearTimer(actionTimer)
    actionTimer.current = window.setTimeout(() => {
      setAction(null)
      setMoodSafe('idle')
      actionTimer.current = null
      startIdleLoop()
    }, PET_ACTION_MS)
    armProactive(postponeAfterBubble(Date.now(), bubbleIntervalMs.current))
  }

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>): void => {
    if (event.button !== 0) {
      return
    }
    gesture.current = {
      active: true,
      dragged: false,
      startX: event.screenX,
      startY: event.screenY
    }
    event.currentTarget.setPointerCapture(event.pointerId)
    window.momo.beginDrag()
  }

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>): void => {
    if (!gesture.current.active) {
      return
    }
    const dx = event.screenX - gesture.current.startX
    const dy = event.screenY - gesture.current.startY
    if (!gesture.current.dragged && isSignificantDrag(dx, dy)) {
      gesture.current.dragged = true
      draggingRef.current = true
      setDragging(true)
      if (clickTimer.current !== null) {
        window.clearTimeout(clickTimer.current)
        clickTimer.current = null
      }
    }
    if (gesture.current.dragged) {
      window.momo.dragMove()
    }
  }

  const endGesture = (event: ReactPointerEvent<HTMLDivElement>): void => {
    if (!gesture.current.active) {
      return
    }
    const wasDrag = gesture.current.dragged
    gesture.current.active = false
    gesture.current.dragged = false
    draggingRef.current = false
    setDragging(false)
    window.momo.endDrag()
    try {
      event.currentTarget.releasePointerCapture(event.pointerId)
    } catch {
      // capture may already be released
    }
    if (wasDrag) {
      if (moodRef.current !== 'reacting') {
        startIdleLoop()
      }
      return
    }
    if (clickTimer.current !== null) {
      window.clearTimeout(clickTimer.current)
      clickTimer.current = null
      openChat()
      return
    }
    clickTimer.current = window.setTimeout(() => {
      clickTimer.current = null
      playCuteAction()
    }, DOUBLE_CLICK_MS)
  }

  return (
    <div
      className={`pet-stage${dragging ? ' is-dragging' : ''}${action ? ` is-acting act-${action}` : ''} mood-${mood} renderer-${petRenderer}`}
      data-action={action ?? ''}
      data-mood={mood}
      data-bubble={bubble ?? ''}
      data-renderer={petRenderer}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endGesture}
      onPointerCancel={endGesture}
      onContextMenu={(event) => {
        event.preventDefault()
        window.momo.showMenu()
      }}
    >
      <div className="pet-stack">
        {bubble ? (
          <div className="pet-speech" data-testid="pet-speech">
            {bubble}
          </div>
        ) : (
          <div className="pet-hint">拖我走动 · 点我撒娇 · 双击聊天</div>
        )}
        <div className={`pet-cat${petRenderer === '3d' ? ' is-3d' : ''}`} aria-label="拖动或点按 Momo，双击打开聊天" data-testid="momo-pet">
          {petRenderer === '3d' ? <MomoCat3D action={action} mood={mood} /> : <MomoCat action={action} mood={mood} />}
        </div>
      </div>
    </div>
  )
}
