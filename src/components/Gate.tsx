import { useEffect, useRef, useState } from 'react'
import type { ClipboardEvent, KeyboardEvent } from 'react'
import { GATE_HINT, PASSCODE, PASSCODE_GAP_AFTER } from '../lib/config'
import { WaxSeal } from './Icons'

type GateProps = {
  onUnlock: () => void
}

/**
 * The passcode gate. This is the only thing rendered until the visitor
 * enters the correct phrase — the calendar and About sections are never
 * mounted (and therefore cannot be reached by URL or navigation) before
 * that. See src/App.tsx for the guard.
 */
export function Gate({ onUnlock }: GateProps) {
  const [letters, setLetters] = useState<string[]>(() =>
    Array<string>(PASSCODE.length).fill(''),
  )
  const [status, setStatus] = useState<'idle' | 'wrong' | 'opening'>('idle')
  const inputsRef = useRef<Array<HTMLInputElement | null>>([])

  // Autofocus the first letter box on arrival.
  useEffect(() => {
    inputsRef.current[0]?.focus()
  }, [])

  // Once every box holds a letter, check the phrase.
  function submitIfComplete(next: string[]) {
    if (next.some((letter) => letter === '')) return

    if (next.join('') === PASSCODE) {
      setStatus('opening')
      // Let the seal-breaking moment play before revealing the site.
      window.setTimeout(onUnlock, 1150)
      return
    }

    setStatus('wrong')
    window.setTimeout(() => {
      setLetters(Array<string>(PASSCODE.length).fill(''))
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
    if (index < PASSCODE.length - 1) inputsRef.current[index + 1]?.focus()
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
    } else if (event.key === 'ArrowRight' && index < PASSCODE.length - 1) {
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
      .slice(0, PASSCODE.length)
    if (!text) return
    const next = Array<string>(PASSCODE.length).fill('')
    for (let i = 0; i < text.length; i += 1) next[i] = text[i]
    setLetters(next)
    inputsRef.current[Math.min(text.length, PASSCODE.length - 1)]?.focus()
    submitIfComplete(next)
  }

  return (
    <main className="flex min-h-dvh items-center justify-center px-4 py-12">
      <div className="gate-frame w-full max-w-xl px-6 py-10 text-center sm:px-12 sm:py-14">
        <WaxSeal
          className={`mx-auto size-20 drop-shadow-[0_6px_18px_rgba(138,48,64,0.45)] sm:size-24 ${
            status === 'opening' ? 'animate-seal-break' : ''
          }`}
        />

        <p className="mt-8 text-[0.7rem] font-medium tracking-[0.35em] text-gold-500 uppercase">
          26 September — 26 October 2026
        </p>
        <h1 className="font-display mt-3 text-4xl font-medium text-ivory-100 sm:text-5xl">
          The Midnight Calendar
        </h1>

        <p className="mx-auto mt-6 max-w-md border-y border-gold-500/25 py-4 text-sm leading-relaxed font-semibold text-ivory-300 sm:text-base">
          {GATE_HINT}
        </p>

        <form
          className="mt-8"
          onSubmit={(event) => event.preventDefault()}
          aria-label="Passcode"
        >
          <div
            className={`flex flex-wrap items-center justify-center gap-2 sm:gap-2.5 ${
              status === 'wrong' ? 'animate-shake' : ''
            }`}
          >
            {letters.map((letter, index) => (
              <div key={index} className="contents">
                {index === PASSCODE_GAP_AFTER && (
                  <span className="h-0 w-full sm:h-auto sm:w-3" aria-hidden="true" />
                )}
                <input
                  ref={(el) => {
                    inputsRef.current[index] = el
                  }}
                  type="text"
                  inputMode="text"
                  autoComplete="off"
                  autoCapitalize="characters"
                  spellCheck={false}
                  maxLength={1}
                  value={letter}
                  disabled={status === 'opening'}
                  aria-label={`Letter ${index + 1} of ${PASSCODE.length}`}
                  onChange={(event) => handleChange(index, event.target.value)}
                  onKeyDown={(event) => handleKeyDown(index, event)}
                  onPaste={handlePaste}
                  className={`letter-box ${status === 'wrong' ? 'letter-box-wrong' : ''}`}
                />
              </div>
            ))}
          </div>

          <p
            className={`mt-6 text-sm text-rose-300 transition-opacity duration-300 ${
              status === 'wrong' ? 'opacity-100' : 'opacity-0'
            }`}
            role="alert"
          >
            Not quite — the seal holds. Try again, my love.
          </p>
        </form>

        <p className="mt-2 text-xs tracking-wide text-ivory-600 italic">
          {status === 'opening'
            ? 'The seal breaks…'
            : 'Speak the phrase, and the calendar opens.'}
        </p>
      </div>
    </main>
  )
}
