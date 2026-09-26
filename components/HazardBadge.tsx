import { getHazard } from '@/lib/hazards'
import { cn } from '@/lib/utils'
import type { HazardType } from '@/types'

interface Props {
  type: HazardType | null
  size?: 'sm' | 'md'
}

const SIZE_CLASSES = {
  sm: 'text-xs px-2.5 py-1 gap-1',
  md: 'text-sm px-3.5 py-1.5 gap-1.5',
}

const ICON_SIZES = { sm: 14, md: 18 }

export default function HazardBadge({ type, size = 'md' }: Props) {
  const meta = getHazard(type)
  const Icon = meta.icon

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border bg-slate-800/90 font-semibold',
        SIZE_CLASSES[size],
      )}
      style={{ color: meta.color, borderColor: `${meta.color}66` }}
    >
      <Icon size={ICON_SIZES[size]} strokeWidth={2.5} />
      <span>{meta.label}</span>
    </span>
  )
}
