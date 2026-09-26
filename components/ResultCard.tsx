import { CircleSlash, TrafficCone, Construction, Milestone } from 'lucide-react'
import type { UploadResult } from '@/types'
import { Card, CardContent } from '@/components/ui/card'
import MedalBadge from './MedalBadge'
import PointCounter from './PointCounter'

interface Props {
  result: UploadResult
}

const HAZARD_META: Record<string, { label: string; icon: typeof TrafficCone }> = {
  POTHOLE: { label: 'Pothole', icon: TrafficCone },
  FADED_LINE: { label: 'Faded Line', icon: Milestone },
  CONSTRUCTION: { label: 'Construction', icon: Construction },
  NONE: { label: 'No Hazard', icon: CircleSlash },
}

export default function ResultCard({ result }: Props) {
  const { submission, user } = result
  const hazard = submission.hazardType ?? 'NONE'
  const meta = HAZARD_META[hazard] ?? HAZARD_META.NONE
  const Icon = meta.icon
  const earnedPts = hazard !== 'NONE' ? 100 : 0

  return (
    <Card>
      <CardContent className="space-y-4 pt-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div
              className={
                hazard !== 'NONE'
                  ? 'rounded-xl bg-emerald-500/20 p-2 text-emerald-400'
                  : 'rounded-xl bg-slate-800 p-2 text-slate-400'
              }
            >
              <Icon size={22} />
            </div>
            <div>
              <p className="text-xl font-semibold text-slate-100">{meta.label}</p>
              <p className="mt-1 text-sm text-slate-400">
                {hazard === 'NONE'
                  ? 'No hazard detected — no points awarded.'
                  : 'Hazard verified by AI.'}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-emerald-400">
              {earnedPts > 0 ? (
                <>
                  +<PointCounter value={earnedPts} />
                </>
              ) : (
                '±0'
              )}{' '}
              pts
            </p>
            <div className="mt-1 flex justify-end">
              <MedalBadge tier={user.medalTier} size="sm" />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-x-2 border-t border-slate-800 pt-3 text-xs text-slate-500">
          <span>
            Total:{' '}
            <span className="font-medium tabular-nums text-slate-100">
              <PointCounter value={user.points} /> pts
            </span>
          </span>
          <span>·</span>
          <span>
            Progress:{' '}
            <span className="font-medium tabular-nums text-slate-100">
              {user.progressPercentage.toFixed(1)}%
            </span>{' '}
            to {user.nextTierThreshold.toLocaleString()}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
