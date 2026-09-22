import { useRef, useState } from 'react'
import { extractPalette, ExtractedColor } from '../../utils/colorExtraction'
import { pickPixelColorFromEvent, clearPixelPickCache } from '../../utils/pixelPick'
import { hexToHsl, hslToHex } from '../../utils/colorMath'
import { getPaintLadder } from '../../utils/miniatureAdvisor'
import ImageDropZone from '../ImageDropZone'
import HarmonyDisplay from '../HarmonyDisplay'
import LadderStrip from '../LadderStrip'

const PALETTE_SIZES = [3, 5, 8] as const

function rankLabel(index: number, total: number): string {
  if (index < Math.min(2, total)) return 'Dominant'
  if (index < Math.min(5, total)) return 'Secondary'
  return 'Accent'
}

export default function PaintAnalyzerPanel({ onPick }: { onPick: (hex: string) => void }) {
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [palette, setPalette] = useState<ExtractedColor[]>([])
  const [paletteSize, setPaletteSize] = useState<typeof PALETTE_SIZES[number]>(5)
  const [lastPicked, setLastPicked] = useState<string | null>(null)
  const [clickedColor, setClickedColor] = useState<string | null>(null)
  const imgRef = useRef<HTMLImageElement | null>(null)

  function runExtraction(img: HTMLImageElement, size: typeof PALETTE_SIZES[number]) {
    imgRef.current = img
    clearPixelPickCache(img)
    setPalette(extractPalette(img, size))
  }

  function onImageSelected(dataUrl: string) {
    setImageSrc(dataUrl)
    setPalette([])
    setClickedColor(null)
  }

  function onImgLoad(img: HTMLImageElement) {
    runExtraction(img, paletteSize)
  }

  function changePaletteSize(size: typeof PALETTE_SIZES[number]) {
    setPaletteSize(size)
    if (imgRef.current) runExtraction(imgRef.current, size)
  }

  function pick(hex: string) {
    onPick(hex)
    setLastPicked(hex)
    window.setTimeout(() => setLastPicked((cur) => (cur === hex ? null : cur)), 1800)
  }

  const referenceColor = clickedColor ?? palette[0]?.hex ?? null

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="font-display text-xl text-forge-ink">Paint Analyzer</h2>
        <p className="mt-1 max-w-2xl text-sm text-forge-mute">
          Drop in a box-art shot or reference photo. It clusters into a dominant palette automatically, and you can click anywhere on the image to pick that exact pixel. Everything runs on-device — the image is never uploaded.
        </p>
      </div>

      <ImageDropZone
        imageSrc={imageSrc}
        onImageSelected={onImageSelected}
        onImgLoad={onImgLoad}
        onImageClick={(e) => {
          const hex = pickPixelColorFromEvent(e.currentTarget, e.clientX, e.clientY)
          if (hex) setClickedColor(hex)
        }}
      />

      {imageSrc && (
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => { setImageSrc(null); setPalette([]); setClickedColor(null) }}
            className="rounded-md border border-forge-border bg-forge-panel px-3 py-1.5 text-xs text-forge-mute hover:text-forge-ink"
          >
            Clear image
          </button>
          <span className="text-xs text-forge-mute">Click anywhere on the image above to pick that exact pixel.</span>
        </div>
      )}

      {clickedColor && (
        <section className="rounded-md border border-forge-copper/40 bg-forge-panel p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 shrink-0 rounded border border-forge-border" style={{ backgroundColor: clickedColor }} />
              <div>
                <div className="text-xs uppercase tracking-wide text-forge-mute">Picked Pixel</div>
                <div className="font-mono text-sm text-forge-ink">{clickedColor}</div>
              </div>
            </div>
            <button
              onClick={() => pick(clickedColor)}
              className="rounded-md bg-forge-copper px-3 py-1.5 text-xs font-medium text-forge-bg hover:bg-forge-copper/90"
            >
              {lastPicked === clickedColor ? 'Applied ✓' : 'Use this color'}
            </button>
          </div>
          <div className="mt-4">
            <HarmonyDisplay hsl={hexToHsl(clickedColor)} onPick={(h) => setClickedColor(hslToHex(h))} />
          </div>
        </section>
      )}

      {palette.length > 0 && (
        <section className="rounded-md border border-forge-border bg-forge-panel p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="font-display text-sm text-forge-ink">Extracted Palette</h3>
            <div className="flex gap-1.5">
              {PALETTE_SIZES.map((size) => (
                <button
                  key={size}
                  onClick={() => changePaletteSize(size)}
                  className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                    paletteSize === size
                      ? 'border-forge-copper bg-forge-copper/10 text-forge-ink'
                      : 'border-forge-border text-forge-mute hover:text-forge-ink'
                  }`}
                >
                  Top {size}
                </button>
              ))}
            </div>
          </div>
          <p className="mt-1 text-xs text-forge-mute">Click a swatch to send it to the Color Wheel — every other module updates from that same selected color.</p>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {palette.map((c, i) => (
              <button
                key={i}
                onClick={() => pick(c.hex)}
                className="group flex flex-col items-center gap-2 rounded-md border border-forge-border bg-forge-panel2 p-3 transition-colors hover:border-forge-copper"
              >
                <div className="h-14 w-full rounded border border-forge-border transition-transform group-hover:scale-105" style={{ backgroundColor: c.hex }} />
                <div className="text-[10px] uppercase tracking-wide text-forge-mute">{rankLabel(i, palette.length)}</div>
                <div className="font-mono text-xs text-forge-ink">{c.hex}</div>
                <div className="text-[10px] text-forge-mute">{c.percent}% of image</div>
                {lastPicked === c.hex && <div className="text-[10px] text-forge-sage">Applied ✓</div>}
              </button>
            ))}
          </div>
        </section>
      )}

      {referenceColor && (
        <section className="rounded-md border border-forge-border bg-forge-panel2 p-5">
          <h3 className="font-display text-sm text-forge-ink">Automatic Miniature Recipe</h3>
          <p className="mt-1 text-xs text-forge-mute">
            Generated from {clickedColor ? 'the picked pixel' : 'the top dominant color'} using the same engine as the Miniature Advisor tab.
          </p>
          <div className="mt-4">
            <RecipePreview hex={referenceColor} />
          </div>
        </section>
      )}
    </div>
  )
}

function RecipePreview({ hex }: { hex: string }) {
  const ladder = getPaintLadder(hex)
  const steps = [
    { hex: ladder.deepShadow.hex, label: 'Deep Shadow', sublabel: ladder.deepShadow.name },
    { hex: ladder.shadow.hex, label: 'Shadow', sublabel: ladder.shadow.name },
    { hex: ladder.transition.hex, label: 'Transition', sublabel: ladder.transition.name },
    { hex: ladder.base.hex, label: 'Base', sublabel: ladder.base.name },
    { hex: ladder.highlight.hex, label: 'Highlight', sublabel: ladder.highlight.name },
    { hex: ladder.extremeHighlight.hex, label: 'Extreme Highlight', sublabel: ladder.extremeHighlight.name },
  ]
  return <LadderStrip steps={steps} tall />
}
