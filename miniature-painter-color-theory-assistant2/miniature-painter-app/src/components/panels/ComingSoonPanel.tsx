interface ComingSoonProps {
  title: string
  description: string
  bullets: string[]
}

export default function ComingSoonPanel({ title, description, bullets }: ComingSoonProps) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-forge-border bg-forge-panel px-3 py-1 text-[10px] uppercase tracking-wide text-forge-mute">
          Phase 2
        </div>
        <h2 className="font-display text-xl text-forge-ink">{title}</h2>
        <p className="mt-1 max-w-2xl text-sm text-forge-mute">{description}</p>
      </div>
      <div className="rounded-md border border-dashed border-forge-border bg-forge-panel p-6">
        <p className="text-sm text-forge-mute">Planned for the next build pass:</p>
        <ul className="mt-3 space-y-1.5 text-sm text-forge-ink">
          {bullets.map((b, i) => (
            <li key={i} className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-forge-copperDim" />
              <span>{b}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
