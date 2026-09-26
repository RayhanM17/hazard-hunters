import { CONFIDENCE_META } from '@/lib/hazards'
import { cn } from '@/lib/utils'
import type { Confidence } from '@/types'

interface Props {
  confidence: Confidence | null
}

export default function ConfidenceBadge({ confidence }: Props) {
  if (!confidence) return null
  const meta = CONFIDENCE_META[confidence]

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium',
        meta.variant === 'solid' && 'border-indigo-500/60 bg-indigo-500/15 text-indigo-300',
        meta.variant === 'outline' && 'border-slate-600 bg-transparent text-slate-300',
        meta.variant === 'dashed' && 'border-dashed border-slate-700 bg-transparent text-slate-500',
      )}
    >
      {meta.label}
    </span>
  )
}
