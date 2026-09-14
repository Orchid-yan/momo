import { useRef, useState, type JSX, type PointerEvent as ReactPointerEvent } from 'react'
import { isSignificantDrag } from '@shared/dragMath'
import MomoCat from './MomoCat'

export default function PetView(): JSX.Element {
  const [clicked, setClicked] = useState(false)
  const [dragging, setDragging] = useState(false)
  const gesture = useRef({
    active: false,
    dragged: false,
    startX: 0,
    startY: 0
  })

  const openChat = (): void => {
    setClicked(true)
    window.setTimeout(() => setClicked(false), 450)
    window.momo.openChat()
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
    if (!wasDrag) {
      openChat()
    }
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
      <div className="pet-hint">拖我走动 · 点我聊天</div>
      <button
        type="button"
        className="pet-cat"
        aria-label="拖动 Momo，或点击打开聊天"
        data-testid="momo-pet"
        tabIndex={-1}
      >
        <MomoCat clicked={clicked} />
      </button>
    </div>
  )
}
