import { rgbToHex } from './colorMath'

// Caches one full-resolution canvas per <img> element so repeated clicks
// don't redraw the image every time.
const canvasCache = new WeakMap<HTMLImageElement, HTMLCanvasElement>()

function getFullResCanvas(img: HTMLImageElement): HTMLCanvasElement | null {
  const cached = canvasCache.get(img)
  if (cached) return cached
  if (!img.naturalWidth || !img.naturalHeight) return null
  const canvas = document.createElement('canvas')
  canvas.width = img.naturalWidth
  canvas.height = img.naturalHeight
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  if (!ctx) return null
  ctx.drawImage(img, 0, 0)
  canvasCache.set(img, canvas)
  return canvas
}

/**
 * Given a mouse/click event fired on an <img> element and that same
 * element, returns the exact hex color of the pixel under the cursor, at
 * the image's native resolution (not the downsampled palette-extraction
 * canvas). Returns null if the image hasn't finished loading yet.
 */
export function pickPixelColorFromEvent(
  img: HTMLImageElement,
  clientX: number,
  clientY: number,
): string | null {
  const canvas = getFullResCanvas(img)
  const ctx = canvas?.getContext('2d', { willReadFrequently: true })
  if (!canvas || !ctx) return null

  const rect = img.getBoundingClientRect()
  const xRatio = (clientX - rect.left) / rect.width
  const yRatio = (clientY - rect.top) / rect.height
  if (xRatio < 0 || xRatio > 1 || yRatio < 0 || yRatio > 1) return null

  const x = Math.min(canvas.width - 1, Math.max(0, Math.floor(xRatio * canvas.width)))
  const y = Math.min(canvas.height - 1, Math.max(0, Math.floor(yRatio * canvas.height)))
  const { data } = ctx.getImageData(x, y, 1, 1)
  return rgbToHex({ r: data[0], g: data[1], b: data[2] })
}

/** Clears the cached canvas for an image — call when the image src changes. */
export function clearPixelPickCache(img: HTMLImageElement) {
  canvasCache.delete(img)
}
