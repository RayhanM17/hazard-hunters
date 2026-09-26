import { getTier } from '@/lib/medals'
import { cn } from '@/lib/utils'
import type { MedalTier } from '@/types'

interface Props {
  tier: MedalTier
  size?: 'sm' | 'md' | 'lg'
}

const SIZE_CLASSES = {
  sm: 'text-xs px-2.5 py-1 gap-1',
  md: 'text-sm px-3.5 py-1.5 gap-1.5',
  lg: 'text-base px-5 py-2 gap-2',
}

const ICON_SIZES = { sm: 14, md: 16, lg: 20 }

/**
 * Tonal badge: a fixed dark surface (bg-slate-800) with the tier's solid
 * accent color for the border/icon/text. Keeping text off the gradient
 * fills guarantees contrast regardless of tier — a two-stop gradient
 * behind small text loses contrast wherever it dips dark (see lib/medals.ts).
 */
export default function MedalBadge({ tier, size = 'md' }: Props) {
  const meta = getTier(tier)
  const Icon = meta.icon

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border bg-slate-800/90 font-semibold',
        meta.glow,
        SIZE_CLASSES[size],
      )}
      style={{ color: meta.color, borderColor: `${meta.color}66` }}
    >
      <Icon size={ICON_SIZES[size]} strokeWidth={2.5} />
      <span>{tier}</span>
    </span>
  )
}
