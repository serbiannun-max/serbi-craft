import { useState } from 'react'
import skinData from '../../data/skinPresets.json'
import LadderStrip from '../LadderStrip'

export default function SkinPanel() {
  const [activeId, setActiveId] = useState(skinData.presets[0].id)
  const active = skinData.presets.find((p) => p.id === activeId)!

  const steps = [
    { hex: active.layers.deepShadow.hex, label: 'Deep Shadow', sublabel: active.layers.deepShadow.name },
    { hex: active.layers.shadow.hex, label: 'Shadow', sublabel: active.layers.shadow.name },
    { hex: active.layers.midtone.hex, label: 'Midtone', sublabel: active.layers.midtone.name },
    { hex: active.layers.base.hex, label: 'Base', sublabel: active.layers.base.name },
    { hex: active.layers.highlight.hex, label: 'Highlight', sublabel: active.layers.highlight.name },
    { hex: active.layers.extremeHighlight.hex, label: 'Extreme Highlight', sublabel: active.layers.extremeHighlight.name },
  ]

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="font-display text-xl text-forge-ink">Skin Painting Mode</h2>
        <p className="mt-1 max-w-2xl text-sm text-forge-mute">
          Dedicated flesh-tone recipes. These come from preset JSON data rather than the general rule engine, since skin follows its own painting conventions.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {skinData.presets.map((p) => (
          <button
            key={p.id}
            onClick={() => setActiveId(p.id)}
            className={`rounded-md border px-4 py-2 text-sm transition-colors ${
              p.id === activeId
                ? 'border-forge-copper bg-forge-copper/10 text-forge-ink'
                : 'border-forge-border bg-forge-panel text-forge-mute hover:text-forge-ink'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      <section className="rounded-md border border-forge-border bg-forge-panel p-5">
        <h3 className="font-display text-sm text-forge-ink">{active.label}</h3>
        <p className="mt-1 text-sm text-forge-mute">{active.description}</p>
        <div className="mt-5">
          <LadderStrip steps={steps} tall />
        </div>
      </section>
    </div>
  )
}
