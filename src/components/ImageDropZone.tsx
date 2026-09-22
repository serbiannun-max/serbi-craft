import { useCallback, useState } from 'react'

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

interface ImageDropZoneProps {
  imageSrc: string | null
  onImageSelected: (dataUrl: string) => void
  onImgLoad?: (img: HTMLImageElement) => void
  onImageClick?: (e: React.MouseEvent<HTMLImageElement>) => void
  height?: string
  placeholder?: string
}

export default function ImageDropZone({
  imageSrc,
  onImageSelected,
  onImgLoad,
  onImageClick,
  height = 'min-h-[220px]',
  placeholder = 'Drag and drop an image here, or click to browse',
}: ImageDropZoneProps) {
  const [dragging, setDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFile = useCallback((file: File) => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError('Please use a JPG, PNG, or WEBP image.')
      return
    }
    setError(null)
    const reader = new FileReader()
    reader.onload = () => onImageSelected(reader.result as string)
    reader.readAsDataURL(file)
  }, [onImageSelected])

  function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }

  return (
    <div>
      <label
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={`flex ${height} cursor-pointer flex-col items-center justify-center gap-3 rounded-md border-2 border-dashed p-6 text-center transition-colors ${
          dragging ? 'border-forge-copper bg-forge-copper/5' : 'border-forge-border bg-forge-panel hover:border-forge-copperDim'
        }`}
      >
        <input type="file" accept={ACCEPTED_TYPES.join(',')} className="hidden" onChange={onInputChange} />
        {imageSrc ? (
          <img
            src={imageSrc}
            onLoad={(e) => onImgLoad?.(e.currentTarget)}
            onClick={(e) => {
              if (onImageClick) {
                e.preventDefault()
                e.stopPropagation()
                onImageClick(e)
              }
            }}
            alt="Uploaded reference"
            className={`max-h-64 rounded-md border border-forge-border object-contain ${onImageClick ? 'cursor-crosshair' : ''}`}
          />
        ) : (
          <>
            <div className="text-sm text-forge-ink">{placeholder}</div>
            <div className="text-xs text-forge-mute">JPG · PNG · WEBP</div>
          </>
        )}
      </label>
      {error && <p className="mt-2 text-xs text-forge-warn">{error}</p>}
    </div>
  )
}
