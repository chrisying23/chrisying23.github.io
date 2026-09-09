import type { ReactNode } from 'react'
import { createContext, createElement, useCallback, useContext, useMemo, useState } from 'react'
import { hkWallClockToUtcMs } from './time'

/**
 * The hidden admin mode. Entered from the gate with the admin passcode; it
 * never touches localStorage, so the owner can preview freely without the
 * visitor's unlock state being affected.
 *
 * When active, AdminBanner lets the owner pick any Hong Kong date+time. The
 * chosen value flows through `nowOverride`, replacing `Date.now()`
 * everywhere: the countdown, the photo/surprise icons' enabled state, and
 * day unlocking. An incomplete pick (empty field) falls back to real time.
 */

export type AdminOverride = { date: string; time: string }

type AdminValue = {
  /** True while the hidden admin session is active. */
  admin: boolean
  /** Values currently shown in the pickers, or null for the real clock. */
  override: AdminOverride | null
  /** Epoch ms the site should treat as "now", or null for the real clock. */
  nowOverride: number | null
  /** Called by the gate when the admin passcode is entered. */
  enableAdmin: () => void
  setOverride: (next: AdminOverride | null) => void
  /** Exit admin mode and clear the override. */
  exitAdmin: () => void
}

const AdminContext = createContext<AdminValue | null>(null)

export function AdminProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState(false)
  const [override, setOverride] = useState<AdminOverride | null>(null)

  const enableAdmin = useCallback(() => setAdmin(true), [])

  const exitAdmin = useCallback(() => {
    setOverride(null)
    setAdmin(false)
  }, [])

  const value = useMemo<AdminValue>(() => {
    let nowOverride: number | null = null
    if (override) {
      nowOverride = hkWallClockToUtcMs(override.date, override.time)
    }
    return { admin, override, nowOverride, enableAdmin, setOverride, exitAdmin }
  }, [admin, override, enableAdmin, exitAdmin])

  // createElement instead of JSX keeps this file a plain .ts module.
  return createElement(AdminContext.Provider, { value }, children)
}

export function useAdmin(): AdminValue {
  const context = useContext(AdminContext)
  if (!context) {
    return {
      admin: false,
      override: null,
      nowOverride: null,
      enableAdmin: () => undefined,
      setOverride: () => undefined,
      exitAdmin: () => undefined,
    }
  }
  return context
}
