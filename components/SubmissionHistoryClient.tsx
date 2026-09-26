'use client'

import { useMemo, useState } from 'react'
import { ImageOff } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import HazardBadge from './HazardBadge'
import ConfidenceBadge from './ConfidenceBadge'
import SeverityBar from './SeverityBar'
import RoadContextRow, { ROAD_LABELS, WEATHER_LABELS } from './RoadContextRow'
import { HAZARDS } from '@/lib/hazards'
import { cn } from '@/lib/utils'
import type { SubmissionRecord, HazardType, Confidence, Severity, RoadType, Weather } from '@/types'

interface Props {
  submissions: SubmissionRecord[]
}

type Filters = {
  hazardType: HazardType | 'ALL'
  severity: Severity | 'ALL'
  confidence: Confidence | 'ALL'
  roadType: RoadType | 'ALL'
  weather: Weather | 'ALL'
}

const DEFAULT_FILTERS: Filters = {
  hazardType: 'ALL',
  severity: 'ALL',
  confidence: 'ALL',
  roadType: 'ALL',
  weather: 'ALL',
}

const SELECT_CLASSES =
  'rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-sm text-slate-200 focus:border-indigo-500 focus:outline-none'

export default function SubmissionHistoryClient({ submissions }: Props) {
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS)

  const filtered = useMemo(() => {
    return submissions.filter((s) => {
      if (filters.hazardType !== 'ALL' && s.hazardType !== filters.hazardType) return false
      if (filters.severity !== 'ALL' && s.severity !== filters.severity) return false
      if (filters.confidence !== 'ALL' && s.confidence !== filters.confidence) return false
      if (filters.roadType !== 'ALL' && s.roadType !== filters.roadType) return false
      if (filters.weather !== 'ALL' && s.weather !== filters.weather) return false
      return true
    })
  }, [submissions, filters])

  function update<K extends keyof Filters>(key: K, value: Filters[K]) {
    setFilters((f) => ({ ...f, [key]: value }))
  }

  if (submissions.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-12 text-center text-slate-400">
          <ImageOff size={28} />
          <p>No submissions yet — upload your first dashcam photo.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <select
          className={SELECT_CLASSES}
          value={filters.hazardType}
          onChange={(e) => update('hazardType', e.target.value as Filters['hazardType'])}
        >
          <option value="ALL">All hazards</option>
          {(Object.keys(HAZARDS) as HazardType[]).map((type) => (
            <option key={type} value={type}>
              {HAZARDS[type].label}
            </option>
          ))}
        </select>

        <select
          className={SELECT_CLASSES}
          value={filters.severity}
          onChange={(e) =>
            update('severity', e.target.value === 'ALL' ? 'ALL' : (Number(e.target.value) as Severity))
          }
        >
          <option value="ALL">All severities</option>
          {[1, 2, 3, 4, 5].map((level) => (
            <option key={level} value={level}>
              Severity {level}
            </option>
          ))}
        </select>

        <select
          className={SELECT_CLASSES}
          value={filters.confidence}
          onChange={(e) => update('confidence', e.target.value as Filters['confidence'])}
        >
          <option value="ALL">All confidence</option>
          <option value="HIGH">High</option>
          <option value="MEDIUM">Medium</option>
          <option value="LOW">Low</option>
        </select>

        <select
          className={SELECT_CLASSES}
          value={filters.roadType}
          onChange={(e) => update('roadType', e.target.value as Filters['roadType'])}
        >
          <option value="ALL">All road types</option>
          {(Object.keys(ROAD_LABELS) as RoadType[]).map((type) => (
            <option key={type} value={type}>
              {ROAD_LABELS[type]}
            </option>
          ))}
        </select>

        <select
          className={SELECT_CLASSES}
          value={filters.weather}
          onChange={(e) => update('weather', e.target.value as Filters['weather'])}
        >
          <option value="ALL">All weather</option>
          {(Object.keys(WEATHER_LABELS) as Weather[]).map((w) => (
            <option key={w} value={w}>
              {WEATHER_LABELS[w]}
            </option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <p className="py-8 text-center text-sm text-slate-500">No submissions match these filters.</p>
      ) : (
        <div className="space-y-2">
          {filtered.map((s) => (
            <Card key={s.id}>
              <CardContent className="space-y-3 pt-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <HazardBadge type={s.hazardType} size="sm" />
                      <ConfidenceBadge confidence={s.confidence} />
                    </div>
                    {s.description && <p className="max-w-md text-sm text-slate-400">{s.description}</p>}
                  </div>
                  <div className={cn('shrink-0 text-right text-sm font-semibold tabular-nums text-emerald-400')}>
                    +{s.pointsAwarded} pts
                  </div>
                </div>
                {s.hazardType !== 'NONE' && <SeverityBar severity={s.severity} />}
                <RoadContextRow roadType={s.roadType} weather={s.weather} timeOfDay={s.timeOfDay} />
                {s.uploadedAt && (
                  <p className="text-xs text-slate-600">{new Date(s.uploadedAt).toLocaleString()}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
