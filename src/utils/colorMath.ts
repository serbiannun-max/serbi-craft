// Core color space conversions and harmony calculations.
// All hue values are in degrees [0, 360). Saturation/Lightness are [0, 100].

export interface RGB { r: number; g: number; b: number }
export interface HSL { h: number; s: number; l: number }

export function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n))
}

export function normalizeHue(h: number): number {
  let n = h % 360
  if (n < 0) n += 360
  return n
}

export function hexToRgb(hex: string): RGB {
  const clean = hex.replace('#', '').trim()
  const full = clean.length === 3
    ? clean.split('').map((c) => c + c).join('')
    : clean.padEnd(6, '0').slice(0, 6)
  const num = parseInt(full, 16)
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  }
}

export function rgbToHex({ r, g, b }: RGB): string {
  const toHex = (n: number) => clamp(Math.round(n), 0, 255).toString(16).padStart(2, '0')
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase()
}

export function rgbToHsl({ r, g, b }: RGB): HSL {
  const rn = r / 255, gn = g / 255, bn = b / 255
  const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn)
  const l = (max + min) / 2
  const d = max - min
  let h = 0
  let s = 0
  if (d !== 0) {
    s = d / (1 - Math.abs(2 * l - 1))
    switch (max) {
      case rn: h = ((gn - bn) / d) % 6; break
      case gn: h = (bn - rn) / d + 2; break
      default: h = (rn - gn) / d + 4; break
    }
    h *= 60
  }
  return { h: normalizeHue(h), s: clamp(s * 100, 0, 100), l: clamp(l * 100, 0, 100) }
}

export function hslToRgb({ h, s, l }: HSL): RGB {
  const sn = s / 100, ln = l / 100
  const c = (1 - Math.abs(2 * ln - 1)) * sn
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = ln - c / 2
  let r = 0, g = 0, b = 0
  const hh = normalizeHue(h)
  if (hh < 60) { r = c; g = x; b = 0 }
  else if (hh < 120) { r = x; g = c; b = 0 }
  else if (hh < 180) { r = 0; g = c; b = x }
  else if (hh < 240) { r = 0; g = x; b = c }
  else if (hh < 300) { r = x; g = 0; b = c }
  else { r = c; g = 0; b = x }
  return {
    r: (r + m) * 255,
    g: (g + m) * 255,
    b: (b + m) * 255,
  }
}

export function hexToHsl(hex: string): HSL {
  return rgbToHsl(hexToRgb(hex))
}

export function hslToHex(hsl: HSL): string {
  return rgbToHex(hslToRgb(hsl))
}

export function hslShift(hsl: HSL, deltaH: number, deltaS = 0, deltaL = 0): HSL {
  return {
    h: normalizeHue(hsl.h + deltaH),
    s: clamp(hsl.s + deltaS, 0, 100),
    l: clamp(hsl.l + deltaL, 0, 100),
  }
}

export function hslSet(hsl: HSL, overrides: Partial<HSL>): HSL {
  return {
    h: overrides.h !== undefined ? normalizeHue(overrides.h) : hsl.h,
    s: overrides.s !== undefined ? clamp(overrides.s, 0, 100) : hsl.s,
    l: overrides.l !== undefined ? clamp(overrides.l, 0, 100) : hsl.l,
  }
}

// --- Color harmonies -------------------------------------------------

export function complementary(hsl: HSL): HSL {
  return hslShift(hsl, 180)
}

export function analogous(hsl: HSL, spread = 30): [HSL, HSL] {
  return [hslShift(hsl, -spread), hslShift(hsl, spread)]
}

export function splitComplementary(hsl: HSL, spread = 30): [HSL, HSL] {
  const comp = complementary(hsl)
  return [hslShift(comp, -spread), hslShift(comp, spread)]
}

export function triadic(hsl: HSL): [HSL, HSL] {
  return [hslShift(hsl, 120), hslShift(hsl, 240)]
}

// --- Distance / naming -------------------------------------------------

export function rgbDistance(a: RGB, b: RGB): number {
  return Math.sqrt((a.r - b.r) ** 2 + (a.g - b.g) ** 2 + (a.b - b.b) ** 2)
}

// Named hue anchors used to give human labels to computed swatches.
const HUE_NAMES: { h: number; name: string }[] = [
  { h: 0, name: 'Red' },
  { h: 20, name: 'Red-Orange' },
  { h: 35, name: 'Orange' },
  { h: 45, name: 'Ochre' },
  { h: 55, name: 'Amber' },
  { h: 65, name: 'Yellow' },
  { h: 90, name: 'Chartreuse' },
  { h: 120, name: 'Green' },
  { h: 160, name: 'Teal Green' },
  { h: 185, name: 'Teal' },
  { h: 205, name: 'Cyan Blue' },
  { h: 220, name: 'Blue' },
  { h: 245, name: 'Indigo' },
  { h: 265, name: 'Violet' },
  { h: 280, name: 'Purple' },
  { h: 300, name: 'Magenta' },
  { h: 320, name: 'Pink-Magenta' },
  { h: 340, name: 'Crimson' },
  { h: 360, name: 'Red' },
]

