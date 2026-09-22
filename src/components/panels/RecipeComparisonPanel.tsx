import { useState } from 'react'
import { analyzeImage, compareImages, ImageStats } from '../../utils/imageAnalysis'
import ImageDropZone from '../ImageDropZone'

function StatRow({ label, a, b, format = (v: number) => `${Math.round(v)}` }: { label: string; a: number; b: number; format?: (v: number) => string }) {
  const max = Math.max(a, b, 1)
  return (
    <div>
      <div className="flex justify-between text-xs text-forge-mute">
        <span>{label}</span>
        <span>A: {format(a)} · B: {format(b)}</span>
      </div>
      <div className="mt-1 flex gap-1">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-forge-border">
          <div className="h-full bg-forge-copper" style={{ width: `${(a / max) * 100}%` }} />
        </div>
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-forge-border">
          <div className="h-full bg-forge-sage" style={{ width: `${(b / max) * 100}%` }} />
        </div>
      </div>
    </div>
  )
}

export default function RecipeComparisonPanel() {
  const [imageA, setImageA] = useState<string | null>(null)
  const [imageB, setImageB] = useState<string | null>(null)
  const [statsA, setStatsA] = useState<ImageStats | null>(null)
  const [statsB, setStatsB] = useState<ImageStats | null>(null)

  const comparison = statsA && statsB ? compareImages(statsA, statsB) : null

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="font-display text-xl text-forge-ink">Recipe Comparison</h2>
        <p className="mt-1 max-w-2xl text-sm text-forge-mute">
          Upload two photos — a reference and your own progress shot, say — and compare their overall hue, saturation, brightness, and contrast. Useful for checking a repaint or a second model against the first without eyeballing it.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-forge-copper">Photo A (reference)</div>
          <ImageDropZone
            imageSrc={imageA}
            onImageSelected={(src) => { setImageA(src); setStatsA(null) }}
            onImgLoad={(img) => setStatsA(analyzeImage(img))}
            height="min-h-[180px]"
          />
        </div>
        <div>
          <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-forge-sage">Photo B (compare against A)</div>
          <ImageDropZone
            imageSrc={imageB}
            onImageSelected={(src) => { setImageB(src); setStatsB(null) }}
            onImgLoad={(img) => setStatsB(analyzeImage(img))}
            height="min-h-[180px]"
          />
        </div>
      </div>

      {statsA && statsB && comparison && (
        <>
          <section className="rounded-md border border-forge-border bg-forge-panel p-5">
            <div className="mb-4 flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="h-6 w-6 rounded border border-forge-border" style={{ backgroundColor: statsA.avgHex }} />
                <span className="font-mono text-xs text-forge-mute">A: {statsA.avgHex}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-6 w-6 rounded border border-forge-border" style={{ backgroundColor: statsB.avgHex }} />
                <span className="font-mono text-xs text-forge-mute">B: {statsB.avgHex}</span>
              </div>
              <span className="text-xs text-forge-mute">(average color of each photo)</span>
            </div>
            <div className="flex flex-col gap-4">
              <StatRow label="Hue" a={statsA.hue} b={statsB.hue} format={(v) => `${Math.round(v)}°`} />
              <StatRow label="Saturation" a={statsA.saturation} b={statsB.saturation} format={(v) => `${Math.round(v)}%`} />
              <StatRow label="Brightness" a={statsA.brightness} b={statsB.brightness} format={(v) => `${Math.round(v)}%`} />
              <StatRow label="Contrast (value range)" a={statsA.contrast} b={statsB.contrast} format={(v) => v.toFixed(1)} />
            </div>
          </section>

          <section className="rounded-md border border-forge-border bg-forge-panel2 p-5">
            <h3 className="font-display text-sm text-forge-ink">Correction Suggestions</h3>
            <ul className="mt-3 space-y-2 text-sm text-forge-mute">
              {comparison.suggestions.map((s, i) => (
                <li key={i} className="flex gap-2">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-forge-copper" />
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}
    </div>
  )
}
