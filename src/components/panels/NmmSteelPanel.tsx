import nmmSteel from '../../data/nmmSteel.json'
import LadderStrip from '../LadderStrip'

export default function NmmSteelPanel() {
  const steps = nmmSteel.ladder.map((s) => ({ hex: s.hex, label: s.step, sublabel: s.name }))

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="font-display text-xl text-forge-ink">NMM Steel</h2>
        <p className="mt-1 max-w-2xl text-sm text-forge-mute">{nmmSteel.description}</p>
      </div>

      <section className="rounded-md border border-forge-border bg-forge-panel p-5">
        <h3 className="font-display text-sm text-forge-ink">Contrast Ladder</h3>
        <div className="mt-5">
          <LadderStrip steps={steps} tall />
        </div>
      </section>

      <section className="rounded-md border border-forge-border bg-forge-panel2 p-5">
        <h3 className="font-display text-sm text-forge-ink">Painting Guide</h3>
        <ul className="mt-3 space-y-2 text-sm text-forge-mute">
          {nmmSteel.notes.map((n, i) => (
            <li key={i} className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-forge-sage" />
              <span>{n}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
