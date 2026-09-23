import { useEffect, useRef, useState } from 'react'
import type { ClipboardEvent, KeyboardEvent } from 'react'
import { EMOJI_ANSWER, EMOJI_GAP_AFTER, EMOJI_WIN } from '../../lib/config'
import { WinBanner } from './WinBanner'

const ANSWER = EMOJI_ANSWER.toUpperCase() // BRUNOMARS

/** The answer split into whole words (BRUNO | MARS) for the box grid. */
const ANSWER_WORDS = [ANSWER.slice(0, EMOJI_GAP_AFTER), ANSWER.slice(EMOJI_GAP_AFTER)]

/**
 * The emoji clue, one cluster per word of the answer:
 *   🟥 8️⃣ ⚽ 🙉 — Bruno Fernandes (Manchester United's number 8, and his
 *                 hands-over-ears celebration) → BRUNO
 *   🪐 🚀 — the planet and the rocket ship → MARS
 */
const CLUE_GROUPS = [
  {
    key: 'bruno',
    emojis: ['🟥', '8️⃣', '⚽', '🙉'],
    label: 'red square, number eight, football, monkey covering both ears',
  },
  {
    key: 'mars',
    emojis: ['🪐', '🚀'],
    label: 'planet, rocket ship',
  },
] as const

type EmojiGameProps = {
  onWin: () => void
}

/**
 * 10 October — emoji word guess. Two clusters of emoji each hide one word
 * of the answer (BRUNO | MARS); she types the letters into the boxes below.
 * The boxes always start empty — a persisted win never pre-fills them, so
 * every visit is a fresh game. A wrong guess shakes and clears; the right
 * one reveals the concert.
 */
export function EmojiGame({ onWin }: EmojiGameProps) {
  const [letters, setLetters] = useState<string[]>(() =>
    Array<string>(ANSWER.length).fill(''),
  )
  const [status, setStatus] = useState<'idle' | 'wrong' | 'won'>('idle')
  const inputsRef = useRef<Array<HTMLInputElement | null>>([])

  // Autofocus the first letter box on arrival.
  useEffect(() => {
    inputsRef.current[0]?.focus()
  }, [])

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
      <p className="font-display mx-auto max-w-md text-xl leading-relaxed text-ink-500 italic sm:text-2xl">
        Solve the emoji clues to find out who you are going to see:
      </p>

      {/*
        ── Emoji clue + answer boxes: one column per word ──
        Each emoji cluster sits centred directly above its word's letter
        boxes, and the gap between the two columns is deliberately wider
        than the gaps between boxes inside a word, so the answer reads
        as two separate words. Only the space BETWEEN the words may
        wrap — a word is never split across two lines.
      */}
      <form className="mt-10" onSubmit={(event) => event.preventDefault()} aria-label="Answer">
        <div
          className={`flex flex-wrap items-start justify-center gap-x-8 gap-y-10 sm:gap-x-16 ${
            status === 'wrong' ? 'animate-shake' : ''
          }`}
          role="group"
          aria-label="Answer boxes"
        >
          {ANSWER_WORDS.map((word, wordIndex) => {
            const offset = wordIndex === 0 ? 0 : ANSWER_WORDS[0].length
            const clue = CLUE_GROUPS[wordIndex]
            return (
              <div key={wordIndex} className="flex flex-col items-center gap-6 sm:gap-8">
                {/* This word's emoji clue, centred above its boxes. */}
                <div
                  role="img"
                  aria-label={`Emoji clue: ${clue.label}`}
                  className="flex flex-nowrap items-center gap-2 text-3xl sm:gap-3 sm:text-5xl"
                >
                  {clue.emojis.map((emoji, index) => (
                    <span key={index}>{emoji}</span>
                  ))}
                </div>

                {/* This word's letter boxes — never split across lines. */}
                <div className="flex flex-nowrap gap-2 sm:gap-2.5">
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

      {status === 'won' && (
        <WinBanner eyebrow="Congratulations!" message={EMOJI_WIN} onReplay={playAgain} />
      )}
    </div>
  )
}
