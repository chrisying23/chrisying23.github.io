import { useCallback, useState } from 'react'
import { About } from './components/About'
import { Calendar } from './components/Calendar'
import { Gate } from './components/Gate'
import { MiniGame } from './components/MiniGame'
import { NavBar } from './components/NavBar'
import { PhotoModal } from './components/PhotoModal'
import { UNLOCK_KEY } from './lib/config'

type View =
  | { name: 'calendar' }
  | { name: 'about' }
  | { name: 'game'; dateStr: string }

function readUnlocked(): boolean {
  try {
    return localStorage.getItem(UNLOCK_KEY) === '1'
  } catch {
    return false
  }
}

export default function App() {
  const [unlocked, setUnlocked] = useState(readUnlocked)
  const [view, setView] = useState<View>({ name: 'calendar' })
  const [photoDate, setPhotoDate] = useState<string | null>(null)

  const handleUnlock = useCallback(() => {
    try {
      // Persist the unlock so the gate is skipped on later visits
      // (until the visitor clears site storage, or uses the reset
      // tool at the bottom of the About section).
      localStorage.setItem(UNLOCK_KEY, '1')
    } catch {
      /* storage unavailable — gate will simply return next visit */
    }
    setUnlocked(true)
  }, [])

  // ── Access control ──────────────────────────────────────────────────
  // Until the passcode is entered, ONLY the gate is rendered. There is no
  // client-side routing, so the calendar and About sections cannot be
  // reached by direct URL, hash, or browser navigation while locked.
  if (!unlocked) {
    return <Gate onUnlock={handleUnlock} />
  }

  return (
    <div className="min-h-dvh">
      <NavBar
        view={view.name === 'about' ? 'about' : 'calendar'}
        onNavigate={(name) =>
          setView(name === 'about' ? { name: 'about' } : { name: 'calendar' })
        }
      />

      <main className="mx-auto max-w-6xl px-4 pt-10 pb-24 sm:px-6 sm:pt-14">
        {view.name === 'calendar' && (
          <Calendar
            onOpenPhoto={setPhotoDate}
            onOpenGame={(dateStr) => setView({ name: 'game', dateStr })}
          />
        )}
        {view.name === 'about' && <About />}
        {view.name === 'game' && (
          <MiniGame
            dateStr={view.dateStr}
            onBack={() => setView({ name: 'calendar' })}
          />
        )}
      </main>

      {photoDate && (
        <PhotoModal dateStr={photoDate} onClose={() => setPhotoDate(null)} />
      )}
    </div>
  )
}
