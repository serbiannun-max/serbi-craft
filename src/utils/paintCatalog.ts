import paintDb from '../data/paintDatabase.json'
import vallejoModelColor from '../data/paints/vallejoModelColor.json'
import vallejoGameColor from '../data/paints/vallejoGameColor.json'
import vallejoXpressColor from '../data/paints/vallejoXpressColor.json'
import { HSV, hexToHsv, hexToRgb, rgbDistance } from './colorMath'

export const PAINT_RANGES = [
  'Vallejo Model Color',
  'Vallejo Game Color',
  'Vallejo Xpress Color',
  'Citadel',
  'Army Painter',
  'AK Interactive',
  'Two Thin Coats',
] as const

export type PaintRange = typeof PAINT_RANGES[number]

export interface CatalogPaint {
  id: string
  name: string
  manufacturer: PaintRange
  hex: string
  hsv: HSV
}

const VALLEJO_SOURCES: Record<string, { manufacturer: PaintRange; paints: { name: string; hex: string }[] }> = {
  'Vallejo Model Color': { manufacturer: 'Vallejo Model Color', paints: vallejoModelColor.paints },
  'Vallejo Game Color': { manufacturer: 'Vallejo Game Color', paints: vallejoGameColor.paints },
  'Vallejo Xpress Color': { manufacturer: 'Vallejo Xpress Color', paints: vallejoXpressColor.paints },
}

// The four ranges that don't (yet) have a dedicated catalog file reuse the
// existing 24-category paintDatabase.json — the same data the Paint Brands
// module has always used. This is additive: nothing about paintDatabase.json
// or its existing consumers (findNearestPaints, flattenPaintCatalog) changes.
const LEGACY_CATEGORY_RANGES: PaintRange[] = ['Citadel', 'Army Painter', 'AK Interactive', 'Two Thin Coats']

let cache: Record<PaintRange, CatalogPaint[]> | null = null

function buildCatalog(): Record<PaintRange, CatalogPaint[]> {
  const out = {} as Record<PaintRange, CatalogPaint[]>

  for (const range of Object.keys(VALLEJO_SOURCES) as PaintRange[]) {
    const source = VALLEJO_SOURCES[range]
    out[range] = source.paints.map((p) => ({
      id: `${range}::${p.name}`,
      name: p.name,
      manufacturer: range,
      hex: p.hex,
      hsv: hexToHsv(p.hex),
    }))
  }

  for (const range of LEGACY_CATEGORY_RANGES) {
    out[range] = paintDb.swatches.map((sw) => {
      const name = (sw.paints as Record<string, string>)[range] ?? sw.category
      return {
        id: `${range}::${name}`,
        name,
        manufacturer: range,
        hex: sw.hex,
        hsv: hexToHsv(sw.hex),
      }
    })
  }

  return out
}

function getCatalogs(): Record<PaintRange, CatalogPaint[]> {
  if (!cache) cache = buildCatalog()
  return cache
}

export function getCatalogForRange(range: PaintRange): CatalogPaint[] {
  return getCatalogs()[range] ?? []
}

export function getAllPaints(): CatalogPaint[] {
  return PAINT_RANGES.flatMap((r) => getCatalogForRange(r))
}

export interface RangeMatch {
  paint: CatalogPaint
  distance: number
  confidence: number
}

function toConfidence(distance: number): number {
  const pct = 100 - (distance / 441.7) * 100
  return Math.round(Math.max(0, Math.min(100, pct)))
}

// The core lookup behind "Recipes should use the selected range": nearest
// paint(s) to a computed color-theory hex, searched only within one range's
// catalog.
export function findNearestInRange(hex: string, range: PaintRange, count = 1): RangeMatch[] {
  const target = hexToRgb(hex)
  const catalog = getCatalogForRange(range)
  const scored = catalog.map((paint) => {
    const distance = rgbDistance(target, hexToRgb(paint.hex))
    return { paint, distance, confidence: toConfidence(distance) }
  })
  scored.sort((a, b) => a.distance - b.distance)
  return scored.slice(0, count)
}
