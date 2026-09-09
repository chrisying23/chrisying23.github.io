import { useEffect, useState } from 'react'

/** Returns `Date.now()`, re-rendering the caller every `stepMs`. */
export function useNow(stepMs = 1000): number {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), stepMs)
    return () => window.clearInterval(id)
  }, [stepMs])

  return now
}
