import { HSL, hslToHex } from '../utils/colorMath'
import { getTemperatureReport } from '../utils/miniatureAdvisor'

export default function TemperatureBlock({ hsl }: { hsl: HSL }) {
  const report = getTemperatureReport(hslToHex(hsl))

  return (
    <section className="rounded-md border border-forge-border bg-forge-panel p-5">
      <h3 className="font-display text-sm text-forge-ink">Color Temperature</h3>
      <div className="mt-4 flex flex-col gap-2">
        <div className="flex h-3 w-full overflow-hidden rounded-full border border-forge-border">
          <div className="bg-forge-copper" style={{ width: `${report.warmPercent}%` }} />
          <div className="bg-forge-sage" style={{ width: `${report.coolPercent}%` }} />
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-forge-copper">Warm {report.warmPercent}%</span>
          <span className="text-forge-sage">Cool {report.coolPercent}%</span>
        </div>
      </div>
      <ul className="mt-4 space-y-1.5 text-xs text-forge-mute">
        {report.reasons.map((r, i) => (
          <li key={i} className="flex gap-2">
            <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-forge-border" />
            <span>{r}</span>
          </li>
        ))}
      </ul>
      <p className="mt-3 rounded border border-forge-border bg-forge-panel2 p-3 text-xs text-forge-ink">{report.suggestion}</p>
    </section>
  )
}
