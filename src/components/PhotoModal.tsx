import { useEffect } from 'react'
import { PHOTOS } from '../lib/config'
import { placeholderPhoto } from '../lib/placeholder'
import { prettyDate } from '../lib/time'

type PhotoModalProps = {
  dateStr: string
  onClose: () => void
}

/**
 * Modal that shows one day's photo. Until a real photo is added to PHOTOS
 * in src/lib/config.ts, an auto-generated placeholder card is shown.
 */
export function PhotoModal({ dateStr, onClose }: PhotoModalProps) {
  const src = PHOTOS[dateStr] ?? placeholderPhoto(dateStr)
  const isPlaceholder = PHOTOS[dateStr] === undefined

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
        className="absolute inset-0 cursor-default bg-night-950/85 backdrop-blur-sm"
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
          <span className="font-display block text-xl text-ivory-100 italic">
            {prettyDate(dateStr)}
          </span>
          {isPlaceholder && (
            <span className="mt-1 block text-xs text-ivory-600">
              a placeholder, until the real photograph arrives
            </span>
          )}
        </figcaption>

        <button
          type="button"
          onClick={onClose}
          aria-label="Close photo"
          className="absolute -top-3 -right-3 flex size-9 items-center justify-center rounded-full border border-gold-500/40 bg-night-900 text-ivory-300 transition-colors hover:border-gold-400 hover:text-gold-200"
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
