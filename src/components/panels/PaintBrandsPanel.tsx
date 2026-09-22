import { HSL, hslToHex } from '../../utils/colorMath'
import { getPaintLadder } from '../../utils/miniatureAdvisor'
import { brandList, databaseNote, findNearestPaints, matchConfidence, resolveOwnedPaints, findClosestOwnedSubstitute, suggestMixRatio, OwnedPaintRef } from '../../utils/paintMatch'
import { findNearestInRange } from '../../utils/paintCatalog'
import { loadOwned, loadCustomPaints, CustomPaint } from '../../utils/collection'
import { useSettings } from '../../context/SettingsContext'
import { useEffect, useMemo, useState } from 'react'

const OWNED_CONFIDENCE_THRESHOLD = 70

export default function PaintBrandsPanel({ hsl }: { hsl: HSL }) {
  const hex = hslToHex(hsl)
  const ladder = getPaintLadder(hex)
  const [owned, setOwned] = useState<Set<string>>(new Set())
  const [customPaints, setCustomPaints] = useState<CustomPaint[]>([])
  const { preferredRange } = useSettings()

  useEffect(() => {
    setOwned(loadOwned())
    setCustomPaints(loadCustomPaints())
  }, [])

  const ownedPaints = useMemo<OwnedPaintRef[]>(() => resolveOwnedPaints(owned, customPaints), [owned, customPaints])

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

      <section className="rounded-md border border-forge-copper/40 bg-forge-panel p-5">
        <h3 className="font-display text-sm text-forge-ink">Recipe in Your Preferred Range — {preferredRange}</h3>
        <p className="mt-1 text-xs text-forge-mute">
          Owned paints (set in the Collection Manager) are preferred and highlighted. If nothing owned is close, this looks for the nearest owned substitute, then a two-paint mixing ratio.
        </p>
        <div className="mt-4 flex flex-col gap-3">
          {rows.map((row) => {
            const [rangeMatch] = findNearestInRange(row.swatch.hex, preferredRange, 1)
            const isOwned = ownedPaints.some((p) => p.id === rangeMatch.paint.id)
            const needsHelp = !isOwned && rangeMatch.confidence < OWNED_CONFIDENCE_THRESHOLD
            const substitute = needsHelp ? findClosestOwnedSubstitute(row.swatch.hex, ownedPaints) : null
            const showMix = needsHelp && (!substitute || substitute.confidence < OWNED_CONFIDENCE_THRESHOLD)
            const mix = showMix ? suggestMixRatio(row.swatch.hex, ownedPaints) : null

            return (
              <div key={row.label} className="rounded border border-forge-border bg-forge-panel2 p-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 shrink-0 rounded border border-forge-border" style={{ backgroundColor: row.swatch.hex }} />
                    <div>
                      <div className="text-xs font-medium text-forge-ink">{row.label}</div>
                      <div className="text-xs text-forge-mute">
                        {rangeMatch.paint.name} <span className="font-mono">({rangeMatch.confidence}% match)</span>
                      </div>
                    </div>
                  </div>
                  {isOwned && (
                    <span className="rounded-full border border-forge-sage/40 bg-forge-sage/10 px-2 py-0.5 text-[10px] text-forge-sage">
                      You own this
                    </span>
                  )}
                </div>

                {substitute && (
                  <div className="mt-2 rounded border border-forge-border bg-forge-panel px-3 py-2 text-xs text-forge-mute">
                    Closest owned substitute: <span className="text-forge-ink">{substitute.paint.name}</span> ({substitute.paint.manufacturer}) — {substitute.confidence}% match
                  </div>
                )}

                {mix && (
                  <div className="mt-2 rounded border border-forge-border bg-forge-panel px-3 py-2 text-xs text-forge-mute">
                    Suggested mix: <span className="text-forge-ink">{mix.ratioA}% {mix.paintA.name}</span> + <span className="text-forge-ink">{mix.ratioB}% {mix.paintB.name}</span> ≈ {mix.confidence}% match
                    <span className="ml-2 inline-block h-3 w-3 align-middle rounded-full border border-forge-border" style={{ backgroundColor: mix.mixedHex }} />
                  </div>
                )}

                {needsHelp && !substitute && !mix && (
                  <div className="mt-2 text-xs text-forge-mute/70">No owned paints yet — add some in the Collection Manager to get substitute/mix suggestions here.</div>
                )}
              </div>
            )
          })}
        </div>
      </section>

      <div>
        <h3 className="font-display text-sm text-forge-ink">Cross-Brand Quick Compare</h3>
        <p className="mt-1 text-xs text-forge-mute">The same ladder matched independently across all {brandList.length} brands, for a side-by-side look.</p>
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
