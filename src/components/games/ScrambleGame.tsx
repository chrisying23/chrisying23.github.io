import { useState } from 'react'
import type { DragEvent } from 'react'
import { SCRAMBLE_ANSWER, SCRAMBLE_GAP_AFTER, SCRAMBLE_WIN } from '../../lib/config'
import { WinBanner } from './WinBanner'

const ANSWER = SCRAMBLE_ANSWER.toUpperCase() // SOUTHKOREA
const BOX_COUNT = ANSWER.length

/**
 * The answer's letters in a fixed scrambled order (never the solved order,
 * and no letter left in its solved position). Each tile keeps its own id so
 * the two O's stay distinct.
 */
const SCRAMBLED = ['T', 'S', 'R', 'O', 'A', 'H', 'U', 'K', 'O', 'E']
const TILES = SCRAMBLED.map((letter, id) => ({ id, letter }))

const EMPTY_BOXES: Array<number | null> = Array<number | null>(BOX_COUNT).fill(null)

/** Box layout with the correct tiles in place (used after a persisted win). */
function solvedBoxes(): Array<number | null> {
  const used = new Set<number>()
  return ANSWER.split('').map((letter) => {
    const tile = TILES.find((t) => t.letter === letter && !used.has(t.id))
    used.add(tile?.id ?? -1)
    return tile?.id ?? null
  })
}

type ScrambleGameProps = {
  /** True when this day was already won (persisted). */
  won: boolean
  onWin: () => void
}

/**
 * 24 October — Scramble. The letters of the destination sit scrambled in a
 * pool at the bottom; drag each one (or tap a letter, then tap a box) into
 * the boxes above. A wrong submission shakes the letters back into their
 * original scrambled slots; the right one reveals the surprise.
 */
