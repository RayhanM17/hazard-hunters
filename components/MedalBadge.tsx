import { getTier } from '@/lib/medals'
import type { MedalTier } from '@/types'

interface Props {
  tier: MedalTier
  size?: 'sm' | 'md' | 'lg'
}

export default function MedalBadge({ tier, size = 'md' }: Props) {
  const meta = getTier(tier)

  const sizeClasses = {
    sm: 'text-sm px-2 py-0.5',
    md: 'text-base px-3 py-1',
    lg: 'text-lg px-4 py-1.5',
  }[size]

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-semibold ${sizeClasses}`}
      style={{ backgroundColor: meta?.color + '22', color: meta?.color, border: `1px solid ${meta?.color}` }}
    >
      <span>{meta?.icon}</span>
      <span>{tier}</span>
    </span>
  )
}
