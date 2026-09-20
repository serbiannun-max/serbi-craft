import { HSL, hslToHex } from '../../utils/colorMath'
import { getPaintLadder } from '../../utils/miniatureAdvisor'
import { brandList, databaseNote, findNearestPaints, matchConfidence } from '../../utils/paintMatch'
import { loadOwned } from '../../utils/collection'
import { useEffect, useState } from 'react'

export default function PaintBrandsPanel({ hsl }: { hsl: HSL }) {
  const hex = hslToHex(hsl)
  const ladder = getPaintLadder(hex)
  const [owned, setOwned] = useState<Set<string>>(new Set())

  useEffect(() => { setOwned(loadOwned()) }, [])

  const rows = [
    { label: 'Deep Shadow', swatch: ladder.deepShadow },
    { label: 'Shadow', swatch: ladder.shadow },
    { label: 'Transition', swatch: ladder.transition },
    { label: 'Base', swatch: ladder.base },
    { label: 'Highlight', swatch: ladder.highlight },
    { label: 'Extreme Highlight', swatch: ladder.extremeHighlight },
  ]

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="font-display text-xl text-forge-ink">Paint Brands</h2>
        <p className="mt-1 max-w-2xl text-sm text-forge-mute">
          Each step of the current ladder matched to the nearest real paint across {brandList.length} brands, with a match confidence score.
        </p>
        <p className="mt-2 max-w-2xl text-xs text-forge-mute/80">{databaseNote}</p>
      </div>

      <div className="flex flex-col gap-4">
        {rows.map((row) => {
          const [match] = findNearestPaints(row.swatch.hex, 1)
          const confidence = matchConfidence(match.distance)
          return (
            <div key={row.label} className="rounded-md border border-forge-border bg-forge-panel p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 shrink-0 rounded border border-forge-border" style={{ backgroundColor: row.swatch.hex }} />
                  <div>
                    <div className="text-sm font-medium text-forge-ink">{row.label}</div>
                    <div className="font-mono text-xs text-forge-mute">{row.swatch.hex} · nearest category: {match.category}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-24 overflow-hidden rounded-full bg-forge-border">
                    <div className="h-full bg-forge-copper" style={{ width: `${confidence}%` }} />
                  </div>
                  <span className="font-mono text-xs text-forge-mute">{confidence}% match</span>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-5">
                {brandList.map((brand) => {
                  const paintName = (match.paints as Record<string, string>)[brand]
                  const isOwned = owned.has(`${brand}::${paintName}`)
                  return (
                    <div key={brand} className={`rounded border px-2 py-1.5 ${isOwned ? 'border-forge-sage bg-forge-sage/10' : 'border-forge-border bg-forge-panel2'}`}>
                      <div className="text-[10px] uppercase tracking-wide text-forge-mute">{brand}</div>
                      <div className="text-xs text-forge-ink">{paintName}</div>
                      {isOwned && <div className="mt-0.5 text-[10px] text-forge-sage">In your collection</div>}
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
