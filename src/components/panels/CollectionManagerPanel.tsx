import { useEffect, useMemo, useState } from 'react'
import { PAINT_RANGES, getAllPaints } from '../../utils/paintCatalog'
import { CustomPaint, loadCustomPaints, loadOwned, saveCustomPaints, saveOwned } from '../../utils/collection'

export default function CollectionManagerPanel() {
  const catalog = useMemo(() => getAllPaints(), [])
  const [owned, setOwned] = useState<Set<string>>(new Set())
  const [custom, setCustom] = useState<CustomPaint[]>([])
  const [search, setSearch] = useState('')
  const [brandFilter, setBrandFilter] = useState<string>('All')
  const [ownedOnly, setOwnedOnly] = useState(false)

  const [newBrand, setNewBrand] = useState<string>(PAINT_RANGES[0])
  const [newName, setNewName] = useState('')
  const [newHex, setNewHex] = useState('#8A6A1E')

  useEffect(() => {
    setOwned(loadOwned())
    setCustom(loadCustomPaints())
  }, [])

  function toggleOwned(id: string) {
    setOwned((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      saveOwned(next)
      return next
    })
  }

  function addCustomPaint() {
    if (!newName.trim()) return
    const paint: CustomPaint = { id: `custom::${Date.now()}`, brand: newBrand, name: newName.trim(), hex: newHex }
    const next = [...custom, paint]
    setCustom(next)
    saveCustomPaints(next)
    setNewName('')
  }

  function removeCustomPaint(id: string) {
    const next = custom.filter((p) => p.id !== id)
    setCustom(next)
    saveCustomPaints(next)
  }

  const filtered = catalog.filter((p) => {
    if (brandFilter !== 'All' && p.manufacturer !== brandFilter) return false
    if (ownedOnly && !owned.has(p.id)) return false
    if (search && !`${p.name} ${p.manufacturer}`.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const ownedCount = owned.size

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="font-display text-xl text-forge-ink">Collection Manager</h2>
        <p className="mt-1 max-w-2xl text-sm text-forge-mute">
          Mark which paints you actually own. Owned paints are highlighted throughout the Paint Brands module so recommendations point at what's on your shelf. Everything here is saved locally in this browser — nothing leaves your machine.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3 rounded-md border border-forge-border bg-forge-panel p-4">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search paints or categories…"
          className="w-56 rounded border border-forge-border bg-forge-panel2 px-3 py-1.5 text-sm text-forge-ink placeholder:text-forge-mute focus:border-forge-copper"
        />
        <select
          value={brandFilter}
          onChange={(e) => setBrandFilter(e.target.value)}
          className="rounded border border-forge-border bg-forge-panel2 px-3 py-1.5 text-sm text-forge-ink focus:border-forge-copper"
        >
          <option>All</option>
          {PAINT_RANGES.map((r) => <option key={r}>{r}</option>)}
        </select>
        <label className="flex items-center gap-2 text-sm text-forge-mute">
          <input type="checkbox" checked={ownedOnly} onChange={(e) => setOwnedOnly(e.target.checked)} className="accent-forge-copper" />
          Owned only
        </label>
        <span className="ml-auto text-xs text-forge-mute">{ownedCount} of {catalog.length} owned</span>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((p) => {
          const isOwned = owned.has(p.id)
          return (
            <button
              key={p.id}
              onClick={() => toggleOwned(p.id)}
              className={`flex items-center gap-3 rounded-md border px-3 py-2 text-left transition-colors ${
                isOwned ? 'border-forge-sage bg-forge-sage/10' : 'border-forge-border bg-forge-panel hover:border-forge-copperDim'
              }`}
            >
              <span className="h-7 w-7 shrink-0 rounded border border-forge-border" style={{ backgroundColor: p.hex }} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm text-forge-ink">{p.name}</span>
                <span className="block truncate text-[10px] text-forge-mute">{p.manufacturer}</span>
              </span>
              <span className={`h-4 w-4 shrink-0 rounded-sm border ${isOwned ? 'border-forge-sage bg-forge-sage' : 'border-forge-border'}`} />
            </button>
          )
        })}
      </div>

      <section className="rounded-md border border-forge-border bg-forge-panel2 p-5">
        <h3 className="font-display text-sm text-forge-ink">Add a Custom Paint</h3>
        <p className="mt-1 text-xs text-forge-mute">Not in the database yet? Add your own so it's tracked here too.</p>
        <div className="mt-4 flex flex-wrap items-end gap-3">
          <label className="flex flex-col gap-1 text-xs text-forge-mute">
            Brand
            <select value={newBrand} onChange={(e) => setNewBrand(e.target.value)} className="rounded border border-forge-border bg-forge-panel px-2 py-1.5 text-sm text-forge-ink">
              {PAINT_RANGES.map((r) => <option key={r}>{r}</option>)}
              <option>Other</option>
            </select>
          </label>
          <label className="flex flex-col gap-1 text-xs text-forge-mute">
            Name
            <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Paint name" className="w-48 rounded border border-forge-border bg-forge-panel px-2 py-1.5 text-sm text-forge-ink" />
          </label>
          <label className="flex flex-col gap-1 text-xs text-forge-mute">
            Hex
            <input value={newHex} onChange={(e) => setNewHex(e.target.value)} className="w-28 rounded border border-forge-border bg-forge-panel px-2 py-1.5 font-mono text-sm text-forge-ink" />
          </label>
          <div className="h-9 w-9 rounded border border-forge-border" style={{ backgroundColor: newHex }} />
          <button onClick={addCustomPaint} className="rounded-md bg-forge-copper px-4 py-1.5 text-sm font-medium text-forge-bg hover:bg-forge-copper/90">
            Add Paint
          </button>
        </div>

        {custom.length > 0 && (
          <div className="mt-5 flex flex-col gap-2">
            {custom.map((p) => (
              <div key={p.id} className="flex items-center justify-between rounded border border-forge-border bg-forge-panel px-3 py-2">
                <div className="flex items-center gap-3">
                  <span className="h-6 w-6 rounded border border-forge-border" style={{ backgroundColor: p.hex }} />
                  <span className="text-sm text-forge-ink">{p.name}</span>
                  <span className="text-xs text-forge-mute">{p.brand}</span>
                </div>
                <button onClick={() => removeCustomPaint(p.id)} className="text-xs text-forge-warn hover:underline">Remove</button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
