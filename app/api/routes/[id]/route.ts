import { NextRequest, NextResponse } from 'next/server'
import { getUserId } from '@/lib/auth'
import { query } from '@/lib/snowflake'
import type { RouteSummary, RouteSummaryRow } from '@/types'

export const runtime = 'nodejs'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getUserId()
  if (!userId) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const { id } = await params

  const rows = await query<RouteSummaryRow>(
    `SELECT * FROM ROUTE_SUMMARY WHERE ROUTE_ID = ? AND USER_ID = ?`,
    [id, userId],
  )
  const r = rows[0]
  if (!r) {
    return NextResponse.json({ error: 'Route not found' }, { status: 404 })
  }

  const summary: RouteSummary = {
    routeId: r.ROUTE_ID,
    username: r.USERNAME,
    videoFileName: r.VIDEO_FILE_NAME,
    startLat: r.START_LAT,
    startLng: r.START_LNG,
    endLat: r.END_LAT,
    endLng: r.END_LNG,
    durationSeconds: r.DURATION_SECONDS,
    distanceMeters: r.DISTANCE_METERS,
    totalWaypoints: r.TOTAL_WAYPOINTS,
    totalKeyframes: r.TOTAL_KEYFRAMES,
    cellsRevealed: r.CELLS_REVEALED,
    status: r.STATUS,
    uploadedAt: r.UPLOADED_AT,
    processedAt: r.PROCESSED_AT,
    keyframesProcessed: r.KEYFRAMES_PROCESSED,
    hazardsDetected: r.HAZARDS_DETECTED,
    maxSeverity: r.MAX_SEVERITY,
    hazardTypesFound: r.HAZARD_TYPES_FOUND,
    keyframePoints: r.KEYFRAME_POINTS,
  }

  return NextResponse.json(summary)
}
