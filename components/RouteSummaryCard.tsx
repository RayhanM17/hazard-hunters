import Link from 'next/link'
import { MapPinned, Clock, Route as RouteIcon, TriangleAlert } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import HazardBadge from './HazardBadge'
import PointCounter from './PointCounter'
import type { HazardType, RouteSummary } from '@/types'

interface Props {
  summary: RouteSummary
}

function formatDuration(seconds: number | null): string {
  if (seconds === null) return '—'
  const m = Math.floor(seconds / 60)
  const s = Math.round(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

function formatDistance(meters: number | null): string {
  if (meters === null) return '—'
  return `${(meters / 1609.34).toFixed(1)} mi`
}

export default function RouteSummaryCard({ summary }: Props) {
  const hazardTypes = (summary.hazardTypesFound ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean) as HazardType[]

  return (
    <Card>
      <CardContent className="space-y-4 pt-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="font-display text-lg font-semibold text-slate-100">Route processed</h3>
            <p className="text-sm text-slate-400">{summary.videoFileName}</p>
          </div>
          <p className="shrink-0 text-2xl font-bold text-emerald-400">
            +<PointCounter value={summary.keyframePoints} /> pts
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
          <div className="flex items-center gap-1.5 text-slate-400">
            <Clock size={14} /> {formatDuration(summary.durationSeconds)}
          </div>
          <div className="flex items-center gap-1.5 text-slate-400">
            <RouteIcon size={14} /> {formatDistance(summary.distanceMeters)}
          </div>
          <div className="flex items-center gap-1.5 text-slate-400">
            <MapPinned size={14} /> {summary.cellsRevealed} cell{summary.cellsRevealed === 1 ? '' : 's'}
          </div>
          <div className="flex items-center gap-1.5 text-slate-400">
            <TriangleAlert size={14} /> {summary.hazardsDetected} hazard{summary.hazardsDetected === 1 ? '' : 's'}
          </div>
        </div>

        {hazardTypes.length > 0 && (
          <div className="flex flex-wrap gap-1.5 border-t border-slate-800 pt-3">
            {hazardTypes.map((t) => (
              <HazardBadge key={t} type={t} size="sm" />
            ))}
          </div>
        )}

        <div className="flex items-center justify-between border-t border-slate-800 pt-3 text-xs text-slate-500">
          <span>
            {summary.keyframesProcessed}/{summary.totalKeyframes} keyframes classified
          </span>
          <Link href="/map" className="text-indigo-400 underline underline-offset-2">
            View on map
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
