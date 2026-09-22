import { useState } from 'react'
import { hexToRgb, rgbDistance } from '../../utils/colorMath'
import { getPaintLadder } from '../../utils/miniatureAdvisor'
import ImageDropZone from '../ImageDropZone'
import LadderStrip from '../LadderStrip'
import { pickPixelColorFromEvent } from '../../utils/pixelPick'
import skinPresets from '../../data/skinPresets.json'
import nmmGold from '../../data/nmmGold.json'
import nmmSteel from '../../data/nmmSteel.json'

const MATERIALS = ['Armor', 'Cloth', 'Skin', 'Leather', 'Gold', 'Steel'] as const
type Material = typeof MATERIALS[number]

interface Marker {
  id: string
  hex: string
  material: Material
}

interface RecipeStep {
  hex: string
  label: string
  sublabel?: string
}

function recipeForMarker(marker: Marker): { note: string; steps: RecipeStep[] } {
  if (marker.material === 'Skin') {
    const target = hexToRgb(marker.hex)
    let best = skinPresets.presets[0]
    let bestDist = Infinity
    for (const preset of skinPresets.presets) {
      const d = rgbDistance(target, hexToRgb(preset.layers.base.hex))
      if (d < bestDist) { bestDist = d; best = preset }
    }
    const l = best.layers
    return {
      note: `Closest skin preset match: ${best.label}. Skin uses the dedicated Skin Tones presets rather than the general ladder, since real skin shadow theory (purple → red-brown) doesn't follow the same complementary logic as flat materials.`,
      steps: [
        { hex: l.deepShadow.hex, label: 'Deep Shadow', sublabel: l.deepShadow.name },
        { hex: l.shadow.hex, label: 'Shadow', sublabel: l.shadow.name },
        { hex: l.midtone.hex, label: 'Midtone', sublabel: l.midtone.name },
        { hex: l.base.hex, label: 'Base', sublabel: l.base.name },
        { hex: l.highlight.hex, label: 'Highlight', sublabel: l.highlight.name },
        { hex: l.extremeHighlight.hex, label: 'Extreme Highlight', sublabel: l.extremeHighlight.name },
      ],
    }
  }

  if (marker.material === 'Gold' || marker.material === 'Steel') {
    const nmm = marker.material === 'Gold' ? nmmGold : nmmSteel
    return {
      note: `Reference ${nmm.label} ladder. NMM reads through sharp value contrast rather than a complementary shadow, so this reuses the dedicated ${nmm.label} module's ladder directly — see that tab for full technique notes.`,
      steps: nmm.ladder.map((s) => ({ hex: s.hex, label: s.step, sublabel: s.name })),
    }
  }

  // Armor, Cloth, Leather: ordinary painted surfaces — run the sampled
  // color straight through the core Miniature Advisor engine.
  const ladder = getPaintLadder(marker.hex)
  return {
    note: `Generated directly from the sampled color via the core color-theory engine (same as the Miniature Advisor tab).`,
    steps: [
      { hex: ladder.deepShadow.hex, label: 'Deep Shadow', sublabel: ladder.deepShadow.name },
      { hex: ladder.shadow.hex, label: 'Shadow', sublabel: ladder.shadow.name },
      { hex: ladder.transition.hex, label: 'Transition', sublabel: ladder.transition.name },
      { hex: ladder.base.hex, label: 'Base', sublabel: ladder.base.name },
      { hex: ladder.highlight.hex, label: 'Highlight', sublabel: ladder.highlight.name },
      { hex: ladder.extremeHighlight.hex, label: 'Extreme Highlight', sublabel: ladder.extremeHighlight.name },
    ],
  }
}

export default function BoxArtAnalyzerPanel() {
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [pendingColor, setPendingColor] = useState<string | null>(null)
  const [markers, setMarkers] = useState<Marker[]>([])
  const [expandedId, setExpandedId] = useState<string | null>(null)

  function onImageSelected(dataUrl: string) {
    setImageSrc(dataUrl)
    setMarkers([])
    setPendingColor(null)
  }

  function assignMaterial(material: Material) {
    if (!pendingColor) return
    const marker: Marker = { id: `${Date.now()}-${material}`, hex: pendingColor, material }
    setMarkers((prev) => [...prev, marker])
    setExpandedId(marker.id)
    setPendingColor(null)
  }

  function removeMarker(id: string) {
    setMarkers((prev) => prev.filter((m) => m.id !== id))
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="font-display text-xl text-forge-ink">Box Art Analyzer</h2>
        <p className="mt-1 max-w-2xl text-sm text-forge-mute">
          Upload a box-art or display-piece photo, click a spot, and tag it with the material it represents. Each tagged point gets a probable recipe from the same engine as the rest of the app — Skin routes through the Skin Tones presets, Gold/Steel through the NMM ladders, everything else through the core Miniature Advisor engine.
        </p>
      </div>

      <ImageDropZone
        imageSrc={imageSrc}
        onImageSelected={onImageSelected}
        onImageClick={(e) => {
          const hex = pickPixelColorFromEvent(e.currentTarget, e.clientX, e.clientY)
          if (hex) setPendingColor(hex)
        }}
        placeholder="Drag and drop a box-art photo here, or click to browse"
      />

      {pendingColor && (
        <section className="rounded-md border border-forge-copper/40 bg-forge-panel p-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="h-10 w-10 shrink-0 rounded border border-forge-border" style={{ backgroundColor: pendingColor }} />
            <div className="font-mono text-xs text-forge-mute">{pendingColor}</div>
            <span className="text-xs text-forge-ink">Tag this point as:</span>
            <div className="flex flex-wrap gap-1.5">
              {MATERIALS.map((m) => (
                <button
                  key={m}
                  onClick={() => assignMaterial(m)}
                  className="rounded-full border border-forge-border bg-forge-panel2 px-3 py-1 text-xs text-forge-ink hover:border-forge-copper"
                >
                  {m}
                </button>
              ))}
            </div>
            <button onClick={() => setPendingColor(null)} className="ml-auto text-xs text-forge-mute hover:text-forge-ink">
              Cancel
            </button>
          </div>
        </section>
      )}

      {markers.length > 0 && (
        <section className="flex flex-col gap-3">
          <h3 className="font-display text-sm text-forge-ink">Tagged Materials</h3>
          {markers.map((m) => {
            const isOpen = expandedId === m.id
            const { note, steps } = recipeForMarker(m)
            return (
              <div key={m.id} className="rounded-md border border-forge-border bg-forge-panel">
                <button
                  onClick={() => setExpandedId(isOpen ? null : m.id)}
                  className="flex w-full items-center gap-3 p-4 text-left"
                >
                  <div className="h-9 w-9 shrink-0 rounded border border-forge-border" style={{ backgroundColor: m.hex }} />
                  <div className="flex-1">
                    <div className="text-sm text-forge-ink">{m.material}</div>
                    <div className="font-mono text-xs text-forge-mute">{m.hex}</div>
                  </div>
                  <span className="text-xs text-forge-mute">{isOpen ? 'Hide recipe ▲' : 'Show recipe ▼'}</span>
                  <span
                    onClick={(e) => { e.stopPropagation(); removeMarker(m.id) }}
                    className="ml-2 text-xs text-forge-warn hover:underline"
                  >
                    Remove
                  </span>
                </button>
                {isOpen && (
                  <div className="border-t border-forge-border p-4">
                    <p className="mb-3 text-xs text-forge-mute">{note}</p>
                    <LadderStrip steps={steps} tall />
                  </div>
                )}
              </div>
            )
          })}
        </section>
      )}
    </div>
  )
}
