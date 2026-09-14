import { useEffect, useRef, useState, type JSX, type PointerEvent as ReactPointerEvent } from 'react'
import { isSignificantDrag } from '@shared/dragMath'
import {
  DOUBLE_CLICK_MS,
  PET_ACTION_BUBBLES,
  PET_ACTION_MS,
  nextPetAction,
  type PetAction
} from '@shared/petActions'
import MomoCat from './MomoCat'

export default function PetView(): JSX.Element {
  const [dragging, setDragging] = useState(false)
  const [action, setAction] = useState<PetAction | null>(null)
  const [bubble, setBubble] = useState<string | null>(null)
  const actionIndex = useRef(0)
  const clickTimer = useRef<number | null>(null)
  const actionTimer = useRef<number | null>(null)
  const gesture = useRef({
    active: false,
    dragged: false,
    startX: 0,
    startY: 0
  })

  useEffect(() => {
    return () => {
      if (clickTimer.current !== null) {
        window.clearTimeout(clickTimer.current)
      }
      if (actionTimer.current !== null) {
        window.clearTimeout(actionTimer.current)
      }
    }
  }, [])

  const openChat = (): void => {
    window.momo.openChat()
  }

  const playCuteAction = (): void => {
    const step = nextPetAction(actionIndex.current)
    actionIndex.current = step.nextIndex
    setAction(step.action)
    setBubble(PET_ACTION_BUBBLES[step.action])
    if (actionTimer.current !== null) {
      window.clearTimeout(actionTimer.current)
    }
    actionTimer.current = window.setTimeout(() => {
      setAction(null)
      setBubble(null)
      actionTimer.current = null
    }, PET_ACTION_MS)
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
    setDragging(false)
    window.momo.endDrag()
    try {
      event.currentTarget.releasePointerCapture(event.pointerId)
    } catch {
      // capture may already be released
    }
    if (wasDrag) {
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
      className={`pet-stage${dragging ? ' is-dragging' : ''}`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endGesture}
      onPointerCancel={endGesture}
      onContextMenu={(event) => {
        event.preventDefault()
        window.momo.showMenu()
      }}
    >
      {bubble ? (
        <div className="pet-speech" data-testid="pet-speech">
          {bubble}
        </div>
      ) : (
        <div className="pet-hint">拖我走动 · 点我撒娇 · 双击聊天</div>
      )}
      <div className="pet-cat" aria-label="拖动或点按 Momo，双击打开聊天" data-testid="momo-pet">
        <MomoCat action={action} />
      </div>
    </div>
  )
}
