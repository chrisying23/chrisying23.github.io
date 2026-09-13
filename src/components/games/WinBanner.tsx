type WinBannerProps = {
  /** The sentence revealed to the player. */
  message: string
  /** Small eyebrow line above the message (e.g. "Congratulations!"). */
  eyebrow?: string
  /** When given, shows a "Play again" button that resets the game. */
  onReplay?: () => void
}

/** Gold celebration panel shown beneath a mini-game once it is won. */
export function WinBanner({ message, eyebrow, onReplay }: WinBannerProps) {
  return (
    <div className="animate-rise mt-10 rounded-2xl border border-gold-400/50 bg-gradient-to-b from-gold-400/15 to-transparent px-6 py-8 text-center">
      {eyebrow && (
        <p className="text-[0.7rem] font-medium tracking-[0.35em] text-gold-400">
          {eyebrow}
        </p>
      )}
      <p className="font-display mx-auto mt-3 max-w-md text-2xl leading-relaxed text-ink-100 italic">
        “{message}”
      </p>
      {onReplay && (
        <button
          type="button"
          onClick={onReplay}
          className="mt-5 text-xs text-ink-600 underline decoration-ink-600/40 underline-offset-4 transition-colors hover:text-rose-600"
        >
          Play again
        </button>
      )}
    </div>
  )
}
