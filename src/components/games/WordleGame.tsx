import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import { WORDLE_ANSWER, WORDLE_HINT, WORDLE_WIN } from '../../lib/config'

const ANSWER = WORDLE_ANSWER.toUpperCase()
const WORD_LENGTH = ANSWER.length
const MIN_ROWS = 5
const KEY_ROWS = ['QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM'] as const

type TileState = 'correct' | 'present' | 'absent'

const TILE_COLORS: Record<TileState, string> = {
  correct: 'var(--color-wordle-correct)',
  present: 'var(--color-wordle-present)',
  absent: 'var(--color-wordle-absent)',
}

const STATE_RANK: Record<TileState, number> = { absent: 0, present: 1, correct: 2 }

/** Standard Wordle colouring: greens first, then yellows from what's left. */
function evaluateGuess(guess: string): TileState[] {
  const states = Array<TileState>(WORD_LENGTH).fill('absent')
  const remaining = new Map<string, number>()
  for (let i = 0; i < WORD_LENGTH; i += 1) {
    if (guess[i] === ANSWER[i]) {
      states[i] = 'correct'
    } else {
      remaining.set(ANSWER[i], (remaining.get(ANSWER[i]) ?? 0) + 1)
    }
  }
  for (let i = 0; i < WORD_LENGTH; i += 1) {
    if (states[i] === 'correct') continue
    const left = remaining.get(guess[i]) ?? 0
    if (left > 0) {
      states[i] = 'present'
      remaining.set(guess[i], left - 1)
    }
  }
  return states
}

type WordleGameProps = {
  /** True when this day was already won (persisted). */
  won: boolean
  onWin: () => void
  onBack: () => void
}

/**
 * A faithful little Wordle, laid out and coloured like the official game
 * (dark theme). Tries are unlimited: the board starts with five rows, and
 * every failed guess beyond them extends it by one more row below.
 */
