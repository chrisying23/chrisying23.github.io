import { useCallback, useState } from 'react'
import { About } from './components/About'
import { AdminBanner } from './components/AdminBanner'
import { Calendar } from './components/Calendar'
import { Gate } from './components/Gate'
import { MiniGame } from './components/MiniGame'
import { NavBar } from './components/NavBar'
import { PhotoModal } from './components/PhotoModal'
import { PetalCanvas } from './components/PetalCanvas'
import { UNLOCK_KEY } from './lib/config'
import { AdminProvider, useAdmin } from './lib/admin'

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

function Shell() {
  const { admin, enableAdmin } = useAdmin()
  const [unlocked, setUnlocked] = useState(readUnlocked)
  const [view, setView] = useState<View>({ name: 'calendar' })
  const [photoDate, setPhotoDate] = useState<string | null>(null)

  const handleUnlock = useCallback(() => {
    try {
      // Persist the visitor unlock so the gate is skipped on later visits
      // (until site storage is cleared, or the reset tool at the bottom of
      // the About section is used).
      localStorage.setItem(UNLOCK_KEY, '1')
    } catch {
      /* storage unavailable — gate will simply return next visit */
    }
    setUnlocked(true)
  }, [])

  const handleAdmin = useCallback(() => {
    // Hidden admin session: deliberately NOT persisted to localStorage,
    // so the owner can preview without affecting the visitor's unlock.
    enableAdmin()
    setUnlocked(true)
  }, [enableAdmin])

  // ── Access control ──────────────────────────────────────────────────
  // Until a passcode is entered, ONLY the gate is rendered. There is no
  // client-side routing, so the calendar and About sections cannot be
  // reached by direct URL, hash, or browser navigation while locked.
  if (!unlocked) {
    return <Gate onUnlock={handleUnlock} onAdmin={handleAdmin} />
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
        {admin && (
          <div className="mb-10">
            <AdminBanner />
          </div>
        )}

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

export default function App() {
  return (
    <AdminProvider>
      <PetalCanvas />
      <Shell />
    </AdminProvider>
  )
}
