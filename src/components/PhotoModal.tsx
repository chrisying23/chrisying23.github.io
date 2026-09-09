import { useEffect } from 'react'
import { PHOTOS, PHOTO_FALLBACK, PHOTO_FALLBACK_CAPTION } from '../lib/config'
import { prettyDate } from '../lib/time'

type PhotoModalProps = {
  dateStr: string
  onClose: () => void
}

/**
 * Modal that shows one day's photo with a caption underneath. Days without
 * a bespoke entry in PHOTOS use the shared fallback image and its caption
 * (see src/lib/config.ts) — currently the placeholder image.
 */
export function PhotoModal({ dateStr, onClose }: PhotoModalProps) {
  const bespoke = PHOTOS[dateStr]
  const src = bespoke ?? PHOTO_FALLBACK

  useEffect(() => {
    function handleKey(event: globalThis.KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', handleKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8"
      role="dialog"
      aria-modal="true"
      aria-label={`Photo for ${prettyDate(dateStr)}`}
    >
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-mauve-900/40 backdrop-blur-sm"
      />

      <figure className="animate-modal-in relative w-full max-w-sm">
        <div className="photo-frame">
          <img
            src={src}
            alt={`A memory for ${prettyDate(dateStr)}`}
            className="block aspect-[4/5] w-full object-cover"
          />
        </div>

        <figcaption className="mt-4 text-center">
          <span className="font-display block text-xl text-ink-100 italic">
            {prettyDate(dateStr)}
          </span>
          <span className="mt-1 block text-xs text-ink-500">
            {bespoke ? 'a photograph kept for this day' : PHOTO_FALLBACK_CAPTION}
          </span>
        </figcaption>

        <button
          type="button"
          onClick={onClose}
          aria-label="Close photo"
          className="absolute -top-3 -right-3 flex size-9 items-center justify-center rounded-full border border-mauve-800/40 bg-mauve-100 text-ink-500 transition-colors hover:border-rose-400 hover:text-rose-600"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            className="size-4"
            aria-hidden="true"
          >
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </figure>
    </div>
  )
}
