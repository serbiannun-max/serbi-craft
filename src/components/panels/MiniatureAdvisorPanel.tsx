import { HSL, hslToHex } from '../../utils/colorMath'
import { getPaintLadder, classifyTemperature } from '../../utils/miniatureAdvisor'
import LadderStrip from '../LadderStrip'
import TemperatureBlock from '../TemperatureBlock'

export default function MiniatureAdvisorPanel({ hsl }: { hsl: HSL }) {
  const hex = hslToHex(hsl)
  const ladder = getPaintLadder(hex)
  const temp = classifyTemperature(hsl)

  const steps = [
    { hex: ladder.deepShadow.hex, label: 'Deep Shadow', sublabel: ladder.deepShadow.name },
    { hex: ladder.shadow.hex, label: 'Shadow', sublabel: ladder.shadow.name },
    { hex: ladder.transition.hex, label: 'Transition', sublabel: ladder.transition.name },
    { hex: ladder.base.hex, label: 'Base', sublabel: ladder.base.name },
    { hex: ladder.highlight.hex, label: 'Highlight', sublabel: ladder.highlight.name },
    { hex: ladder.extremeHighlight.hex, label: 'Extreme Highlight', sublabel: ladder.extremeHighlight.name },
  ]

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="font-display text-xl text-forge-ink">Miniature Painting Advisor</h2>
        <p className="mt-1 max-w-2xl text-sm text-forge-mute">
          A full underpainting-to-highlight ladder for <span className="font-mono text-forge-ink">{hex}</span>, built from the traditional pigment color wheel painters use, not the raw digital complement.
        </p>
      </div>

      <section className="rounded-md border border-forge-border bg-forge-panel p-5">
        <div className="mb-1 flex items-center gap-2">
          <h3 className="font-display text-sm text-forge-ink">Paint Layers — Darkest to Brightest</h3>
          <span className={`rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wide ${temp === 'warm' ? 'bg-forge-copper/20 text-forge-copper' : temp === 'cool' ? 'bg-forge-sage/20 text-forge-sage' : 'bg-forge-border text-forge-mute'}`}>
            {temp}
          </span>
        </div>
        <div className="mt-4">
          <LadderStrip steps={steps} tall />
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="rounded-md border border-forge-border bg-forge-panel p-5">
          <h3 className="font-display text-sm text-forge-ink">Underpainting</h3>
          <dl className="mt-3 space-y-2 text-sm">
            <Row label="Deep Shadow" swatch={ladder.deepShadow} />
            <Row label="Shadow" swatch={ladder.shadow} />
            <Row label="Transition" swatch={ladder.transition} />
          </dl>
        </div>
        <div className="rounded-md border border-forge-border bg-forge-panel p-5">
          <h3 className="font-display text-sm text-forge-ink">Base &amp; Highlights</h3>
          <dl className="mt-3 space-y-2 text-sm">
            <Row label="Base Color" swatch={ladder.base} />
            <Row label="Highlight" swatch={ladder.highlight} />
            <Row label="Extreme Highlight" swatch={ladder.extremeHighlight} />
          </dl>
        </div>
      </section>

      <TemperatureBlock hsl={hsl} />

      <section className="rounded-md border border-forge-border bg-forge-panel2 p-5">
        <h3 className="font-display text-sm text-forge-ink">Why These Colors Work</h3>
        <ul className="mt-3 space-y-2 text-sm text-forge-mute">
          {ladder.explanation.map((line, i) => (
            <li key={i} className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-forge-copper" />
              <span>{line}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}

function Row({ label, swatch }: { label: string; swatch: { hex: string; name: string } }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-forge-mute">{label}</dt>
      <dd className="flex items-center gap-2">
        <span className="font-mono text-xs text-forge-ink">{swatch.name}</span>
        <span className="h-5 w-5 rounded border border-forge-border" style={{ backgroundColor: swatch.hex }} />
        <span className="font-mono text-xs text-forge-mute">{swatch.hex}</span>
      </dd>
    </div>
  )
}
