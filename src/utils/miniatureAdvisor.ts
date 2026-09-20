import {
  HSL, hexToHsl, hslToHex, hslSet, hueLerp, clamp, nameForHsl,
  artisticComplementHue, artisticOffsetHue, warmthPercent,
} from './colorMath'

export interface Swatch {
  hex: string
  name: string
  hsl: HSL
}

function swatchFrom(hsl: HSL): Swatch {
  return { hex: hslToHex(hsl), name: nameForHsl(hsl), hsl }
}

export type WarmCool = 'warm' | 'cool' | 'neutral'

export function classifyTemperature(hsl: HSL): WarmCool {
  const w = warmthPercent(hsl)
  if (w >= 58) return 'warm'
  if (w <= 42) return 'cool'
  return 'neutral'
}

export interface PaintLadder {
  deepShadow: Swatch
  shadow: Swatch
  transition: Swatch
  base: Swatch
  highlight: Swatch
  extremeHighlight: Swatch
  explanation: string[]
}

// FEATURE 2 + 3: the full underpainting -> base -> highlight ladder,
// built from the traditional (artistic) complementary wheel so shadows
// swing to the true pigment complement rather than the raw RGB complement.
export function getPaintLadder(hex: string): PaintLadder {
  const base = hexToHsl(hex)
  const compHue = artisticComplementHue(base.h)
  const temp = classifyTemperature(base)

  const deepShadowHsl = hslSet(base, { h: compHue, s: clamp(base.s + 25, 55, 100), l: 13 })
  const shadowHue = hueLerp(compHue, base.h, 0.18)
  const shadowHsl = hslSet(base, { h: shadowHue, s: clamp(base.s + 12, 45, 95), l: 24 })
  const transitionHue = hueLerp(compHue, base.h, 0.55)
  const transitionHsl = hslSet(base, { h: transitionHue, s: clamp(base.s + 5, 35, 90), l: 40 })

  const warmPullHue = hueLerp(base.h, 45, 0.22)
  const highlightHsl = hslSet(base, {
    h: warmPullHue,
    s: clamp(base.s - 12, 15, 95),
    l: clamp(base.l + 30, 55, 82),
  })
  const extremeHue = hueLerp(base.h, 45, 0.5)
  const extremeHighlightHsl = hslSet(base, {
    h: extremeHue,
    s: clamp(base.s * 0.18, 4, 20),
    l: 93,
  })

  const compName = nameForHsl({ h: compHue, s: 70, l: 30 })
  const explanation = [
    `${nameForHsl(base)} sits on the ${temp} side of the wheel, so the shadow ladder swings toward its traditional pigment complement (roughly ${compName}) to keep the darks feeling like light falling away, not just black mixed in.`,
    `Deep Shadow and Shadow lean almost fully into that complement at low lightness. This is what reads as recessed, occluded shadow under display lighting rather than muddy grey.`,
    `Transition blends the complement back toward the Base hue at mid-lightness, giving you a mixing color to feather the shadow into the local color smoothly instead of a hard edge.`,
    `Highlight and Extreme Highlight pull the Base hue gently toward warm ochre/ivory as they lighten, echoing how real and display light sources skew warm, so the brightest point on the model reads as light, not just white mixed in.`,
  ]

  return {
    deepShadow: swatchFrom(deepShadowHsl),
    shadow: swatchFrom(shadowHsl),
    transition: swatchFrom(transitionHsl),
    base: swatchFrom(base),
    highlight: swatchFrom(highlightHsl),
    extremeHighlight: swatchFrom(extremeHighlightHsl),
    explanation,
  }
}

export interface UnderpaintingOptions {
  best: Swatch
  good: Swatch
  experimental: Swatch
  explanation: string[]
}

// FEATURE 4: three underpainting strategies of increasing risk/reward.
export function getUnderpaintingOptions(hex: string): UnderpaintingOptions {
  const base = hexToHsl(hex)
  const compHue = artisticComplementHue(base.h)

  const bestHsl = hslSet(base, { h: compHue, s: clamp(base.s + 20, 55, 100), l: 32 })
  const goodHue = artisticOffsetHue(base.h, 150) // split-complementary neighbour
  const goodHsl = hslSet(base, { h: goodHue, s: clamp(base.s + 5, 40, 90), l: 34 })
  const experimentalHue = artisticOffsetHue(base.h, 120) // triadic, bold and unconventional
  const experimentalHsl = hslSet(base, { h: experimentalHue, s: clamp(base.s + 15, 45, 95), l: 26 })

  const explanation = [
    `Best: a fully saturated dose of the traditional complement, mid-dark in value. Zenithal light passing over this will punch the strongest possible contrast against the top coats.`,
    `Good: a split-complementary neighbour of the complement. Softer and more forgiving to blend over, at a small cost to maximum contrast.`,
    `Experimental: a triadic jump rather than a true complement. Less "correct" by the textbook, but it can give NMM and fantasy schemes a livelier, less predictable undertone worth testing on a spare model first.`,
  ]

  return { best: swatchFrom(bestHsl), good: swatchFrom(goodHsl), experimental: swatchFrom(experimentalHsl), explanation }
}

export interface TemperatureReport {
  warmPercent: number
  coolPercent: number
  classification: WarmCool
  reasons: string[]
  suggestion: string
}

// FEATURE 7
export function getTemperatureReport(hex: string): TemperatureReport {
  const hsl = hexToHsl(hex)
  const warm = Math.round(warmthPercent(hsl))
  const cool = 100 - warm
  const classification = classifyTemperature(hsl)

  const reasons: string[] = []
  if (hsl.s < 20) {
    reasons.push('Low saturation pulls this color toward thermally neutral, since desaturated colors carry less of a hue signal either way.')
  }
  if (hsl.h < 90 || hsl.h > 300) {
    reasons.push('The hue sits in the red/orange/yellow arc of the wheel, the warm half most painters mix from cadmium-family pigments.')
  } else if (hsl.h > 150 && hsl.h < 270) {
    reasons.push('The hue sits in the blue/violet arc of the wheel, the cool half most painters mix from ultramarine-family pigments.')
  } else {
    reasons.push('The hue sits near a warm/cool boundary (yellow-green or red-violet), so small saturation or lightness shifts can tip it either way.')
  }
  if (hsl.l > 80) {
    reasons.push('Very high lightness dilutes hue temperature further, since near-white mixes read as neutral regardless of hue.')
  }

  const suggestion = classification === 'warm'
    ? 'To add coolness for contrast, glaze a thin blue or violet-leaning shadow into the recesses, or cut the next highlight step with a touch of its complement before lightening.'
    : classification === 'cool'
      ? 'To add warmth for contrast, glaze a thin orange or ochre undertone into the transition zone, or warm the final highlight step slightly before it hits full lightness.'
      : 'This color is thermally balanced. Pushing either the shadow side cooler or the highlight side warmer (not both) will give the scheme a clearer sense of direction.'

  return { warmPercent: warm, coolPercent: cool, classification, reasons, suggestion }
}
