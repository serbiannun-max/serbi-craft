import { useEffect, useState } from 'react'
import { HSL, RGB, hexToHsl, hslToHex, hslToRgb, rgbToHsl } from '../utils/colorMath'

interface ColorInputsProps {
  hsl: HSL
  onChange: (hsl: HSL) => void
}

function Field({ label, value, onCommit, width = 'w-16' }: { label: string; value: string; onCommit: (v: string) => void; width?: string }) {
  const [local, setLocal] = useState(value)
  useEffect(() => setLocal(value), [value])
  return (
    <label className="flex items-center gap-1.5 text-xs text-forge-mute">
      <span className="w-5">{label}</span>
      <input
        value={local}
        onChange={(e) => setLocal(e.target.value)}
        onBlur={() => onCommit(local)}
        onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur() }}
        className={`${width} rounded border border-forge-border bg-forge-panel2 px-2 py-1 font-mono text-forge-ink focus:border-forge-copper`}
      />
    </label>
  )
}

export default function ColorInputs({ hsl, onChange }: ColorInputsProps) {
  const hex = hslToHex(hsl)
  const rgb = hslToRgb(hsl)

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <span className="w-10 text-xs text-forge-mute">HEX</span>
        <input
          value={hex}
          onChange={(e) => {
            const v = e.target.value
            if (/^#?[0-9a-fA-F]{6}$/.test(v)) onChange(hexToHsl(v))
          }}
          className="w-28 rounded border border-forge-border bg-forge-panel2 px-2 py-1 font-mono text-sm text-forge-ink focus:border-forge-copper"
        />
      </div>
      <div className="flex items-center gap-2">
        <span className="w-10 text-xs text-forge-mute">RGB</span>
        <Field label="R" value={String(Math.round(rgb.r))} onCommit={(v) => {
          const n = clampNum(v); onChange(rgbToHsl({ ...rgb, r: n }))
        }} />
        <Field label="G" value={String(Math.round(rgb.g))} onCommit={(v) => {
          const n = clampNum(v); onChange(rgbToHsl({ ...rgb, g: n }))
        }} />
        <Field label="B" value={String(Math.round(rgb.b))} onCommit={(v) => {
          const n = clampNum(v); onChange(rgbToHsl({ ...rgb, b: n }))
        }} />
      </div>
      <div className="flex items-center gap-2">
        <span className="w-10 text-xs text-forge-mute">HSL</span>
        <Field label="H" value={String(Math.round(hsl.h))} onCommit={(v) => onChange({ ...hsl, h: clampNum(v, 360) })} />
        <Field label="S" value={String(Math.round(hsl.s))} onCommit={(v) => onChange({ ...hsl, s: clampNum(v, 100) })} />
        <Field label="L" value={String(Math.round(hsl.l))} onCommit={(v) => onChange({ ...hsl, l: clampNum(v, 100) })} />
      </div>
    </div>
  )
}

function clampNum(v: string, max = 255): number {
  const n = parseInt(v, 10)
  if (Number.isNaN(n)) return 0
  return Math.min(max, Math.max(0, n))
}
