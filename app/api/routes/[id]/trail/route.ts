import { NextRequest, NextResponse } from 'next/server'
import { getUserId } from '@/lib/auth'
import { query } from '@/lib/snowflake'
import type { RouteTrailPoint, RouteTrailRow } from '@/types'

export const runtime = 'nodejs'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getUserId()
  if (!userId) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const { id } = await params

  const rows = await query<RouteTrailRow>(
    `SELECT ROUTE_ID, LATITUDE, LONGITUDE, SPEED_MPH, SEQUENCE_NUM
     FROM ROUTE_TRAIL
     WHERE ROUTE_ID = ? AND USER_ID = ?
     ORDER BY SEQUENCE_NUM`,
    [id, userId],
  )

  const trail: RouteTrailPoint[] = rows.map((r) => ({
    latitude: r.LATITUDE,
    longitude: r.LONGITUDE,
    speedMph: r.SPEED_MPH,
    sequenceNum: r.SEQUENCE_NUM,
  }))

  return NextResponse.json(trail)
}