export function nameForHsl(hsl: HSL): string {
  if (hsl.s < 12) {
    if (hsl.l > 88) return 'Ivory / White'
    if (hsl.l < 15) return 'Near Black'
    return 'Grey'
  }
  let closest = HUE_NAMES[0]
  let best = 361
  for (const entry of HUE_NAMES) {
    const d = Math.min(Math.abs(entry.h - hsl.h), 360 - Math.abs(entry.h - hsl.h))
    if (d < best) { best = d; closest = entry }
  }
  const lightness = hsl.l < 25 ? 'Dark ' : hsl.l > 75 ? 'Light ' : ''
  const brownish = hsl.l < 45 && hsl.s < 55 && (closest.name === 'Orange' || closest.name === 'Red' || closest.name === 'Ochre' || closest.name === 'Red-Orange')
  const name = brownish ? `${closest.name} Brown` : `${closest.name}`
  return `${lightness}${name}`.trim()
}

// Shortest-path circular interpolation between two hues, t in [0,1].
export function hueLerp(h1: number, h2: number, t: number): number {
  let diff = normalizeHue(h2 - h1)
  if (diff > 180) diff -= 360
  return normalizeHue(h1 + diff * t)
}

// --- Traditional painter's (RYB-style) color wheel ---------------------
// Digital screens work in an RGB hue wheel where red=0, yellow=60, green=120,
// cyan=180, blue=240, magenta=300. Painters are taught a pigment-based wheel
// where the primaries Red/Yellow/Blue sit 120 degrees apart and their
// complements are Green/Violet/Orange respectively (the classic art-class
// wheel). This piecewise remap converts between the two so "complementary"
// matches what a painter expects (yellow<->violet, red<->green, blue<->orange)
// instead of the digital cyan/magenta/yellow complements.
const RGB_HUE_BREAKS = [0, 60, 120, 180, 240, 300, 360]
const ART_HUE_BREAKS = [0, 120, 180, 210, 240, 300, 360]

function interpolateBreakpoints(value: number, fromBreaks: number[], toBreaks: number[]): number {
  const v = normalizeHue(value)
  for (let i = 0; i < fromBreaks.length - 1; i++) {
    const a = fromBreaks[i], b = fromBreaks[i + 1]
    if (v >= a && v <= b) {
      const t = b === a ? 0 : (v - a) / (b - a)
      return normalizeHue(toBreaks[i] + t * (toBreaks[i + 1] - toBreaks[i]))
    }
  }
  return v
}

export function rgbHueToArtHue(h: number): number {
  return interpolateBreakpoints(h, RGB_HUE_BREAKS, ART_HUE_BREAKS)
}

export function artHueToRgbHue(h: number): number {
  return interpolateBreakpoints(h, ART_HUE_BREAKS, RGB_HUE_BREAKS)
}

// The complement as a painter would mix it (traditional pigment wheel),
// returned as a real, renderable RGB hue.
export function artisticComplementHue(rgbHue: number): number {
  const art = rgbHueToArtHue(rgbHue)
  return artHueToRgbHue(normalizeHue(art + 180))
}

// Offset along the artistic wheel (e.g. +/-30 for split-complementary,
// +/-120 for triadic), returned as a real, renderable RGB hue.
export function artisticOffsetHue(rgbHue: number, artDegrees: number): number {
  const art = rgbHueToArtHue(rgbHue)
  return artHueToRgbHue(normalizeHue(art + artDegrees))
}

// --- HSV (Hue/Saturation/Value) ---------------------------------------
// Paint catalogs conventionally describe a color's Value (HSV), not
// Lightness (HSL) — they're related but not identical. Added alongside the
// existing HSL utilities rather than replacing them, since the rest of the
// app (harmonies, the ladder engine) is built on HSL.
export interface HSV { h: number; s: number; v: number }

export function rgbToHsv({ r, g, b }: RGB): HSV {
  const rn = r / 255, gn = g / 255, bn = b / 255
  const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn)
  const d = max - min
  let h = 0
  if (d !== 0) {
    switch (max) {
      case rn: h = ((gn - bn) / d) % 6; break
      case gn: h = (bn - rn) / d + 2; break
      default: h = (rn - gn) / d + 4; break
    }
    h *= 60
  }
  const s = max === 0 ? 0 : d / max
  return { h: normalizeHue(h), s: clamp(s * 100, 0, 100), v: clamp(max * 100, 0, 100) }
}

export function hexToHsv(hex: string): HSV {
  return rgbToHsv(hexToRgb(hex))
}

// Warm anchor centered on red-orange (hue 40), cool anchor centered on
// cyan-blue (hue 220). Produces a smooth 0-100% warmth score from hue,
// weighted down as saturation drops (greys are thermally neutral).
export function warmthPercent(hsl: HSL): number {
  const warmAnchor = 40
  const diff = Math.min(Math.abs(hsl.h - warmAnchor), 360 - Math.abs(hsl.h - warmAnchor))
  const raw = (Math.cos((diff / 180) * Math.PI) + 1) / 2 // 1 at anchor, 0 at opposite
  const saturationWeight = clamp(hsl.s / 60, 0.35, 1) // desaturated colors pull toward neutral
  const neutral = 50
  const score = neutral + (raw * 100 - neutral) * saturationWeight
  return clamp(score, 0, 100)
}
