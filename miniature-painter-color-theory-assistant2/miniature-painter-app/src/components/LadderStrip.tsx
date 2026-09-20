interface LadderStep {
  hex: string
  label: string
  sublabel?: string
}

export default function LadderStrip({ steps, tall = false }: { steps: LadderStep[]; tall?: boolean }) {
  return (
    <div className="w-full">
      <div className={`flex w-full overflow-hidden rounded-md border border-forge-border ${tall ? 'h-20' : 'h-12'}`}>
        {steps.map((s, i) => (
          <div key={i} className="flex-1" style={{ backgroundColor: s.hex }} title={`${s.label} — ${s.hex}`} />
        ))}
      </div>
      <div className="mt-2 grid" style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(0,1fr))` }}>
        {steps.map((s, i) => (
          <div key={i} className="text-center px-1">
            <div className="text-[11px] font-medium text-forge-ink leading-tight">{s.label}</div>
            {s.sublabel && <div className="text-[10px] text-forge-mute leading-tight">{s.sublabel}</div>}
            <div className="font-mono text-[10px] text-forge-mute">{s.hex}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