export function ScrambleGame({ won, onWin }: ScrambleGameProps) {
  const [boxes, setBoxes] = useState<Array<number | null>>(() =>
    won ? solvedBoxes() : [...EMPTY_BOXES],
  )
  const [selected, setSelected] = useState<number | null>(null)
  const [status, setStatus] = useState<'idle' | 'wrong' | 'won'>(won ? 'won' : 'idle')

  const placedIds = new Set(boxes.filter((id): id is number => id !== null))
  const allPlaced = placedIds.size === BOX_COUNT

  /** Place a pool tile into a box (any occupant returns to the pool). */
  function place(tileId: number, boxIndex: number) {
    if (status !== 'idle' || placedIds.has(tileId)) return
    setBoxes((prev) => prev.map((value, i) => (i === boxIndex ? tileId : value)))
    setSelected(null)
  }

  /** Send a box's tile back to its original scrambled slot below. */
  function unplace(boxIndex: number) {
    if (status !== 'idle') return
    setBoxes((prev) => prev.map((value, i) => (i === boxIndex ? null : value)))
  }

  function handleDrop(boxIndex: number, event: DragEvent<HTMLButtonElement>) {
    event.preventDefault()
    const tileId = Number(event.dataTransfer.getData('text/plain'))
    if (Number.isInteger(tileId)) place(tileId, boxIndex)
  }

  function handleSubmit() {
    if (!allPlaced || status !== 'idle') return
    const attempt = boxes.map((id) => TILES[id ?? 0].letter).join('')
    if (attempt === ANSWER) {
      setStatus('won')
      onWin()
      return
    }
    // Wrong: shake, then every letter drops back to its scrambled slot.
    setStatus('wrong')
    window.setTimeout(() => {
      setBoxes([...EMPTY_BOXES])
      setSelected(null)
      setStatus('idle')
    }, 900)
  }

  function playAgain() {
    setBoxes([...EMPTY_BOXES])
    setSelected(null)
    setStatus('idle')
  }

  const wordGroups = [
    boxes.slice(0, SCRAMBLE_GAP_AFTER),
    boxes.slice(SCRAMBLE_GAP_AFTER),
  ]

  return (
    <div className="text-center">
      <p className="font-display mx-auto max-w-md text-xl leading-relaxed text-ink-500 italic sm:text-2xl">
        Unscramble the letters to find out where you are going:
      </p>
      <p className="mt-2 text-xs text-ink-600 italic">
        Drag each letter into its box — or tap a letter, then tap a box.
      </p>

      {/* ── Answer boxes (SOUTH | KOREA — words never split across lines) ── */}
      <div
        className={`mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 ${
          status === 'wrong' ? 'animate-shake' : ''
        }`}
        role="group"
        aria-label="Answer boxes"
      >
        {wordGroups.map((group, groupIndex) => (
          <div key={groupIndex} className="flex gap-1.5 sm:gap-2">
            {group.map((tileId, withinIndex) => {
              const boxIndex = groupIndex === 0 ? withinIndex : SCRAMBLE_GAP_AFTER + withinIndex
              const letter = tileId === null ? '' : TILES[tileId].letter
              return (
                <button
                  key={boxIndex}
                  type="button"
                  disabled={status !== 'idle'}
                  onClick={() => {
                    // With a tile selected, tap any box to place it there
                    // (an occupant swaps back to the pool); otherwise tap a
                    // filled box to send its letter back down.
                    if (selected !== null) place(selected, boxIndex)
                    else if (tileId !== null) unplace(boxIndex)
                  }}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={(event) => handleDrop(boxIndex, event)}
                  aria-label={
                    letter
                      ? `Box ${boxIndex + 1}: ${letter} — activate to remove`
                      : `Empty box ${boxIndex + 1}`
                  }
                  className={`letter-box flex items-center justify-center transition-transform ${
                    status === 'wrong' ? 'letter-box-wrong' : ''
                  } ${
                    status === 'won' ? 'border-gold-400/80 bg-white/60' : ''
                  } ${letter ? 'cursor-pointer' : ''}`}
                >
                  {letter}
                </button>
              )
            })}
          </div>
        ))}
      </div>

      {/* ── Incorrect message ── */}
      <p
        className={`mt-5 text-sm text-rose-600 transition-opacity duration-300 ${
          status === 'wrong' ? 'opacity-100' : 'opacity-0'
        }`}
        role="alert"
      >
        Incorrect — try again, my love.
      </p>

      {/* ── Letter pool (fixed scrambled slots) ── */}
      <div
        className="mt-6 flex flex-wrap items-center justify-center gap-1.5 sm:gap-2"
        role="group"
        aria-label="Scrambled letters"
      >
        {TILES.map((tile) => {
          const placed = placedIds.has(tile.id)
          if (placed) {
            return <span key={tile.id} aria-hidden="true" className="letter-box box-slot-empty" />
          }
          return (
            <button
              key={tile.id}
              type="button"
              draggable
              onDragStart={(event) => {
                event.dataTransfer.setData('text/plain', String(tile.id))
                event.dataTransfer.effectAllowed = 'move'
                setSelected(tile.id)
              }}
              onDragEnd={() => setSelected(null)}
              onClick={() => setSelected((prev) => (prev === tile.id ? null : tile.id))}
              aria-label={`Letter ${tile.letter}`}
              aria-pressed={selected === tile.id}
              className={`letter-box flex cursor-grab items-center justify-center transition-all hover:-translate-y-0.5 hover:border-rose-400 active:cursor-grabbing ${
                selected === tile.id ? 'game-tile-selected' : ''
              }`}
            >
              {tile.letter}
            </button>
          )
        })}
      </div>

      {/* ── Submit ── */}
      {status !== 'won' && (
        <button
          type="button"
          disabled={!allPlaced || status === 'wrong'}
          onClick={handleSubmit}
          className="mt-8 rounded-full border border-gold-400/60 bg-gold-400/10 px-10 py-3 text-sm font-medium tracking-wide text-gold-600 transition-all enabled:hover:border-gold-400 enabled:hover:bg-gold-400/20 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Submit
        </button>
      )}

      {won && (
        <WinBanner eyebrow="Congratulations!" message={SCRAMBLE_WIN} onReplay={playAgain} />
      )}
    </div>
  )
}
