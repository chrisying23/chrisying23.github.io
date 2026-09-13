import { useEffect } from 'react'
import { PHOTOS, START_DATE } from '../lib/config'
import { prettyDate } from '../lib/time'

type PhotoModalProps = {
  dateStr: string
  onClose: () => void
}

/**
 * Modal that shows one day's comic pages — two per day, except the first
 * day (26 September), which opens with the cover followed by pages 1–2.
 * The pages stack vertically in a scrollable sheet.
 */
export function PhotoModal({ dateStr, onClose }: PhotoModalProps) {
  const pages = PHOTOS[dateStr] ?? []

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
      className="fixed inset-0 z-50 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label={`Comic pages for ${prettyDate(dateStr)}`}
    >
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="fixed inset-0 cursor-default bg-mauve-900/40 backdrop-blur-sm"
      />

      <div className="relative mx-auto w-full max-w-md p-4 sm:p-8">
        <figure className="animate-modal-in">
          <figcaption className="mb-4 text-center">
            <span className="font-display block text-xl text-ink-100 italic">
              {prettyDate(dateStr)}
            </span>
            <span className="mt-1 block text-xs text-ink-500">
              {dateStr === START_DATE
                ? 'the cover, and the first two pages of the comic'
                : 'two pages of the comic, revealed for this day'}
            </span>
          </figcaption>

          <div className="space-y-6">
            {pages.map((src, index) => (
              <div key={src} className="photo-frame">
                <img
                  src={src}
                  alt={
                    dateStr === START_DATE && index === 0
                      ? 'The cover of the comic'
                      : `${prettyDate(dateStr)} — comic page ${index + 1} of ${pages.length}`
                  }
                  className="block w-full"
                />
              </div>
            ))}
          </div>
        </figure>
      </div>

      <button
        type="button"
        onClick={onClose}
        aria-label="Close photo"
        className="fixed top-4 right-4 flex size-9 items-center justify-center rounded-full border border-mauve-800/40 bg-mauve-100 text-ink-500 transition-colors hover:border-rose-400 hover:text-rose-600"
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
    </div>
  )
}
