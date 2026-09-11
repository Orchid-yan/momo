import type { JSX } from 'react'

interface MomoCatProps {
  clicked?: boolean
}

export default function MomoCat({ clicked = false }: MomoCatProps): JSX.Element {
  return (
    <svg
      className={`momo-svg${clicked ? ' momo-clicked' : ''}`}
      viewBox="0 0 200 180"
      role="img"
      aria-label="Momo，一只坐着的小猫"
    >
      <ellipse cx="100" cy="168" rx="46" ry="8" fill="rgba(74,50,40,0.18)" />
      <g className="momo-bounce">
        <g className="momo-tail">
          <path
            d="M148 128 C176 122 178 88 164 72"
            fill="none"
            stroke="#f0b48a"
            strokeWidth="14"
            strokeLinecap="round"
          />
          <path
            d="M148 128 C176 122 178 88 164 72"
            fill="none"
            stroke="#ffd7b5"
            strokeWidth="8"
            strokeLinecap="round"
          />
        </g>
        <ellipse cx="102" cy="128" rx="46" ry="38" fill="#ffd7b5" />
        <ellipse cx="102" cy="136" rx="32" ry="24" fill="#ffe7cf" />
        <ellipse cx="84" cy="150" rx="12" ry="9" fill="#ffe9d4" />
        <ellipse cx="118" cy="150" rx="12" ry="9" fill="#ffe9d4" />
        <rect x="86" y="108" width="32" height="18" rx="9" fill="#ff8fab" />
        <circle cx="102" cy="126" r="6" fill="#f4d35e" stroke="#e0b94a" strokeWidth="1" />
        <circle cx="102" cy="126" r="2" fill="#c9892f" />
        <g className="momo-ear-l">
          <path d="M58 78 L52 42 L86 58 Z" fill="#ffd7b5" />
          <path d="M62 72 L56 48 L80 60 Z" fill="#ffb7c5" />
        </g>
        <path d="M142 78 L148 42 L114 58 Z" fill="#ffd7b5" />
        <path d="M138 72 L144 48 L120 60 Z" fill="#ffb7c5" />
        <circle cx="100" cy="82" r="42" fill="#ffd7b5" />
        <circle cx="78" cy="96" r="10" fill="#ffc2b3" opacity="0.7" />
        <circle cx="122" cy="96" r="10" fill="#ffc2b3" opacity="0.7" />
        <g className="momo-eyes">
          <ellipse cx="84" cy="80" rx="8.5" ry="10" fill="#3d2b1f" />
          <ellipse cx="116" cy="80" rx="8.5" ry="10" fill="#3d2b1f" />
          <circle cx="81" cy="76" r="2.4" fill="#fff" />
          <circle cx="113" cy="76" r="2.4" fill="#fff" />
        </g>
        <path d="M100 90 L96 96 Q100 100 104 96 Z" fill="#e8918a" />
        <path
          d="M100 97 Q90 104 84 100"
          fill="none"
          stroke="#3d2b1f"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        <path
          d="M100 97 Q110 104 116 100"
          fill="none"
          stroke="#3d2b1f"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        <path d="M62 86 H46" stroke="#c9896a" strokeWidth="1.4" strokeLinecap="round" />
        <path d="M63 92 H44" stroke="#c9896a" strokeWidth="1.4" strokeLinecap="round" />
        <path d="M138 86 H154" stroke="#c9896a" strokeWidth="1.4" strokeLinecap="round" />
        <path d="M137 92 H156" stroke="#c9896a" strokeWidth="1.4" strokeLinecap="round" />
      </g>
    </svg>
  )
}
