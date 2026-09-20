import { HSL, hslToHex } from '../../utils/colorMath'
import ColorWheel from '../ColorWheel'
import ColorInputs from '../ColorInputs'
import HarmonyDisplay from '../HarmonyDisplay'

export default function ColorWheelPanel({ hsl, onChange }: { hsl: HSL; onChange: (h: HSL) => void }) {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="font-display text-xl text-forge-ink">Color Wheel</h2>
        <p className="mt-1 max-w-2xl text-sm text-forge-mute">
          Click or drag on the wheel to choose a hue and saturation, adjust lightness with the slider below it, or type exact values on the right.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[auto_1fr]">
        <ColorWheel hsl={hsl} onChange={onChange} />

        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-4 rounded-md border border-forge-border bg-forge-panel p-4">
            <div className="h-16 w-16 shrink-0 rounded-md border border-forge-border" style={{ backgroundColor: hslToHex(hsl) }} />
            <div>
              <div className="text-xs uppercase tracking-wide text-forge-mute">Selected Color</div>
              <div className="font-mono text-lg text-forge-ink">{hslToHex(hsl)}</div>
            </div>
          </div>
          <ColorInputs hsl={hsl} onChange={onChange} />
        </div>
      </div>

      <div className="border-t border-forge-border pt-6">
        <HarmonyDisplay hsl={hsl} onPick={onChange} />
      </div>
    </div>
  )
}
