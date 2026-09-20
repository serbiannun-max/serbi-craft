import paintDb from '../data/paintDatabase.json'
import { hexToRgb, rgbDistance } from './colorMath'

export interface PaintMatch {
  category: string
  hex: string
  paints: Record<string, string>
  distance: number
}

// Returns the closest N catalog categories (by RGB distance) to a computed
// color-theory swatch, each carrying its nearest paint name per brand.
export function findNearestPaints(hex: string, count = 1): PaintMatch[] {
  const target = hexToRgb(hex)
  const scored = paintDb.swatches.map((sw) => ({
    ...sw,
    distance: rgbDistance(target, hexToRgb(sw.hex)),
  }))
  scored.sort((a, b) => a.distance - b.distance)
  return scored.slice(0, count)
}

export const brandList: string[] = paintDb.brands
export const databaseNote: string = paintDb.note

// Max possible RGB-space distance is sqrt(255^2 * 3) ~= 441.7.
// Convert a distance into a 0-100 "match confidence" a painter can scan quickly.
export function matchConfidence(distance: number): number {
  const pct = 100 - (distance / 441.7) * 100
  return Math.round(Math.max(0, Math.min(100, pct)))
}

export interface FlatPaint {
  id: string
  brand: string
  name: string
  category: string
  hex: string
}

// Every brand/paint pairing in the database as a flat, addressable list —
// used by the Collection Manager to track which physical paints the user owns.
export function flattenPaintCatalog(): FlatPaint[] {
  const out: FlatPaint[] = []
  for (const sw of paintDb.swatches) {
    for (const brand of paintDb.brands) {
      const name = (sw.paints as Record<string, string>)[brand]
      if (!name) continue
      out.push({ id: `${brand}::${name}`, brand, name, category: sw.category, hex: sw.hex })
    }
  }
  return out
}
