import { useCallback, useEffect, useRef, useState } from 'react'
import { HSL, hslToHex, hslToRgb, rgbToHex } from '../utils/colorMath'

interface ColorWheelProps {
  hsl: HSL
  onChange: (hsl: HSL) => void
}

const SIZE = 260
const RADIUS = SIZE / 2

export default function ColorWheel({ hsl, onChange }: ColorWheelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [dragging, setDragging] = useState(false)

  // Draw the wheel (hue = angle, saturation = radius) at the current lightness.
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const img = ctx.createImageData(SIZE, SIZE)
    for (let y = 0; y < SIZE; y++) {
      for (let x = 0; x < SIZE; x++) {
        const dx = x - RADIUS
        const dy = y - RADIUS
        const dist = Math.sqrt(dx * dx + dy * dy)
        const idx = (y * SIZE + x) * 4
        if (dist > RADIUS) {
          img.data[idx + 3] = 0
          continue
        }
        let angle = (Math.atan2(dy, dx) * 180) / Math.PI
        angle = (angle + 360) % 360
        const sat = Math.min(100, (dist / RADIUS) * 100)
        const rgb = hslToRgb({ h: angle, s: sat, l: hsl.l })
        img.data[idx] = rgb.r
        img.data[idx + 1] = rgb.g
        img.data[idx + 2] = rgb.b
        img.data[idx + 3] = 255
      }
    }
    ctx.putImageData(img, 0, 0)
  }, [hsl.l])

  const pickAt = useCallback((clientX: number, clientY: number) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const x = ((clientX - rect.left) / rect.width) * SIZE
    const y = ((clientY - rect.top) / rect.height) * SIZE
    const dx = x - RADIUS
    const dy = y - RADIUS
    const dist = Math.min(RADIUS, Math.sqrt(dx * dx + dy * dy))
    let angle = (Math.atan2(dy, dx) * 180) / Math.PI
    angle = (angle + 360) % 360
    const sat = Math.min(100, (dist / RADIUS) * 100)
    onChange({ h: angle, s: sat, l: hsl.l })
  }, [hsl.l, onChange])

  useEffect(() => {
    if (!dragging) return
    const move = (e: MouseEvent) => pickAt(e.clientX, e.clientY)
    const up = () => setDragging(false)
    window.addEventListener('mousemove', move)
    window.addEventListener('mouseup', up)
    return () => {
      window.removeEventListener('mousemove', move)
      window.removeEventListener('mouseup', up)
    }
  }, [dragging, pickAt])

  const angleRad = (hsl.h * Math.PI) / 180
  const pointerDist = (hsl.s / 100) * RADIUS
  const pointerX = RADIUS + Math.cos(angleRad) * pointerDist
  const pointerY = RADIUS + Math.sin(angleRad) * pointerDist

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative select-none" style={{ width: SIZE, height: SIZE }}>
        <canvas
          ref={canvasRef}
          width={SIZE}
          height={SIZE}
          className="rounded-full border border-forge-border cursor-crosshair"
          onMouseDown={(e) => { setDragging(true); pickAt(e.clientX, e.clientY) }}
        />
        <div
          className="pointer-events-none absolute w-4 h-4 rounded-full border-2 border-white shadow-md -translate-x-1/2 -translate-y-1/2"
          style={{ left: pointerX, top: pointerY, backgroundColor: hslToHex(hsl) }}
        />
      </div>
      <div className="w-full max-w-[260px]">
        <label className="flex items-center justify-between text-xs text-forge-mute mb-1">
          <span>Lightness</span>
          <span className="font-mono">{Math.round(hsl.l)}%</span>
        </label>
        <input
          type="range"
          min={0}
          max={100}
          value={hsl.l}
          onChange={(e) => onChange({ ...hsl, l: Number(e.target.value) })}
          className="w-full accent-forge-copper"
        />
      </div>
    </div>
  )
}
