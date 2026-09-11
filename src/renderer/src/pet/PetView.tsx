import { useState, type JSX } from 'react'
import MomoCat from './MomoCat'

export default function PetView(): JSX.Element {
  const [clicked, setClicked] = useState(false)

  const openChat = (): void => {
    setClicked(true)
    window.setTimeout(() => setClicked(false), 450)
    window.momo.openChat()
  }

  return (
    <div className="pet-stage">
      <div className="pet-hint">戳我聊天</div>
      <button
        type="button"
        className="pet-cat"
        aria-label="打开 Momo 聊天"
        onClick={openChat}
        data-testid="momo-pet"
        onContextMenu={(event) => {
          event.preventDefault()
          window.momo.showMenu()
        }}
      >
        <MomoCat clicked={clicked} />
      </button>
    </div>
  )
}
