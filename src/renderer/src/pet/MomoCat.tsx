import type { JSX } from 'react'
import type { PetAction } from '@shared/petActions'
import type { PetMood } from '@shared/petLife'
import momoIdle from '../assets/momo-idle.png'

interface MomoCatProps {
  action?: PetAction | null
  mood?: PetMood
}

export default function MomoCat({ action = null, mood = 'idle' }: MomoCatProps): JSX.Element {
  const acting = action ? ` is-acting act-${action}` : ` is-${mood}`
  return (
    <div className={`momo-png-wrap${acting}`}>
      <span className="momo-fx momo-fx-hearts" aria-hidden>
        ♡
      </span>
      <span className="momo-fx momo-fx-hearts momo-fx-hearts-r" aria-hidden>
        ♡
      </span>
      <span className="momo-fx momo-fx-sparkles" aria-hidden>
        ✦
      </span>
      <span className="momo-fx momo-fx-zzz" aria-hidden>
        zzz
      </span>
      <img
        className="momo-png"
        src={momoIdle}
        alt="Momo，一只毛茸茸的杏橘色小猫"
        draggable={false}
      />
    </div>
  )
}
