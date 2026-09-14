import type { JSX } from 'react'
import type { PetAction } from '@shared/petActions'

interface MomoCatProps {
  action?: PetAction | null
}

export default function MomoCat({ action = null }: MomoCatProps): JSX.Element {
  const acting = action ? ` is-acting act-${action}` : ''
  return (
    <svg
      className={`momo-svg${acting}`}
      viewBox="0 0 220 200"
      role="img"
      aria-label="Momo，一只圆滚滚的小猫"
    >
      <ellipse className="momo-shadow" cx="110" cy="184" rx="48" ry="8" fill="rgba(74,50,40,0.16)" />
      <g className="momo-bounce">
        <g className="momo-actor">
          <g className="momo-hearts" aria-hidden>
            <path d="M48 54 C48 46 58 44 62 52 C66 44 76 46 76 54 C76 64 62 72 62 72 C62 72 48 64 48 54Z" fill="#ff8fab" />
            <path d="M148 40 C148 33 156 32 159 38 C162 32 170 33 170 40 C170 48 159 55 159 55 C159 55 148 48 148 40Z" fill="#ff6b93" />
            <path d="M168 78 C168 73 174 72 176 76 C178 72 184 73 184 78 C184 84 176 89 176 89 C176 89 168 84 168 78Z" fill="#ffb3c6" />
          </g>
          <g className="momo-tail">
            <path
              d="M158 128 C188 122 194 86 176 70"
              fill="none"
              stroke="#f0b48a"
              strokeWidth="16"
              strokeLinecap="round"
            />
            <path
              d="M158 128 C188 122 194 86 176 70"
              fill="none"
              stroke="#ffe0c2"
              strokeWidth="10"
              strokeLinecap="round"
            />
          </g>
          <ellipse cx="110" cy="138" rx="50" ry="40" fill="#ffd7b5" />
          <ellipse cx="110" cy="148" rx="34" ry="24" fill="#fff1e2" />
          <g className="momo-paw-l">
            <ellipse cx="86" cy="166" rx="15" ry="11" fill="#ffe6cf" />
            <ellipse cx="82" cy="168" rx="3" ry="2.2" fill="#f5b7a0" />
            <ellipse cx="88" cy="169" rx="3" ry="2.2" fill="#f5b7a0" />
            <ellipse cx="93" cy="167" rx="2.4" ry="1.8" fill="#f5b7a0" />
          </g>
          <g className="momo-paw-r">
            <ellipse cx="134" cy="166" rx="15" ry="11" fill="#ffe6cf" />
            <ellipse cx="129" cy="168" rx="3" ry="2.2" fill="#f5b7a0" />
            <ellipse cx="135" cy="169" rx="3" ry="2.2" fill="#f5b7a0" />
            <ellipse cx="140" cy="167" rx="2.4" ry="1.8" fill="#f5b7a0" />
          </g>
          <rect x="94" y="118" width="32" height="16" rx="8" fill="#ff8fab" />
          <circle cx="110" cy="134" r="6.5" fill="#ffd56a" stroke="#e8b84a" strokeWidth="1" />
          <circle cx="110" cy="134" r="2.2" fill="#c9892f" />
          <g className="momo-ear-l">
            <path d="M68 78 C62 36 98 52 98 68 Z" fill="#ffd7b5" />
            <path d="M72 74 C70 48 94 58 94 68 Z" fill="#ffb3c6" />
          </g>
          <g className="momo-ear-r">
            <path d="M152 78 C158 36 122 52 122 68 Z" fill="#ffd7b5" />
            <path d="M148 74 C150 48 126 58 126 68 Z" fill="#ffb3c6" />
          </g>
          <circle cx="110" cy="86" r="48" fill="#ffd7b5" />
          <circle cx="84" cy="102" r="12" fill="#ffc2b8" opacity="0.72" />
          <circle cx="136" cy="102" r="12" fill="#ffc2b8" opacity="0.72" />
          <g className="momo-eyes">
            <ellipse cx="92" cy="84" rx="10" ry="12" fill="#3d2b1f" />
            <ellipse cx="128" cy="84" rx="10" ry="12" fill="#3d2b1f" />
            <circle cx="88" cy="79" r="3.2" fill="#fff" />
            <circle cx="124" cy="79" r="3.2" fill="#fff" />
            <circle cx="95" cy="88" r="1.4" fill="#fff" opacity="0.7" />
            <circle cx="131" cy="88" r="1.4" fill="#fff" opacity="0.7" />
          </g>
          <g className="momo-heart-eyes">
            <path d="M84 76 C84 70 92 69 94 76 C96 69 104 70 104 76 C104 84 94 90 94 90 C94 90 84 84 84 76Z" fill="#ff6b93" />
            <path d="M120 76 C120 70 128 69 130 76 C132 69 140 70 140 76 C140 84 130 90 130 90 C130 90 120 84 120 76Z" fill="#ff6b93" />
          </g>
          <g className="momo-closed-eyes">
            <path d="M82 84 Q92 90 102 84" fill="none" stroke="#3d2b1f" strokeWidth="2.4" strokeLinecap="round" />
            <path d="M118 84 Q128 90 138 84" fill="none" stroke="#3d2b1f" strokeWidth="2.4" strokeLinecap="round" />
          </g>
          <ellipse cx="110" cy="98" rx="5" ry="3.6" fill="#f08a86" />
          <path
            d="M110 101 Q100 110 90 104"
            fill="none"
            stroke="#3d2b1f"
            strokeWidth="1.7"
            strokeLinecap="round"
          />
          <path
            d="M110 101 Q120 110 130 104"
            fill="none"
            stroke="#3d2b1f"
            strokeWidth="1.7"
            strokeLinecap="round"
          />
          <path d="M68 88 H50" stroke="#d4a07c" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M69 95 H48" stroke="#d4a07c" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M152 88 H170" stroke="#d4a07c" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M151 95 H172" stroke="#d4a07c" strokeWidth="1.5" strokeLinecap="round" />
        </g>
      </g>
    </svg>
  )
}
