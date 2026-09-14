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
      viewBox="0 0 240 220"
      role="img"
      aria-label="Momo，一只圆滚滚的小猫"
    >
      <defs>
        <radialGradient id="momoFur" cx="38%" cy="28%" r="72%">
          <stop offset="0%" stopColor="#fff7ee" />
          <stop offset="48%" stopColor="#ffd9b4" />
          <stop offset="100%" stopColor="#f3b184" />
        </radialGradient>
        <radialGradient id="momoBelly" cx="50%" cy="35%" r="70%">
          <stop offset="0%" stopColor="#fffdf9" />
          <stop offset="100%" stopColor="#ffe8d2" />
        </radialGradient>
        <radialGradient id="momoEarIn" cx="50%" cy="72%" r="65%">
          <stop offset="0%" stopColor="#ffd0de" />
          <stop offset="100%" stopColor="#ff8fb3" />
        </radialGradient>
        <radialGradient id="momoEye" cx="32%" cy="28%" r="75%">
          <stop offset="0%" stopColor="#6a4632" />
          <stop offset="100%" stopColor="#2c1810" />
        </radialGradient>
        <radialGradient id="momoNose" cx="50%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#ffb3b8" />
          <stop offset="100%" stopColor="#f07a86" />
        </radialGradient>
      </defs>

      <ellipse className="momo-shadow" cx="120" cy="206" rx="52" ry="8" fill="rgba(74,50,40,0.18)" />

      <g className="momo-bounce">
        <g className="momo-actor">
          <g className="momo-hearts" aria-hidden>
            <path
              d="M46 58 C46 49 57 47 62 56 C67 47 78 49 78 58 C78 70 62 80 62 80 C62 80 46 70 46 58Z"
              fill="#ff8fab"
            />
            <path
              d="M162 36 C162 28 172 26 176 34 C180 26 190 28 190 36 C190 46 176 55 176 55 C176 55 162 46 162 36Z"
              fill="#ff6b93"
            />
            <path
              d="M186 78 C186 72 193 71 196 76 C199 71 206 72 206 78 C206 86 196 92 196 92 C196 92 186 86 186 78Z"
              fill="#ffb3c6"
            />
          </g>

          <g className="momo-sparkles" aria-hidden>
            <path d="M28 96 L31 104 L39 107 L31 110 L28 118 L25 110 L17 107 L25 104 Z" fill="#ffe066" />
            <path d="M208 58 L210 64 L216 66 L210 68 L208 74 L206 68 L200 66 L206 64 Z" fill="#fff1a8" />
            <path d="M200 120 L202 125 L207 127 L202 129 L200 134 L198 129 L193 127 L198 125 Z" fill="#ffd6ea" />
          </g>

          <g className="momo-tail">
            <path
              d="M168 148 C204 138 214 96 192 72"
              fill="none"
              stroke="#f0b48a"
              strokeWidth="18"
              strokeLinecap="round"
            />
            <path
              d="M168 148 C204 138 214 96 192 72"
              fill="none"
              stroke="#ffe3c8"
              strokeWidth="11"
              strokeLinecap="round"
            />
            <circle cx="192" cy="72" r="9" fill="#ffe3c8" />
          </g>

          <ellipse cx="120" cy="156" rx="56" ry="44" fill="url(#momoFur)" />
          <ellipse cx="120" cy="168" rx="36" ry="26" fill="url(#momoBelly)" />

          <g className="momo-paw-l">
            <ellipse cx="92" cy="186" rx="17" ry="12" fill="#ffe6cf" />
            <ellipse cx="86" cy="188" rx="3.2" ry="2.4" fill="#f5b7a0" />
            <ellipse cx="93" cy="190" rx="3.2" ry="2.4" fill="#f5b7a0" />
            <ellipse cx="100" cy="188" rx="2.6" ry="2" fill="#f5b7a0" />
          </g>
          <g className="momo-paw-r">
            <ellipse cx="148" cy="186" rx="17" ry="12" fill="#ffe6cf" />
            <ellipse cx="142" cy="188" rx="3.2" ry="2.4" fill="#f5b7a0" />
            <ellipse cx="149" cy="190" rx="3.2" ry="2.4" fill="#f5b7a0" />
            <ellipse cx="156" cy="188" rx="2.6" ry="2" fill="#f5b7a0" />
          </g>

          <g className="momo-ear-l">
            <path d="M68 92 C58 28 112 48 108 86 Z" fill="url(#momoFur)" />
            <path d="M74 88 C70 48 104 60 102 84 Z" fill="url(#momoEarIn)" />
          </g>
          <g className="momo-ear-r">
            <path d="M172 92 C182 28 128 48 132 86 Z" fill="url(#momoFur)" />
            <path d="M166 88 C170 48 136 60 138 84 Z" fill="url(#momoEarIn)" />
          </g>

          <circle cx="120" cy="96" r="58" fill="url(#momoFur)" />
          <ellipse cx="120" cy="118" rx="28" ry="18" fill="#fff6ee" opacity="0.9" />
          <circle cx="86" cy="116" r="16" fill="#ffc2bc" opacity="0.78" />
          <circle cx="154" cy="116" r="16" fill="#ffc2bc" opacity="0.78" />

          <g className="momo-eyes">
            <ellipse cx="98" cy="92" rx="13" ry="15.5" fill="url(#momoEye)" />
            <ellipse cx="142" cy="92" rx="13" ry="15.5" fill="url(#momoEye)" />
            <circle cx="93" cy="85" r="4.4" fill="#fff" />
            <circle cx="137" cy="85" r="4.4" fill="#fff" />
            <circle cx="102" cy="97" r="1.8" fill="#fff" opacity="0.85" />
            <circle cx="146" cy="97" r="1.8" fill="#fff" opacity="0.85" />
          </g>

          <g className="momo-heart-eyes">
            <path
              d="M86 80 C86 72 96 70 99 79 C102 70 112 72 112 80 C112 91 99 100 99 100 C99 100 86 91 86 80Z"
              fill="#ff6b93"
            />
            <path
              d="M130 80 C130 72 140 70 143 79 C146 70 156 72 156 80 C156 91 143 100 143 100 C143 100 130 91 130 80Z"
              fill="#ff6b93"
            />
          </g>

          <g className="momo-closed-eyes">
            <path
              d="M86 94 Q98 104 110 94"
              fill="none"
              stroke="#3d2b1f"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <path
              d="M130 94 Q142 104 154 94"
              fill="none"
              stroke="#3d2b1f"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </g>

          <ellipse cx="120" cy="112" rx="6.2" ry="4.4" fill="url(#momoNose)" />
          <path
            d="M120 116 Q108 128 96 121"
            fill="none"
            stroke="#3d2b1f"
            strokeWidth="1.9"
            strokeLinecap="round"
          />
          <path
            d="M120 116 Q132 128 144 121"
            fill="none"
            stroke="#3d2b1f"
            strokeWidth="1.9"
            strokeLinecap="round"
          />

          <path d="M72 96 H50" stroke="#d4a07c" strokeWidth="1.4" strokeLinecap="round" />
          <path d="M73 104 H48" stroke="#d4a07c" strokeWidth="1.4" strokeLinecap="round" />
          <path d="M74 111 H54" stroke="#d4a07c" strokeWidth="1.4" strokeLinecap="round" />
          <path d="M168 96 H190" stroke="#d4a07c" strokeWidth="1.4" strokeLinecap="round" />
          <path d="M167 104 H192" stroke="#d4a07c" strokeWidth="1.4" strokeLinecap="round" />
          <path d="M166 111 H186" stroke="#d4a07c" strokeWidth="1.4" strokeLinecap="round" />
        </g>
      </g>
    </svg>
  )
}
