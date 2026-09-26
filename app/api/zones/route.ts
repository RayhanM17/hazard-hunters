import { NextResponse } from 'next/server'
import { query } from '@/lib/snowflake'
import type { ZoneRow } from '@/types'

export const runtime = 'nodejs'
export const revalidate = 30

export async function GET() {
  try {
    const rows = await query<ZoneRow>(
      `SELECT ZONE_ID, ST_ASGEOJSON(ZONE_BOUNDARY) AS ZONE_GEOJSON,
              ST_ASGEOJSON(ZONE_CENTER) AS CENTER_GEOJSON,
              ACTIVE_SCOUTS, CELLS_MAPPED, HAZARDS_REPORTED, ZONE_RANK
       FROM ZONE_LEADERBOARD
       ORDER BY ZONE_RANK`,
    )

    const zones = rows.map((r) => ({
      zoneId: r.ZONE_ID,
      zoneGeoJson: r.ZONE_GEOJSON,
      centerGeoJson: r.CENTER_GEOJSON,
      activeScouts: r.ACTIVE_SCOUTS,
      cellsMapped: r.CELLS_MAPPED,
      hazardsReported: r.HAZARDS_REPORTED,
      zoneRank: r.ZONE_RANK,
    }))

    return NextResponse.json(zones)
  } catch (err) {
    console.error('[GET /api/zones]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
