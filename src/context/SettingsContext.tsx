import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { PAINT_RANGES, PaintRange } from '../utils/paintCatalog'

const STORAGE_KEY = 'mpcta_preferred_range_v1'
const DEFAULT_RANGE: PaintRange = 'Citadel'

interface SettingsContextValue {
  preferredRange: PaintRange
  setPreferredRange: (range: PaintRange) => void
}

const SettingsContext = createContext<SettingsContextValue | null>(null)

function loadStoredRange(): PaintRange {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw && (PAINT_RANGES as readonly string[]).includes(raw)) return raw as PaintRange
  } catch {
    // localStorage unavailable — fall through to default.
  }
  return DEFAULT_RANGE
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [preferredRange, setPreferredRangeState] = useState<PaintRange>(loadStoredRange)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, preferredRange)
    } catch {
      // Storage unavailable (private browsing, quota, etc.) — fail silently.
    }
  }, [preferredRange])

  function setPreferredRange(range: PaintRange) {
    setPreferredRangeState(range)
  }

  return (
    <SettingsContext.Provider value={{ preferredRange, setPreferredRange }}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext)
  if (!ctx) throw new Error('useSettings must be used within a SettingsProvider')
  return ctx
}
