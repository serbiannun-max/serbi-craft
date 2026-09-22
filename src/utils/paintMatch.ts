import paintDb from '../data/paintDatabase.json'
import { hexToRgb, rgbDistance, rgbToHex } from './colorMath'
import { getAllPaints } from './paintCatalog'

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

// --- Owned-paint aware helpers (Collection Manager improvements) -------
// These operate over the full 7-range catalog (paintCatalog.ts) rather than
// the legacy 4-brand flattenPaintCatalog above, so they cover the new
// Vallejo Model/Game/Xpress ranges too. Kept in this file since they're
// conceptually "paint matching," just owned-paint-aware matching.

export interface OwnedPaintRef {
  id: string
  name: string
  manufacturer: string
  hex: string
}

/** Resolves a Set of owned catalog-paint ids + the user's custom paints into a flat, addressable list. */
export function resolveOwnedPaints(ownedIds: Set<string>, customPaints: { id: string; brand: string; name: string; hex: string }[]): OwnedPaintRef[] {
  const fromCatalog = getAllPaints()
    .filter((p) => ownedIds.has(p.id))
    .map((p) => ({ id: p.id, name: p.name, manufacturer: p.manufacturer, hex: p.hex }))
  const fromCustom = customPaints.map((p) => ({ id: p.id, name: p.name, manufacturer: p.brand, hex: p.hex }))
  return [...fromCatalog, ...fromCustom]
}

export interface SubstituteMatch {
  paint: OwnedPaintRef
  distance: number
  confidence: number
}

/** Nearest paint to `hex` among only the paints the user actually owns. */
export function findClosestOwnedSubstitute(hex: string, owned: OwnedPaintRef[]): SubstituteMatch | null {
  if (owned.length === 0) return null
  const target = hexToRgb(hex)
  let best: SubstituteMatch | null = null
  for (const paint of owned) {
    const distance = rgbDistance(target, hexToRgb(paint.hex))
    if (!best || distance < best.distance) {
      best = { paint, distance, confidence: matchConfidence(distance) }
    }
  }
  return best
}

export interface MixSuggestion {
  paintA: OwnedPaintRef
  paintB: OwnedPaintRef
  ratioA: number // 10-90, percent of paintA
  ratioB: number
  mixedHex: string
  distance: number
  confidence: number
}

/**
 * Tries every pair of owned paints at 10%-step ratios and returns the blend
 * that lands closest to `hex`. Used when no single owned paint is a close
 * enough match (see the confidence threshold where this is called from the
 * UI) — a two-paint mix is often a much better answer than "buy a new pot."
 */
export function suggestMixRatio(hex: string, owned: OwnedPaintRef[]): MixSuggestion | null {
  if (owned.length < 2) return null
  const target = hexToRgb(hex)
  let best: MixSuggestion | null = null

  for (let i = 0; i < owned.length; i++) {
    for (let j = i + 1; j < owned.length; j++) {
      const a = hexToRgb(owned[i].hex)
      const b = hexToRgb(owned[j].hex)
      for (let ratioA = 10; ratioA <= 90; ratioA += 10) {
        const t = ratioA / 100
        const mixed = {
          r: a.r * t + b.r * (1 - t),
          g: a.g * t + b.g * (1 - t),
          b: a.b * t + b.b * (1 - t),
        }
        const distance = rgbDistance(target, mixed)
        if (!best || distance < best.distance) {
          best = {
            paintA: owned[i],
            paintB: owned[j],
            ratioA,
            ratioB: 100 - ratioA,
            mixedHex: rgbToHex(mixed),
            distance,
            confidence: matchConfidence(distance),
          }
        }
      }
    }
  }
  return best
}
