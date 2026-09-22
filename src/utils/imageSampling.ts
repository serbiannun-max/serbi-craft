import { RGB } from './colorMath'

// Downscale onto an offscreen canvas before sampling — used by both the
// Paint Analyzer's palette extraction and Recipe Comparison's per-image
// averages. Factored out of colorExtraction.ts so both reuse one
// implementation instead of duplicating canvas plumbing.
const SAMPLE_MAX_DIM = 160

export function sampleImagePixels(img: HTMLImageElement, maxDim = SAMPLE_MAX_DIM): RGB[] {
  const scale = Math.min(1, maxDim / Math.max(img.naturalWidth, img.naturalHeight))
  const w = Math.max(1, Math.round(img.naturalWidth * scale))
  const h = Math.max(1, Math.round(img.naturalHeight * scale))

  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  if (!ctx) return []
  ctx.drawImage(img, 0, 0, w, h)
  const { data } = ctx.getImageData(0, 0, w, h)

  const pixels: RGB[] = []
  for (let i = 0; i < data.length; i += 4) {
    const alpha = data[i + 3]
    if (alpha < 128) continue // skip transparent pixels
    pixels.push({ r: data[i], g: data[i + 1], b: data[i + 2] })
  }
  return pixels
}
