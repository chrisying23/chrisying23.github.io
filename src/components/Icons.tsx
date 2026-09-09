/** Inline SVG icon set — kept stroke-based so they inherit `currentColor`. */

type IconProps = {
  className?: string
}

/** Classic framed photograph. */
export function PhotoIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect x="3.5" y="4.5" width="17" height="15" rx="1.5" />
      <circle cx="9" cy="10" r="1.6" />
      <path d="m5 18 4.6-4.6a1.5 1.5 0 0 1 2.1 0L17 18.7" />
      <path d="m14.5 16.6 1.9-1.9a1.5 1.5 0 0 1 2.1 0l2 2" />
    </svg>
  )
}

/** Firework / blast burst for the weekend surprises. */
export function BlastIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 3v3.6" />
      <path d="M12 17.4V21" />
      <path d="M3 12h3.6" />
      <path d="M17.4 12H21" />
      <path d="m5.6 5.6 2.5 2.5" />
      <path d="m15.9 15.9 2.5 2.5" />
      <path d="m18.4 5.6-2.5 2.5" />
      <path d="m8.1 15.9-2.5 2.5" />
      <circle cx="12" cy="12" r="1.3" fill="currentColor" stroke="none" />
    </svg>
  )
}

/** Small padlock shown on days that have not unlocked yet. */
export function LockIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect x="5" y="10.5" width="14" height="9.5" rx="1.8" />
      <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" />
    </svg>
  )
}

/** Decorative damask wax seal with an embossed heart. */
export function WaxSeal({ className }: IconProps) {
  return (
    <svg viewBox="0 0 96 96" className={className} aria-hidden="true">
      <path
        d="M48 5c9.6 0 14.6 3.9 22.3 7.9 7.7 3.9 14.4 6.9 16.4 15.4s-2 13.6-1 21.2-.9 16.4-7.7 23.2-12.7 8.7-21.4 10.6-16.4 1-24.2-2.9S16.6 71.8 12.7 64 6.4 49.7 8.3 41s6.9-14.6 13.6-20.5S38.4 5 48 5Z"
        fill="#8a3040"
      />
      <ellipse cx="36" cy="26" rx="18" ry="10" fill="#ffffff" opacity="0.08" />
      <circle cx="48" cy="49" r="31" fill="#9c3a4b" />
      <circle
        cx="48"
        cy="49"
        r="31"
        fill="none"
        stroke="#e0c586"
        strokeOpacity="0.5"
        strokeWidth="1.5"
      />
      <circle
        cx="48"
        cy="49"
        r="26.5"
        fill="none"
        stroke="#6e2835"
        strokeWidth="1"
        strokeDasharray="2 3"
      />
      <path
        d="M48 65c-7.5-5.8-14-11-14-17.6 0-4.5 3.5-7.9 7.9-7.9 2.6 0 4.9 1.4 6.1 3.5 1.2-2.1 3.5-3.5 6.1-3.5 4.4 0 7.9 3.4 7.9 7.9C62 54 55.5 59.2 48 65Z"
        fill="#6e2835"
      />
    </svg>
  )
}
