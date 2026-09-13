import { useEffect, useRef, useState } from 'react'
import type { ClipboardEvent, KeyboardEvent } from 'react'
import {
  FINALE_ANSWER,
  FINALE_CLUE,
  FINALE_GAP_AFTER,
  FINALE_HINT,
  FINALE_WIN,
} from '../../lib/config'
import { WinBanner } from './WinBanner'

const ANSWER = FINALE_ANSWER.toUpperCase() // GLOVEBOX

/** The answer split into whole words (GLOVE | BOX) for the box grid. */
const ANSWER_WORDS = [ANSWER.slice(0, FINALE_GAP_AFTER), ANSWER.slice(FINALE_GAP_AFTER)]

type CrypticGameProps = {
  /** True when this day was already won (persisted). */
  won: boolean
  onWin: () => void
}

/**
 * 26 October — the finale. A cryptic clue answered on the same letter-box
 * grid as the front gate: the two words sit on their own lines and never
 * split mid-word. A wrong guess shakes and clears; the right one opens the
 * very last surprise.
 */
export function CrypticGame({ won, onWin }: CrypticGameProps) {
  const [letters, setLetters] = useState<string[]>(() =>
    won ? ANSWER.split('') : Array<string>(ANSWER.length).fill(''),
  )
  const [status, setStatus] = useState<'idle' | 'wrong' | 'won'>(won ? 'won' : 'idle')
  const inputsRef = useRef<Array<HTMLInputElement | null>>([])

  // Autofocus the first letter box on arrival (unless already solved).
  useEffect(() => {
    if (!won) inputsRef.current[0]?.focus()
  }, [won])

  // Once every box holds a letter, check the answer.
  function submitIfComplete(next: string[]) {
    if (next.some((letter) => letter === '')) return
    if (next.join('').toUpperCase() === ANSWER) {
      setStatus('won')
      onWin()
      return
    }
    setStatus('wrong')
    window.setTimeout(() => {
      setLetters(Array<string>(ANSWER.length).fill(''))
      setStatus('idle')
      inputsRef.current[0]?.focus()
    }, 700)
  }

  function handleChange(index: number, raw: string) {
    if (status !== 'idle') return
    const ch = raw.replace(/[^a-z]/gi, '').slice(-1).toUpperCase()
    if (!ch) return
    const next = [...letters]
    next[index] = ch
    setLetters(next)
    if (index < ANSWER.length - 1) inputsRef.current[index + 1]?.focus()
    submitIfComplete(next)
  }

  function handleKeyDown(index: number, event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Backspace') {
      event.preventDefault()
      if (letters[index]) {
        const next = [...letters]
        next[index] = ''
        setLetters(next)
      } else if (index > 0) {
        const next = [...letters]
        next[index - 1] = ''
        setLetters(next)
        inputsRef.current[index - 1]?.focus()
      }
    } else if (event.key === 'ArrowLeft' && index > 0) {
      inputsRef.current[index - 1]?.focus()
    } else if (event.key === 'ArrowRight' && index < ANSWER.length - 1) {
      inputsRef.current[index + 1]?.focus()
    }
  }

  function handlePaste(event: ClipboardEvent<HTMLInputElement>) {
    event.preventDefault()
    if (status !== 'idle') return
    const text = event.clipboardData
      .getData('text')
      .replace(/[^a-z]/gi, '')
      .toUpperCase()
      .slice(0, ANSWER.length)
    if (!text) return
    const next = Array<string>(ANSWER.length).fill('')
    for (let i = 0; i < text.length; i += 1) next[i] = text[i]
    setLetters(next)
    inputsRef.current[Math.min(text.length, ANSWER.length - 1)]?.focus()
    submitIfComplete(next)
  }

  function playAgain() {
    setLetters(Array<string>(ANSWER.length).fill(''))
    setStatus('idle')
    inputsRef.current[0]?.focus()
  }

  return (
    <div className="text-center">
      <p className="text-[0.7rem] font-medium tracking-[0.35em] text-rose-400">
        {FINALE_HINT}
      </p>
      <p className="font-display mx-auto mt-5 max-w-md border-y border-rose-300/50 py-4 text-xl leading-relaxed text-ink-500 italic sm:text-2xl">
        {FINALE_CLUE}
      </p>

      <form className="mt-8" onSubmit={(event) => event.preventDefault()} aria-label="Answer">
        {/*
          The boxes are grouped by word: each word is a non-wrapping flex
          row, and only the gap BETWEEN words may wrap — a word is never
          split across two lines.
        */}
        <div
          className={`flex flex-wrap items-center justify-center gap-x-6 gap-y-3 ${
            status === 'wrong' ? 'animate-shake' : ''
          }`}
        >
          {ANSWER_WORDS.map((word, wordIndex) => {
            const offset = wordIndex === 0 ? 0 : ANSWER_WORDS[0].length
            return (
              <div key={wordIndex} className="flex gap-2 sm:gap-2.5">
                {word.split('').map((_, letterIndex) => {
                  const index = offset + letterIndex
                  return (
                    <input
                      key={index}
                      ref={(el) => {
                        inputsRef.current[index] = el
                      }}
                      type="text"
                      inputMode="text"
                      autoComplete="off"
                      autoCapitalize="characters"
                      spellCheck={false}
                      maxLength={1}
                      value={letters[index]}
                      disabled={status === 'won'}
                      aria-label={`Letter ${index + 1} of ${ANSWER.length}`}
                      onChange={(event) => handleChange(index, event.target.value)}
                      onKeyDown={(event) => handleKeyDown(index, event)}
                      onPaste={handlePaste}
                      className={`letter-box ${
                        status === 'wrong' ? 'letter-box-wrong' : ''
                      } ${status === 'won' ? 'border-gold-400/80 bg-white/60' : ''}`}
                    />
                  )
                })}
              </div>
            )
          })}
        </div>

        <p
          className={`mt-6 text-sm text-rose-600 transition-opacity duration-300 ${
            status === 'wrong' ? 'opacity-100' : 'opacity-0'
          }`}
          role="alert"
        >
          Not quite — try again, my love.
        </p>
      </form>

      {won && <WinBanner message={FINALE_WIN} onReplay={playAgain} />}
    </div>
  )
}
