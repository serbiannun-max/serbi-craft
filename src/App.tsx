import { useEffect, useState } from 'react'
import { HSL, hexToHsl, hslToHex } from './utils/colorMath'
import { DesktopAppInfo, getDesktopAppInfo } from './utils/tauriBridge'
import ColorWheelPanel from './components/panels/ColorWheelPanel'
import MiniatureAdvisorPanel from './components/panels/MiniatureAdvisorPanel'
import UnderpaintingPanel from './components/panels/UnderpaintingPanel'
import SkinPanel from './components/panels/SkinPanel'
import NmmGoldPanel from './components/panels/NmmGoldPanel'
import PaintBrandsPanel from './components/panels/PaintBrandsPanel'
import CollectionManagerPanel from './components/panels/CollectionManagerPanel'
import ComingSoonPanel from './components/panels/ComingSoonPanel'

type ModuleId =
  | 'wheel' | 'advisor' | 'underpainting' | 'skin' | 'nmmGold'
  | 'nmmSteel' | 'analyzer' | 'brands' | 'collection' | 'workbench' | 'knowledge'

interface NavItem {
  id: ModuleId
  label: string
  phase: 1 | 2
}

const NAV: NavItem[] = [
  { id: 'wheel', label: 'Color Wheel', phase: 1 },
  { id: 'advisor', label: 'Miniature Advisor', phase: 1 },
  { id: 'underpainting', label: 'Underpainting', phase: 1 },
  { id: 'skin', label: 'Skin Tones', phase: 2 },
  { id: 'nmmGold', label: 'NMM Gold', phase: 1 },
  { id: 'nmmSteel', label: 'NMM Steel', phase: 2 },
  { id: 'analyzer', label: 'Paint Analyzer', phase: 2 },
  { id: 'brands', label: 'Paint Brands', phase: 1 },
  { id: 'collection', label: 'Collection Manager', phase: 1 },
  { id: 'workbench', label: 'Workbench Card', phase: 2 },
  { id: 'knowledge', label: 'Knowledge Base', phase: 2 },
]

export default function App() {
  const [hsl, setHsl] = useState<HSL>(hexToHsl('#D9B01E')) // start on a warm yellow
  const [active, setActive] = useState<ModuleId>('wheel')
  const [desktopInfo, setDesktopInfo] = useState<DesktopAppInfo | null>(null)

  useEffect(() => {
    getDesktopAppInfo().then(setDesktopInfo)
  }, [])

  function renderPanel() {
    switch (active) {
      case 'wheel': return <ColorWheelPanel hsl={hsl} onChange={setHsl} />
      case 'advisor': return <MiniatureAdvisorPanel hsl={hsl} />
      case 'underpainting': return <UnderpaintingPanel hsl={hsl} />
      case 'skin': return <SkinPanel />
      case 'nmmGold': return <NmmGoldPanel />
      case 'brands': return <PaintBrandsPanel hsl={hsl} />
      case 'collection': return <CollectionManagerPanel />
      case 'nmmSteel':
        return (
          <ComingSoonPanel
            title="NMM Steel"
            description="A non-metallic-metal ladder for steel and silver: deep blue shadow through neutral grey midtones to a hard specular white, the cool-metal counterpart to NMM Gold."
            bullets={[
              'Deep Blue → Blue Grey → Neutral Grey → Light Grey → White → Reflection White ladder',
              'Contrast ladder visualization matching the NMM Gold strip format',
              'Painting-order guide tuned for steel\'s sharper, cooler value jumps',
            ]}
          />
        )
      case 'analyzer':
        return (
          <ComingSoonPanel
            title="Paint Analyzer"
            description="Upload a box-art or reference photo and extract a working palette from it to drive the advisor, underpainting, and paint-brand modules."
            bullets={[
              'Drag-and-drop upload for JPG, PNG, and WEBP',
              'On-device color extraction — the image never leaves your machine',
              'One-click hand-off of an extracted swatch into the Color Wheel',
            ]}
          />
        )
      case 'workbench':
        return (
          <ComingSoonPanel
            title="Workbench Card"
            description="A printable A4 reference card: current color, underpainting advice, shadows, highlights, and a mini color wheel, ready in one click."
            bullets={[
              'A4-formatted layout built for print',
              'Pulls live from whatever color is currently selected',
              'One-click print / save-as-PDF',
            ]}
          />
        )
      case 'knowledge':
        return (
          <ComingSoonPanel
            title="Knowledge Base"
            description="The theory behind every recommendation in one place: why NMM works, how underpainting shortens blending time, and how to read box art for a scheme."
            bullets={[
              'Short, illustrated write-ups linked from each module\'s "why this works" sections',
              'A glossary of miniature-painting color terms',
              'Searchable across all modules',
            ]}
          />
        )
    }
  }

  return (
    <div className="flex min-h-screen bg-forge-bg text-forge-ink">
      <aside className="flex w-60 shrink-0 flex-col border-r border-forge-border bg-forge-panel">
        <div className="border-b border-forge-border px-5 py-5">
          <div className="font-display text-sm font-semibold leading-tight text-forge-ink">
            Miniature Painter
          </div>
          <div className="font-display text-xs leading-tight text-forge-copper">
            Color Theory Assistant
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <NavGroup title="Phase 1 — MVP" items={NAV.filter((n) => n.phase === 1)} active={active} onSelect={setActive} />
          <NavGroup title="Phase 2 — Next" items={NAV.filter((n) => n.phase === 2)} active={active} onSelect={setActive} />
        </nav>

        <div className="border-t border-forge-border px-5 py-4">
          <div className="flex items-center gap-2">
            <span className="h-6 w-6 rounded border border-forge-border" style={{ backgroundColor: hslToHex(hsl) }} />
            <span className="font-mono text-xs text-forge-mute">{hslToHex(hsl)}</span>
          </div>
          <p className="mt-2 text-[10px] leading-relaxed text-forge-mute">
            Runs entirely offline. Nothing is uploaded — presets and matches are read from local JSON.
          </p>
          {desktopInfo && (
            <p className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-forge-border bg-forge-panel2 px-2 py-1 text-[10px] text-forge-sage">
              <span className="h-1.5 w-1.5 rounded-full bg-forge-sage" />
              Desktop build · Tauri {desktopInfo.tauriVersion}
            </p>
          )}
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-5xl px-8 py-10">
          {renderPanel()}
        </div>
      </main>
    </div>
  )
}

function NavGroup({ title, items, active, onSelect }: { title: string; items: NavItem[]; active: ModuleId; onSelect: (id: ModuleId) => void }) {
  return (
    <div className="mb-5">
      <div className="mb-2 px-2 text-[10px] uppercase tracking-wide text-forge-mute">{title}</div>
      <div className="flex flex-col gap-0.5">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => onSelect(item.id)}
            className={`rounded-md px-3 py-2 text-left text-sm transition-colors ${
              active === item.id
                ? 'bg-forge-copper/15 text-forge-ink border-l-2 border-forge-copper'
                : 'text-forge-mute hover:bg-forge-panel2 hover:text-forge-ink border-l-2 border-transparent'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  )
}
