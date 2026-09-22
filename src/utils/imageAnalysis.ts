import { rgbToHex, rgbToHsl, warmthPercent } from './colorMath'
import { sampleImagePixels } from './imageSampling'

export interface ImageStats {
  avgHex: string
  hue: number
  saturation: number
  brightness: number // mean HSL lightness
  contrast: number // stddev of per-pixel lightness — a simple, honest proxy for "how much value range this image uses," not a full perceptual contrast model
  warmth: number
}

export function analyzeImage(img: HTMLImageElement): ImageStats | null {
  const pixels = sampleImagePixels(img)
  if (pixels.length === 0) return null

  let sumR = 0, sumG = 0, sumB = 0
  const lightnesses: number[] = []
  for (const p of pixels) {
    sumR += p.r
    sumG += p.g
    sumB += p.b
    lightnesses.push(rgbToHsl(p).l)
  }
  const n = pixels.length
  const avgRgb = { r: sumR / n, g: sumG / n, b: sumB / n }
  const avgHsl = rgbToHsl(avgRgb)

  const meanL = lightnesses.reduce((a, b) => a + b, 0) / n
  const variance = lightnesses.reduce((acc, l) => acc + (l - meanL) ** 2, 0) / n
  const contrast = Math.sqrt(variance)

  return {
    avgHex: rgbToHex(avgRgb),
    hue: avgHsl.h,
    saturation: avgHsl.s,
    brightness: avgHsl.l,
    contrast,
    warmth: warmthPercent(avgHsl),
  }
}

export interface ComparisonResult {
  hueDelta: number
  saturationDelta: number
  brightnessDelta: number
  contrastDelta: number
  suggestions: string[]
}

function circularHueDelta(a: number, b: number): number {
  const d = Math.abs(a - b)
  return Math.min(d, 360 - d)
}

export function compareImages(a: ImageStats, b: ImageStats): ComparisonResult {
  const hueDelta = circularHueDelta(a.hue, b.hue)
  const saturationDelta = b.saturation - a.saturation
  const brightnessDelta = b.brightness - a.brightness
  const contrastDelta = b.contrast - a.contrast

  const suggestions: string[] = []

  if (hueDelta > 20) {
    suggestions.push(`Photo B's overall hue sits ${Math.round(hueDelta)}° away from Photo A on the color wheel — if you're trying to match A, shift your base mix toward A's hue before adjusting anything else.`)
  }
  if (Math.abs(saturationDelta) > 12) {
    suggestions.push(saturationDelta > 0
      ? `Photo B is noticeably more saturated (+${Math.round(saturationDelta)}%). Cut your mixes with a touch of grey or the complement to bring B in line with A.`
      : `Photo B is noticeably less saturated (${Math.round(saturationDelta)}%). Push your base colors purer to bring B in line with A.`)
  }
  if (Math.abs(brightnessDelta) > 12) {
    suggestions.push(brightnessDelta > 0
      ? `Photo B reads brighter overall (+${Math.round(brightnessDelta)}%). Your highlight steps are likely running too light, or the base itself needs to go a shade darker.`
      : `Photo B reads darker overall (${Math.round(brightnessDelta)}%). Your shadows are likely running too dark, or the base itself needs to lighten a shade.`)
  }
  if (Math.abs(contrastDelta) > 8) {
    suggestions.push(contrastDelta > 0
      ? `Photo B has more value range (higher contrast) than A. Push your Deep Shadow darker and your Extreme Highlight brighter to match B's punch.`
      : `Photo B has less value range (lower contrast) than A. Pull your Deep Shadow and Extreme Highlight steps closer together to soften B toward A's look.`)
  }
  if (suggestions.length === 0) {
    suggestions.push('These two are close across hue, saturation, brightness, and contrast — no major correction needed.')
  }

  return { hueDelta, saturationDelta, brightnessDelta, contrastDelta, suggestions }
}
