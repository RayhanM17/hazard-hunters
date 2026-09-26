import { SEVERITY_COLORS } from '@/lib/hazards'
import type { Severity } from '@/types'

interface Props {
  severity: Severity | null
}

const LEVELS: Severity[] = [1, 2, 3, 4, 5]

export default function SeverityBar({ severity }: Props) {
  if (!severity) return null

  return (
    <div className="flex items-center gap-2">
      <div className="flex flex-1 gap-1">
        {LEVELS.map((level) => (
          <div
            key={level}
            className="h-2 flex-1 rounded-full bg-slate-800"
            style={level <= severity ? { backgroundColor: SEVERITY_COLORS[severity] } : undefined}
          />
        ))}
      </div>
      <span className="shrink-0 text-xs font-medium tabular-nums text-slate-400">
        Severity {severity}/5
      </span>
    </div>
  )
}
