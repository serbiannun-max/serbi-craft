interface SwatchCardProps {
  hex: string
  label: string
  sublabel?: string
  size?: 'sm' | 'md' | 'lg'
  onClick?: () => void
}

const sizeClasses: Record<string, string> = {
  sm: 'w-12 h-12',
  md: 'w-16 h-16',
  lg: 'w-24 h-24',
}

export default function SwatchCard({ hex, label, sublabel, size = 'md', onClick }: SwatchCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group flex flex-col items-center gap-2 ${onClick ? 'cursor-pointer' : 'cursor-default'}`}
    >
      <div
        className={`${sizeClasses[size]} rounded-md border border-forge-border shadow-inner transition-transform ${onClick ? 'group-hover:scale-105' : ''}`}
        style={{ backgroundColor: hex }}
      />
      <div className="text-center">
        <div className="text-xs font-medium text-forge-ink leading-tight">{label}</div>
        {sublabel && <div className="text-[10px] text-forge-mute leading-tight">{sublabel}</div>}
        <div className="font-mono text-[10px] text-forge-mute">{hex}</div>
      </div>
    </button>
  )
}