export function WordleGame({ won, onWin, onBack }: WordleGameProps) {
  const [guesses, setGuesses] = useState<string[]>(() => (won ? [ANSWER] : []))
  const [current, setCurrent] = useState('')
  const [phase, setPhase] = useState<'playing' | 'won'>(won ? 'won' : 'playing')
  const [banner, setBanner] = useState(won)
  const [toast, setToast] = useState<string | null>(null)
  const [shaking, setShaking] = useState(false)
  const toastTimer = useRef<number | undefined>(undefined)

  // This page takes over the whole viewport — freeze the page behind it.
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  // Clear any pending toast timer when leaving the page.
  useEffect(() => () => window.clearTimeout(toastTimer.current), [])

  /** Best-known colour per letter, for the on-screen keyboard. */
  const keyStates = useMemo(() => {
    const map = new Map<string, TileState>()
    for (const guess of guesses) {
      const states = evaluateGuess(guess)
      for (let i = 0; i < WORD_LENGTH; i += 1) {
        const previous = map.get(guess[i])
        if (!previous || STATE_RANK[states[i]] > STATE_RANK[previous]) {
          map.set(guess[i], states[i])
        }
      }
    }
    return map
  }, [guesses])

  const showToast = useCallback((message: string) => {
    window.clearTimeout(toastTimer.current)
    setToast(message)
    toastTimer.current = window.setTimeout(() => setToast(null), 1400)
  }, [])

  const submit = useCallback(() => {
    if (phase !== 'playing') return
    if (current.length < WORD_LENGTH) {
      showToast('Not enough letters')
      setShaking(true)
      window.setTimeout(() => setShaking(false), 600)
      return
    }
    const guess = current.toUpperCase()
    setGuesses((prev) => [...prev, guess])
    setCurrent('')
    if (guess === ANSWER) {
      setPhase('won')
      // Let the last row finish flipping before the celebration appears.
      window.setTimeout(
        () => {
          setBanner(true)
          onWin()
        },
        WORD_LENGTH * 130 + 700,
      )
    }
  }, [phase, current, onWin, showToast])

  const handleKey = useCallback(
    (key: string) => {
      if (phase !== 'playing') return
      if (key === 'ENTER') {
        submit()
      } else if (key === 'BACKSPACE') {
        setCurrent((prev) => prev.slice(0, -1))
      } else if (/^[A-Z]$/.test(key)) {
        setCurrent((prev) => (prev.length < WORD_LENGTH ? prev + key : prev))
      }
    },
    [phase, submit],
  )

  // Physical keyboard support.
  useEffect(() => {
    function onKeyDown(event: globalThis.KeyboardEvent) {
      if (event.metaKey || event.ctrlKey || event.altKey) return
      const key = event.key.toUpperCase()
      if (key === 'ENTER' || key === 'BACKSPACE' || /^[A-Z]$/.test(key)) {
        handleKey(key)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [handleKey])

  function playAgain() {
    setGuesses([])
    setCurrent('')
    setPhase('playing')
  }

  // Five rows to start; once they are used up, every further failed guess
  // adds one more row below.
  const rowCount = Math.max(MIN_ROWS, guesses.length + (phase === 'playing' ? 1 : 0))

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-wordle-bg font-wordle text-white">
      <div className="relative mx-auto flex min-h-full w-full max-w-[500px] flex-col px-2">
        {/* ── Header bar, like the official game ── */}
        <header className="relative flex items-center justify-center border-b border-wordle-border px-2 py-2.5">
          <button
            type="button"
            onClick={onBack}
            aria-label="Return to the calendar"
            className="absolute top-1/2 left-3 flex -translate-y-1/2 items-center gap-1.5 text-sm text-[#d7dadc] transition-colors hover:text-white"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="size-4"
              aria-hidden="true"
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
            Calendar
          </button>
          <h1 className="font-display text-3xl font-bold tracking-[0.18em]">Wordle</h1>
        </header>

        {/* ── Hint ── */}
        <p className="mt-4 text-center font-display text-lg leading-snug text-[#d7dadc] italic sm:text-xl">
          {WORDLE_HINT}
        </p>

        {toast && (
          <div className="wordle-toast" role="alert">
            {toast}
          </div>
        )}

        {/* ── Board ── */}
        <div
          className="mx-auto mt-5 w-full max-w-[340px] space-y-[5px] px-1"
          role="grid"
          aria-label="Wordle board"
        >
          {Array.from({ length: rowCount }, (_, row) => {
            const guess = guesses[row]
            const isCurrent = row === guesses.length && phase === 'playing'
            const states = guess ? evaluateGuess(guess) : null
            return (
              <div
                key={row}
                role="row"
                className={`grid grid-cols-7 gap-[5px] ${
                  isCurrent && shaking ? 'animate-shake' : ''
                }`}
              >
                {Array.from({ length: WORD_LENGTH }, (_, col) => {
                  const letter = guess ? guess[col] : isCurrent ? (current[col] ?? '') : ''
                  if (states) {
                    return (
                      <div
                        key={col}
                        role="gridcell"
                        className="wordle-tile wordle-tile-reveal"
                        style={
                          {
                            '--tile-bg': TILE_COLORS[states[col]],
                            animationDelay: `${col * 130}ms`,
                          } as CSSProperties
                        }
                      >
                        {letter}
                      </div>
                    )
                  }
                  return (
                    <div
                      key={col}
                      role="gridcell"
                      className={`wordle-tile ${letter ? 'wordle-tile-filled' : ''}`}
                    >
                      {letter}
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>

        {/* ── Win banner ── */}
        {banner && (
          <div className="animate-rise mx-auto mt-6 w-full max-w-[340px] rounded-lg border border-wordle-correct/60 bg-wordle-correct/15 px-6 py-5 text-center">
            <p className="font-display text-xl leading-snug text-white italic sm:text-2xl">
              {WORDLE_WIN}
            </p>
            {phase === 'won' && (
              <button
                type="button"
                onClick={playAgain}
                className="mt-3 text-xs text-[#d7dadc] underline decoration-white/30 underline-offset-4 transition-colors hover:text-white"
              >
                Play again
              </button>
            )}
          </div>
        )}

        {/* ── Keyboard (pinned to the bottom like the official game) ── */}
        <div className="sticky bottom-0 mt-auto bg-wordle-bg px-1 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <div className="space-y-1.5" role="group" aria-label="Keyboard">
            {KEY_ROWS.map((row, rowIndex) => (
              <div key={rowIndex} className="flex justify-center gap-1.5">
                {rowIndex === 2 && (
                  <button
                    type="button"
                    className="wordle-key wordle-key-wide"
                    onClick={() => handleKey('ENTER')}
                  >
                    ENTER
                  </button>
                )}
                {row.split('').map((letter) => {
                  const state = keyStates.get(letter)
                  return (
                    <button
                      key={letter}
                      type="button"
                      className={`wordle-key ${state ? `wordle-key-${state}` : ''}`}
                      onClick={() => handleKey(letter)}
                    >
                      {letter}
                    </button>
                  )
                })}
                {rowIndex === 2 && (
                  <button
                    type="button"
                    aria-label="Backspace"
                    className="wordle-key wordle-key-wide"
                    onClick={() => handleKey('BACKSPACE')}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="size-5"
                      aria-hidden="true"
                    >
                      <path d="M21 5H8l-5 7 5 7h13a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1Z" />
                      <path d="m17 9-6 6M11 9l6 6" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
