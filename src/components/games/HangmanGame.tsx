import { useState } from 'react'
import { HANGMAN_ANSWER, HANGMAN_HINT, HANGMAN_WIN } from '../../lib/config'
import { WinBanner } from './WinBanner'

const ANSWER = HANGMAN_ANSWER.toUpperCase()
const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
const ANSWER_LETTERS = [...new Set(ANSWER.split(''))]

/**
 * The gallows and the figure, in the order they are drawn. One part appears
 * per wrong guess; after the tenth the drawing is complete, but she may
 * keep guessing — there is no losing.
 */
const DIAGRAM_PARTS = [
  { key: 'base', el: <line x1="20" y1="226" x2="120" y2="226" /> },
  { key: 'post', el: <line x1="70" y1="226" x2="70" y2="20" /> },
  { key: 'beam', el: <line x1="70" y1="20" x2="160" y2="20" /> },
  { key: 'rope', el: <line x1="160" y1="20" x2="160" y2="48" /> },
  { key: 'head', el: <circle cx="160" cy="62" r="14" /> },
  { key: 'body', el: <line x1="160" y1="76" x2="160" y2="146" /> },
  { key: 'arm-left', el: <line x1="160" y1="94" x2="134" y2="126" /> },
  { key: 'arm-right', el: <line x1="160" y1="94" x2="186" y2="126" /> },
  { key: 'leg-left', el: <line x1="160" y1="146" x2="136" y2="192" /> },
  { key: 'leg-right', el: <line x1="160" y1="146" x2="184" y2="192" /> },
] as const

type HangmanGameProps = {
  onWin: () => void
}

/**
 * 17 October — Hangman. The whole alphabet is shown as clickable buttons;
 * each button can be clicked once, then turns dark green (letter is in the
 * word, and is revealed) or dark red (it is not). Every wrong letter draws
 * one more line of the gallows beside the word — after ten the drawing is
 * complete, yet she may guess on: no lives, no losing. She wins when every
 * letter of the restaurant's name is revealed.
 *
 * The board always starts empty: a persisted win is never used to reveal the
 * answer, so returning to this page gives a fresh game every time.
 */
export function HangmanGame({ onWin }: HangmanGameProps) {
  const [guessed, setGuessed] = useState<ReadonlySet<string>>(() => new Set())

  const solved = ANSWER_LETTERS.every((letter) => guessed.has(letter))
  const drawn = Math.min(
    [...guessed].filter((letter) => !ANSWER.includes(letter)).length,
    DIAGRAM_PARTS.length,
  )

  function pick(letter: string) {
    if (guessed.has(letter) || solved) return
    const next = new Set(guessed)
    next.add(letter)
    setGuessed(next)
    if (ANSWER_LETTERS.every((l) => next.has(l))) onWin()
  }

  function playAgain() {
    setGuessed(new Set())
  }

  return (
    <div className="flex flex-col items-center gap-10 sm:flex-row sm:items-start sm:justify-center sm:gap-14">
      {/* ── The gallows: one more part per wrong guess (ten in all) ── */}
      <figure className="shrink-0 sm:sticky sm:top-4">
        <svg
          viewBox="0 0 220 240"
          role="img"
          aria-label={`Hangman diagram — ${drawn} of ${DIAGRAM_PARTS.length} parts drawn`}
          className="mx-auto h-56 w-auto sm:h-72"
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
        >
          {DIAGRAM_PARTS.map(({ key, el }, index) => (
            <g
              key={key}
              className={`transition-opacity duration-500 ${
                index < drawn ? 'text-ink-100 opacity-100' : 'text-ink-600 opacity-15'
              }`}
            >
              {el}
            </g>
          ))}
        </svg>
        <figcaption className="mt-2 text-center text-xs text-ink-600">
          every wrong letter draws a line — ten complete the gallows
        </figcaption>
      </figure>

      <div className="w-full max-w-lg text-center">
        <p className="font-display mx-auto max-w-md text-xl leading-relaxed text-ink-500 italic sm:text-2xl">
          {HANGMAN_HINT}
        </p>

        {/*
          ── The word, one box per letter (letters only appear when guessed) ──
          flex-nowrap + the compact letter-boxes keep RACINES on a single
          line even beside the gallows; they must never wrap onto two lines.
        */}
        <div
          className="mt-10 flex flex-nowrap items-center justify-center gap-1.5 sm:gap-2"
          role="group"
          aria-label="The word to guess"
        >
          {ANSWER.split('').map((letter, index) => {
            const revealed = guessed.has(letter)
            return (
              <span
                key={index}
                aria-label={revealed ? `Letter ${letter}` : 'Hidden letter'}
                className={`letter-box letter-box-sm flex items-center justify-center ${
                  revealed ? 'border-gold-400/70 bg-white/60' : ''
                }`}
              >
                {revealed ? letter : ''}
              </span>
            )
          })}
        </div>

        {/* ── The alphabet ── */}
        <div className="mx-auto mt-10 grid max-w-lg grid-cols-7 gap-1.5 sm:grid-cols-9 sm:gap-2">
          {ALPHABET.map((letter) => {
            const used = guessed.has(letter)
            const correct = used && ANSWER.includes(letter)
            const wrong = used && !ANSWER.includes(letter)
            return (
              <button
                key={letter}
                type="button"
                disabled={used || solved}
                onClick={() => pick(letter)}
                aria-label={
                  correct ? `${letter} — correct` : wrong ? `${letter} — not in the word` : letter
                }
                className={`flex h-10 items-center justify-center rounded-md border text-sm font-semibold transition-all sm:h-11 ${
                  correct
                    ? 'border-green-950/60 bg-green-800 text-white shadow-[0_6px_16px_-8px_rgba(22,101,52,0.8)]'
                    : wrong
                      ? 'border-red-950/60 bg-red-900 text-white shadow-[0_6px_16px_-8px_rgba(127,29,29,0.8)]'
                      : 'border-ink-600/40 bg-white/50 text-ink-100 hover:border-rose-400 hover:bg-rose-300/15'
                } disabled:cursor-not-allowed`}
              >
                {letter}
              </button>
            )
          })}
        </div>

        {solved && (
          <WinBanner eyebrow="Congratulations!" message={HANGMAN_WIN} onReplay={playAgain} />
        )}
      </div>
    </div>
  )
}
