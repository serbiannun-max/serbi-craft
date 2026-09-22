import { hslToHex } from '../utils/colorMath'

// Pure SVG, solid fills only (no CSS gradients) — deliberately avoids
// conic-gradient, which html2canvas renders unreliably. Used on the
// printable/exportable Workbench Card.
export default function MiniColorWheel({ hue, size = 120, ringColor = '#1C1916' }: { hue: number; size?: number; ringColor?: string }) {
  const segments = 24
  const cx = size / 2
  const cy = size / 2
  const r = size / 2 - 2

  const slices = []
  for (let i = 0; i < segments; i++) {
    const a0 = (i / segments) * 2 * Math.PI - Math.PI / 2
    const a1 = ((i + 1) / segments) * 2 * Math.PI - Math.PI / 2
    const x0 = cx + r * Math.cos(a0)
    const y0 = cy + r * Math.sin(a0)
    const x1 = cx + r * Math.cos(a1)
    const y1 = cy + r * Math.sin(a1)
    const midHue = ((i + 0.5) / segments) * 360
    const fill = hslToHex({ h: midHue, s: 75, l: 50 })
    slices.push(<path key={i} d={`M ${cx} ${cy} L ${x0} ${y0} A ${r} ${r} 0 0 1 ${x1} ${y1} Z`} fill={fill} />)
  }

  const markerAngle = (hue / 360) * 2 * Math.PI - Math.PI / 2
  const mr = r * 0.78
  const mx = cx + mr * Math.cos(markerAngle)
  const my = cy + mr * Math.sin(markerAngle)

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {slices}
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={ringColor} strokeWidth={2} />
      <circle cx={mx} cy={my} r={5} fill="#FFFFFF" stroke={ringColor} strokeWidth={2} />
    </svg>
  )
}
