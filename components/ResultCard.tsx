import type { UploadResult } from '@/types'
import { Card, CardContent } from '@/components/ui/card'
import MedalBadge from './MedalBadge'
import PointCounter from './PointCounter'
import HazardBadge from './HazardBadge'
import ConfidenceBadge from './ConfidenceBadge'
import SeverityBar from './SeverityBar'
import RoadContextRow from './RoadContextRow'
import PointsBreakdown from './PointsBreakdown'

interface Props {
  result: UploadResult
}

export default function ResultCard({ result }: Props) {
  const { submission, user } = result
  const hasHazard = submission.hazardType !== null && submission.hazardType !== 'NONE'
  const earnedPts = submission.pointsAwarded

  return (
    <Card>
      <CardContent className="space-y-4 pt-6">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <HazardBadge type={submission.hazardType} />
              <ConfidenceBadge confidence={submission.confidence} />
            </div>
            {submission.description && (
              <p className="max-w-sm text-sm text-slate-400">{submission.description}</p>
            )}
          </div>
          <div className="flex shrink-0 flex-col items-end gap-2">
            <div className="flex items-center gap-1.5">
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
              <PointsBreakdown severity={submission.severity} confidence={submission.confidence} />
            </div>
            <MedalBadge tier={user.medalTier} size="sm" />
          </div>
        </div>

        {hasHazard && <SeverityBar severity={submission.severity} />}

        <RoadContextRow
          roadType={submission.roadType}
          weather={submission.weather}
          timeOfDay={submission.timeOfDay}
        />

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
