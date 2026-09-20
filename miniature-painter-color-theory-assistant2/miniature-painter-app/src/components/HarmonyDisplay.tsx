import { HSL, analogous, complementary, hslToHex, splitComplementary, triadic } from '../utils/colorMath'
import SwatchCard from './SwatchCard'

export default function HarmonyDisplay({ hsl, onPick }: { hsl: HSL; onPick: (hsl: HSL) => void }) {
  const comp = complementary(hsl)
  const [an1, an2] = analogous(hsl)
  const [sc1, sc2] = splitComplementary(hsl)
  const [tr1, tr2] = triadic(hsl)

  const group = (title: string, swatches: { hsl: HSL; label: string }[]) => (
    <div>
      <h4 className="mb-2 font-display text-sm text-forge-ink">{title}</h4>
      <div className="flex flex-wrap gap-3">
        {swatches.map((s, i) => (
          <SwatchCard key={i} hex={hslToHex(s.hsl)} label={s.label} size="sm" onClick={() => onPick(s.hsl)} />
        ))}
      </div>
    </div>
  )

  return (
    <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
      {group('Complementary', [{ hsl: comp, label: 'Complement' }])}
      {group('Analogous', [{ hsl: an1, label: '-30°' }, { hsl: an2, label: '+30°' }])}
      {group('Split Complementary', [{ hsl: sc1, label: 'Split A' }, { hsl: sc2, label: 'Split B' }])}
      {group('Triadic', [{ hsl: tr1, label: '+120°' }, { hsl: tr2, label: '+240°' }])}
    </div>
  )
}
