const OWNED_KEY = 'mpcta_owned_paints_v1'
const CUSTOM_KEY = 'mpcta_custom_paints_v1'

export interface CustomPaint {
  id: string
  brand: string
  name: string
  hex: string
}

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback
  try {
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export function loadOwned(): Set<string> {
  return new Set(safeParse<string[]>(localStorage.getItem(OWNED_KEY), []))
}

export function saveOwned(owned: Set<string>) {
  try {
    localStorage.setItem(OWNED_KEY, JSON.stringify(Array.from(owned)))
  } catch {
    // Storage unavailable (private browsing, quota, etc.) — fail silently.
  }
}

export function loadCustomPaints(): CustomPaint[] {
  return safeParse<CustomPaint[]>(localStorage.getItem(CUSTOM_KEY), [])
}

export function saveCustomPaints(paints: CustomPaint[]) {
  try {
    localStorage.setItem(CUSTOM_KEY, JSON.stringify(paints))
  } catch {
    // Storage unavailable — fail silently.
  }
}
