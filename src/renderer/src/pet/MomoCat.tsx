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
      viewBox="0 0 240 240"
      role="img"
      aria-label="Momo，一只坐着的奶油色小猫"
    >
      <defs>
        <radialGradient id="momoFur" cx="36%" cy="28%" r="74%">
          <stop offset="0%" stopColor="#fff8ee" />
          <stop offset="42%" stopColor="#f6d4b4" />
          <stop offset="100%" stopColor="#e4ae84" />
        </radialGradient>
        <radialGradient id="momoBelly" cx="50%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#fffdf9" />
          <stop offset="100%" stopColor="#ffe9d4" />
        </radialGradient>
        <radialGradient id="momoEarIn" cx="50%" cy="70%" r="62%">
          <stop offset="0%" stopColor="#ffd7e2" />
          <stop offset="100%" stopColor="#ff9bb4" />
        </radialGradient>
        <radialGradient id="momoIris" cx="36%" cy="30%" r="72%">
          <stop offset="0%" stopColor="#f3cc62" />
          <stop offset="48%" stopColor="#d09132" />
          <stop offset="100%" stopColor="#6b4014" />
        </radialGradient>
        <radialGradient id="momoNose" cx="50%" cy="28%" r="70%">
          <stop offset="0%" stopColor="#ffc2c6" />
          <stop offset="100%" stopColor="#ef7e8c" />
        </radialGradient>
      </defs>

      <ellipse className="momo-shadow" cx="120" cy="226" rx="36" ry="6" fill="rgba(74,50,40,0.16)" />

      <g className="momo-bounce">
        <g className="momo-actor">
          <g className="momo-hearts" aria-hidden>
            <path
              d="M52 70 C52 62 62 60 66 68 C70 60 80 62 80 70 C80 80 66 90 66 90 C66 90 52 80 52 70Z"
              fill="#ff8fab"
            />
            <path
              d="M164 40 C164 33 173 31 176 39 C179 31 188 33 188 40 C188 50 176 58 176 58 C176 58 164 50 164 40Z"
              fill="#ff6b93"
            />
            <path
              d="M190 86 C190 80 197 79 199 84 C201 79 208 80 208 86 C208 94 199 100 199 100 C199 100 190 94 190 86Z"
              fill="#ffb3c6"
            />
          </g>

          <g className="momo-sparkles" aria-hidden>
            <path d="M32 92 L35 100 L43 103 L35 106 L32 114 L29 106 L21 103 L29 100 Z" fill="#ffe066" />
            <path d="M206 56 L208 62 L214 64 L208 66 L206 72 L204 66 L198 64 L204 62 Z" fill="#fff1a8" />
            <path d="M198 128 L200 133 L205 135 L200 137 L198 142 L196 137 L191 135 L196 133 Z" fill="#ffd6ea" />
          </g>

          <g className="momo-tail">
            <path
              d="M150 176 C186 168 198 124 184 96 C176 78 160 74 166 56"
              fill="none"
              stroke="#e8b48a"
              strokeWidth="11"
              strokeLinecap="round"
            />
            <path
              d="M150 176 C186 168 198 124 184 96 C176 78 160 74 166 56"
              fill="none"
              stroke="#ffe6cc"
              strokeWidth="6.5"
              strokeLinecap="round"
            />
            <circle cx="166" cy="56" r="6" fill="#ffe6cc" />
            <path
              d="M176 118 C178 110 174 104 176 98"
              fill="none"
              stroke="#d59a6e"
              strokeWidth="2"
              strokeLinecap="round"
              opacity="0.45"
            />
            <path
              d="M182 146 C184 138 180 132 182 126"
              fill="none"
              stroke="#d59a6e"
              strokeWidth="2"
              strokeLinecap="round"
              opacity="0.35"
            />
          </g>

          <ellipse cx="96" cy="188" rx="18" ry="22" fill="url(#momoFur)" />
          <ellipse cx="144" cy="188" rx="18" ry="22" fill="url(#momoFur)" />
          <ellipse cx="120" cy="170" rx="32" ry="46" fill="url(#momoFur)" />
          <ellipse cx="120" cy="176" rx="20" ry="28" fill="url(#momoBelly)" />

          <g className="momo-paw-l">
            <ellipse cx="102" cy="210" rx="11" ry="7.2" fill="#ffe8d2" />
            <ellipse cx="97" cy="212" rx="2.1" ry="1.6" fill="#f0b4a0" />
            <ellipse cx="102" cy="213" rx="2.1" ry="1.6" fill="#f0b4a0" />
            <ellipse cx="107" cy="212" rx="1.8" ry="1.4" fill="#f0b4a0" />
          </g>
          <g className="momo-paw-r">
            <ellipse cx="138" cy="210" rx="11" ry="7.2" fill="#ffe8d2" />
            <ellipse cx="133" cy="212" rx="2.1" ry="1.6" fill="#f0b4a0" />
            <ellipse cx="138" cy="213" rx="2.1" ry="1.6" fill="#f0b4a0" />
            <ellipse cx="143" cy="212" rx="1.8" ry="1.4" fill="#f0b4a0" />
          </g>

          <g className="momo-ear-l">
            <path d="M90 90 C80 78 78 40 102 36 C112 34 114 68 110 88 Z" fill="url(#momoFur)" />
            <path d="M92 86 C86 72 88 48 102 46 C108 46 108 70 106 86 Z" fill="url(#momoEarIn)" />
          </g>
          <g className="momo-ear-r">
            <path d="M150 90 C160 78 162 40 138 36 C128 34 126 68 130 88 Z" fill="url(#momoFur)" />
            <path d="M148 86 C154 72 152 48 138 46 C132 46 132 70 134 86 Z" fill="url(#momoEarIn)" />
          </g>

          <ellipse cx="120" cy="100" rx="40" ry="37" fill="url(#momoFur)" />
          <path
            d="M108 74 Q112 84 108 90"
            fill="none"
            stroke="#d59a6e"
            strokeWidth="2.4"
            strokeLinecap="round"
            opacity="0.42"
          />
          <path
            d="M120 72 Q120 84 120 91"
            fill="none"
            stroke="#d59a6e"
            strokeWidth="2.6"
            strokeLinecap="round"
            opacity="0.4"
          />
          <path
            d="M132 74 Q128 84 132 90"
            fill="none"
            stroke="#d59a6e"
            strokeWidth="2.4"
            strokeLinecap="round"
            opacity="0.42"
          />
          <ellipse cx="120" cy="118" rx="14" ry="8" fill="#fff8f0" opacity="0.55" />
          <ellipse cx="94" cy="114" rx="7.5" ry="3.8" fill="#ffb4ba" opacity="0.38" />
          <ellipse cx="146" cy="114" rx="7.5" ry="3.8" fill="#ffb4ba" opacity="0.38" />

          <g className="momo-eyes">
            <ellipse cx="104" cy="96" rx="11" ry="13.2" fill="#fffdf6" />
            <ellipse cx="136" cy="96" rx="11" ry="13.2" fill="#fffdf6" />
            <ellipse cx="104" cy="97" rx="9.4" ry="11.4" fill="url(#momoIris)" />
            <ellipse cx="136" cy="97" rx="9.4" ry="11.4" fill="url(#momoIris)" />
            <ellipse cx="104" cy="98" rx="3.1" ry="6.8" fill="#2a1810" />
            <ellipse cx="136" cy="98" rx="3.1" ry="6.8" fill="#2a1810" />
            <circle cx="100.5" cy="91.5" r="3.1" fill="#fff" />
            <circle cx="132.5" cy="91.5" r="3.1" fill="#fff" />
            <circle cx="107" cy="101" r="1.15" fill="#fff" opacity="0.85" />
            <circle cx="139" cy="101" r="1.15" fill="#fff" opacity="0.85" />
          </g>

          <g className="momo-heart-eyes">
            <path
              d="M93 86 C93 79 102 77 105 85 C108 77 117 79 117 86 C117 96 105 104 105 104 C105 104 93 96 93 86Z"
              fill="#ff6b93"
            />
            <path
              d="M125 86 C125 79 134 77 137 85 C140 77 149 79 149 86 C149 96 137 104 137 104 C137 104 125 96 125 86Z"
              fill="#ff6b93"
            />
          </g>

          <g className="momo-closed-eyes">
            <path
              d="M94 98 Q104 106 114 98"
              fill="none"
              stroke="#3d2b1f"
              strokeWidth="2.4"
              strokeLinecap="round"
            />
            <path
              d="M126 98 Q136 106 146 98"
              fill="none"
              stroke="#3d2b1f"
              strokeWidth="2.4"
              strokeLinecap="round"
            />
          </g>

          <ellipse cx="120" cy="113.5" rx="3.3" ry="2.3" fill="url(#momoNose)" />
          <path
            d="M120 115.6 Q115 119.8 110.5 116.4"
            fill="none"
            stroke="#5a3828"
            strokeWidth="1.3"
            strokeLinecap="round"
          />
          <path
            d="M120 115.6 Q125 119.8 129.5 116.4"
            fill="none"
            stroke="#5a3828"
            strokeWidth="1.3"
            strokeLinecap="round"
          />

          <path d="M86 104 H64" stroke="#d4a07c" strokeWidth="1.15" strokeLinecap="round" />
          <path d="M86 111 H62" stroke="#d4a07c" strokeWidth="1.15" strokeLinecap="round" />
          <path d="M88 118 H66" stroke="#d4a07c" strokeWidth="1.15" strokeLinecap="round" />
          <path d="M154 104 H176" stroke="#d4a07c" strokeWidth="1.15" strokeLinecap="round" />
          <path d="M154 111 H178" stroke="#d4a07c" strokeWidth="1.15" strokeLinecap="round" />
          <path d="M152 118 H174" stroke="#d4a07c" strokeWidth="1.15" strokeLinecap="round" />
        </g>
      </g>
    </svg>
  )
}
