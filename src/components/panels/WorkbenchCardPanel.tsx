import { useRef, useState } from 'react'
import { HSL, hslToHex } from '../../utils/colorMath'
import { getPaintLadder } from '../../utils/miniatureAdvisor'
import { getUnderpaintingOptions } from '../../utils/miniatureAdvisor'
import { findNearestInRange } from '../../utils/paintCatalog'
import { useSettings } from '../../context/SettingsContext'
import MiniColorWheel from '../MiniColorWheel'

export default function WorkbenchCardPanel({ hsl }: { hsl: HSL }) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [exporting, setExporting] = useState(false)
  const [exportError, setExportError] = useState<string | null>(null)

  const hex = hslToHex(hsl)
  const ladder = getPaintLadder(hex)
  const underpainting = getUnderpaintingOptions(hex)
  const { preferredRange } = useSettings()

  const ladderSteps: { hex: string; label: string }[] = [
    { hex: ladder.deepShadow.hex, label: 'Deep Shadow' },
    { hex: ladder.shadow.hex, label: 'Shadow' },
    { hex: ladder.transition.hex, label: 'Transition' },
    { hex: ladder.base.hex, label: 'Base' },
    { hex: ladder.highlight.hex, label: 'Highlight' },
    { hex: ladder.extremeHighlight.hex, label: 'Extreme Highlight' },
  ]

  const paintNames = ladderSteps.map((s) => findNearestInRange(s.hex, preferredRange, 1)[0]?.paint.name ?? '—')

  async function downloadPdf() {
    if (!cardRef.current) return
    setExporting(true)
    setExportError(null)
    try {
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
        import('html2canvas'),
        import('jspdf'),
      ])
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
      })
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      const imgWidth = pageWidth
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      // If the card is taller than one A4 page at full width, scale it down
      // to fit a single page rather than cropping — this card is meant to
      // be one glance-able reference sheet, not a multi-page document.
      if (imgHeight > pageHeight) {
        const scaledWidth = (canvas.width * pageHeight) / canvas.height
        const xOffset = (pageWidth - scaledWidth) / 2
        pdf.addImage(imgData, 'PNG', xOffset, 0, scaledWidth, pageHeight)
      } else {
        const yOffset = (pageHeight - imgHeight) / 2
        pdf.addImage(imgData, 'PNG', 0, yOffset, imgWidth, imgHeight)
      }
      pdf.save(`workbench-card-${hex.replace('#', '')}.pdf`)
    } catch (err) {
      setExportError('PDF export failed. Your browser/webview may be blocking canvas export — try Print instead.')
      console.error(err)
    } finally {
      setExporting(false)
    }
  }

  async function downloadPng() {
    if (!cardRef.current) return
    setExporting(true)
    setExportError(null)
    try {
      const { default: html2canvas } = await import('html2canvas')
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
      })
      const link = document.createElement('a')
      link.download = `workbench-card-${hex.replace('#', '')}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    } catch (err) {
      setExportError('PNG export failed. Your browser/webview may be blocking canvas export — try Print instead.')
      console.error(err)
    } finally {
      setExporting(false)
    }
  }

  function printCard() {
    window.print()
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-start justify-between gap-4 print:hidden">
        <div>
          <h2 className="font-display text-xl text-forge-ink">Workbench Card</h2>
          <p className="mt-1 max-w-2xl text-sm text-forge-mute">
            A one-page A4 reference card for <span className="font-mono text-forge-ink">{hex}</span> — pin it next to your palette. Print it, or download it as a PDF.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={printCard}
            className="rounded-md border border-forge-border bg-forge-panel px-4 py-2 text-sm text-forge-ink hover:border-forge-copperDim"
          >
            Print
          </button>
          <button
            onClick={downloadPng}
            disabled={exporting}
            className="rounded-md border border-forge-border bg-forge-panel px-4 py-2 text-sm text-forge-ink hover:border-forge-copperDim disabled:opacity-60"
          >
            {exporting ? '…' : 'Download PNG'}
          </button>
          <button
            onClick={downloadPdf}
            disabled={exporting}
            className="rounded-md bg-forge-copper px-4 py-2 text-sm font-medium text-forge-bg hover:bg-forge-copper/90 disabled:opacity-60"
          >
            {exporting ? 'Preparing PDF…' : 'Download PDF'}
          </button>
        </div>
      </div>

      {exportError && <p className="text-sm text-forge-warn print:hidden">{exportError}</p>}

      {/* Printable card. `id="workbench-card"` + the print stylesheet in
          index.css isolate exactly this element when the user hits Print. */}
      <div className="flex justify-center print:block">
        <div
          id="workbench-card"
          ref={cardRef}
          className="w-[210mm] min-h-[297mm] bg-white p-10 text-neutral-900 shadow-xl print:m-0 print:shadow-none"
          style={{ fontFamily: "'IBM Plex Sans', sans-serif" }}
        >
          <div className="flex items-start justify-between border-b-2 border-neutral-900 pb-4">
            <div>
              <div className="text-2xl font-semibold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                Workbench Reference Card
              </div>
              <div className="text-sm text-neutral-500">Miniature Painter Color Theory Assistant</div>
            </div>
            <MiniColorWheel hue={hsl.h} size={90} />
          </div>

          <div className="mt-6 flex items-center gap-5">
            <div className="h-24 w-24 shrink-0 rounded-md border border-neutral-300" style={{ backgroundColor: hex }} />
            <div>
              <div className="text-xs uppercase tracking-wide text-neutral-500">Base Color</div>
              <div className="font-mono text-2xl">{hex}</div>
              <div className="text-sm text-neutral-500">{ladder.base.name}</div>
            </div>
          </div>

          <div className="mt-8">
            <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">
              Paint Layers — Darkest to Brightest
            </div>
            <div className="flex h-14 w-full overflow-hidden rounded border border-neutral-300">
              {ladderSteps.map((s, i) => (
                <div key={i} className="flex-1" style={{ backgroundColor: s.hex }} />
              ))}
            </div>
            <div className="mt-1 grid grid-cols-6">
              {ladderSteps.map((s, i) => (
                <div key={i} className="text-center text-[10px] leading-tight text-neutral-600">
                  <div>{s.label}</div>
                  <div className="font-mono text-neutral-400">{s.hex}</div>
                </div>
              ))}
            </div>
            <div className="mt-2 grid grid-cols-6 border-t border-neutral-200 pt-2">
              {paintNames.map((name, i) => (
                <div key={i} className="truncate px-0.5 text-center text-[9px] leading-tight text-neutral-500" title={name}>
                  {name}
                </div>
              ))}
            </div>
            <div className="mt-1 text-center text-[9px] uppercase tracking-wide text-neutral-400">
              Paint names — {preferredRange}
            </div>
          </div>

          <div className="mt-8 grid grid-cols-3 gap-4">
            <CardSwatch label="Best Underpainting" hex={underpainting.best.hex} name={underpainting.best.name} />
            <CardSwatch label="Good Underpainting" hex={underpainting.good.hex} name={underpainting.good.name} />
            <CardSwatch label="Experimental" hex={underpainting.experimental.hex} name={underpainting.experimental.name} />
          </div>

          <div className="mt-8 rounded border border-neutral-200 bg-neutral-50 p-4 text-xs leading-relaxed text-neutral-600">
            {ladder.explanation[0]}
          </div>

          <div className="mt-10 flex justify-between text-[10px] text-neutral-400">
            <span>Generated locally — colors are computed, not scanned from physical paint.</span>
            <span>{new Date().toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function CardSwatch({ label, hex, name }: { label: string; hex: string; name: string }) {
  return (
    <div className="rounded border border-neutral-200 p-3">
      <div className="text-[10px] uppercase tracking-wide text-neutral-500">{label}</div>
      <div className="mt-2 flex items-center gap-2">
        <div className="h-8 w-8 rounded border border-neutral-300" style={{ backgroundColor: hex }} />
        <div>
          <div className="text-xs text-neutral-800">{name}</div>
          <div className="font-mono text-[10px] text-neutral-400">{hex}</div>
        </div>
      </div>
    </div>
  )
}
