import { HSL, hslToHex } from '../../utils/colorMath'
import { getUnderpaintingOptions } from '../../utils/miniatureAdvisor'
import SwatchCard from '../SwatchCard'

export default function UnderpaintingPanel({ hsl }: { hsl: HSL }) {
  const hex = hslToHex(hsl)
  const opts = getUnderpaintingOptions(hex)

  const cards = [
    { key: 'best', title: 'Best Underpainting', swatch: opts.best, tone: 'border-forge-copper', text: opts.explanation[0] },
    { key: 'good', title: 'Good Underpainting', swatch: opts.good, tone: 'border-forge-sage', text: opts.explanation[1] },
    { key: 'experimental', title: 'Experimental Underpainting', swatch: opts.experimental, tone: 'border-forge-border', text: opts.explanation[2] },
  ]

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="font-display text-xl text-forge-ink">Underpainting System</h2>
        <p className="mt-1 max-w-2xl text-sm text-forge-mute">
          Three underpainting strategies for <span className="font-mono text-forge-ink">{hex}</span>, ranked from safest maximum-contrast choice to a riskier alternative worth testing.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {cards.map((c) => (
          <div key={c.key} className={`rounded-md border-t-2 ${c.tone} border-x border-b border-forge-border bg-forge-panel p-5`}>
            <h3 className="font-display text-sm text-forge-ink">{c.title}</h3>
            <div className="mt-4 flex items-center gap-4">
              <div className="h-16 w-16 shrink-0 rounded-md border border-forge-border" style={{ backgroundColor: c.swatch.hex }} />
              <div>
                <div className="text-sm text-forge-ink">{c.swatch.name}</div>
                <div className="font-mono text-xs text-forge-mute">{c.swatch.hex}</div>
              </div>
            </div>
            <p className="mt-4 text-xs leading-relaxed text-forge-mute">{c.text}</p>
          </div>
        ))}
      </div>

      <div className="rounded-md border border-forge-border bg-forge-panel2 p-5">
        <h3 className="font-display text-sm text-forge-ink">On the base color itself</h3>
        <div className="mt-3">
          <SwatchCard hex={hex} label="Base Color" size="sm" />
        </div>
      </div>
    </div>
  )
}
