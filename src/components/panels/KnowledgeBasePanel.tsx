import { useMemo, useState } from 'react'
import knowledgeBase from '../../data/knowledgeBase.json'

export default function KnowledgeBasePanel() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')

  const categories = useMemo(() => {
    const set = new Set(knowledgeBase.entries.map((e) => e.category))
    return ['All', ...Array.from(set)]
  }, [])

  const filtered = knowledgeBase.entries.filter((e) => {
    if (category !== 'All' && e.category !== category) return false
    if (!search) return true
    const haystack = `${e.title} ${e.body} ${e.tags.join(' ')}`.toLowerCase()
    return haystack.includes(search.toLowerCase())
  })

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="font-display text-xl text-forge-ink">Knowledge Base</h2>
        <p className="mt-1 max-w-2xl text-sm text-forge-mute">
          The theory behind every recommendation the other modules make, in one searchable place.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search theory notes…"
          className="w-64 rounded border border-forge-border bg-forge-panel2 px-3 py-1.5 text-sm text-forge-ink placeholder:text-forge-mute focus:border-forge-copper"
        />
        <div className="flex flex-wrap gap-1.5">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                category === c
                  ? 'border-forge-copper bg-forge-copper/10 text-forge-ink'
                  : 'border-forge-border text-forge-mute hover:text-forge-ink'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
        <span className="ml-auto text-xs text-forge-mute">{filtered.length} of {knowledgeBase.entries.length}</span>
      </div>

      <div className="flex flex-col gap-4">
        {filtered.map((entry) => (
          <article key={entry.id} className="rounded-md border border-forge-border bg-forge-panel p-5">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-display text-sm text-forge-ink">{entry.title}</h3>
              <span className="rounded-full border border-forge-border px-2 py-0.5 text-[10px] uppercase tracking-wide text-forge-mute">
                {entry.category}
              </span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-forge-mute">{entry.body}</p>
          </article>
        ))}
        {filtered.length === 0 && (
          <p className="text-sm text-forge-mute">No entries match that search. Try a different term or clear the category filter.</p>
        )}
      </div>
    </div>
  )
}
