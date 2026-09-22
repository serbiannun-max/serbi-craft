import { RGB, rgbToHex } from './colorMath'
import { sampleImagePixels } from './imageSampling'

export interface ExtractedColor {
  hex: string
  percent: number
}

function getSampledPixels(img: HTMLImageElement): RGB[] {
  return sampleImagePixels(img)
}

function distSq(a: RGB, b: RGB): number {
  const dr = a.r - b.r, dg = a.g - b.g, db = a.b - b.b
  return dr * dr + dg * dg + db * db
}

// Simple k-means over RGB space. Deterministic-ish seeding (evenly spaced
// samples from the pixel array) so repeated runs on the same image are
// stable rather than flickering between similar clusters.
function kMeans(pixels: RGB[], k: number, iterations = 8): { centroid: RGB; count: number }[] {
  if (pixels.length === 0) return []
  const clampedK = Math.min(k, pixels.length)

  const centroids: RGB[] = []
  for (let i = 0; i < clampedK; i++) {
    const idx = Math.floor((i / clampedK) * pixels.length)
    centroids.push({ ...pixels[idx] })
  }

  let assignments = new Array(pixels.length).fill(0)

  for (let iter = 0; iter < iterations; iter++) {
    // Assign
    for (let p = 0; p < pixels.length; p++) {
      let best = 0
      let bestDist = Infinity
      for (let c = 0; c < centroids.length; c++) {
        const d = distSq(pixels[p], centroids[c])
        if (d < bestDist) { bestDist = d; best = c }
      }
      assignments[p] = best
    }
    // Update
    const sums = centroids.map(() => ({ r: 0, g: 0, b: 0, count: 0 }))
    for (let p = 0; p < pixels.length; p++) {
      const c = assignments[p]
      sums[c].r += pixels[p].r
      sums[c].g += pixels[p].g
      sums[c].b += pixels[p].b
      sums[c].count += 1
    }
    for (let c = 0; c < centroids.length; c++) {
      if (sums[c].count > 0) {
        centroids[c] = {
          r: sums[c].r / sums[c].count,
          g: sums[c].g / sums[c].count,
          b: sums[c].b / sums[c].count,
        }
      }
    }
  }

  const counts = new Array(centroids.length).fill(0)
  for (const a of assignments) counts[a]++

  return centroids.map((centroid, i) => ({ centroid, count: counts[i] }))
}

// Extracts the top `count` dominant colors from an already-loaded <img>
// element, entirely on-device via canvas + k-means. No network, no upload.
export function extractPalette(img: HTMLImageElement, count = 6): ExtractedColor[] {
  const pixels = getSampledPixels(img)
  if (pixels.length === 0) return []

  const clusters = kMeans(pixels, count)
    .filter((c) => c.count > 0)
    .sort((a, b) => b.count - a.count)

  const total = pixels.length
  return clusters.map((c) => ({
    hex: rgbToHex(c.centroid),
    percent: Math.round((c.count / total) * 100),
  }))
}
