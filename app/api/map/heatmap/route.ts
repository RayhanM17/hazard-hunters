import { NextResponse } from 'next/server'
import { query } from '@/lib/snowflake'
import type { HeatmapHexRow } from '@/types'

export const runtime = 'nodejs'
export const revalidate = 30

export async function GET() {
  try {
    const rows = await query<HeatmapHexRow>(
      `SELECT HEX_ID, ST_ASGEOJSON(HEX_BOUNDARY) AS HEX_GEOJSON,
              ST_ASGEOJSON(HEX_CENTER) AS CENTER_GEOJSON,
              TOTAL_HAZARDS, AVG_SEVERITY, UNIQUE_REPORTERS, MAX_SEVERITY
       FROM HAZARD_HEATMAP`,
    )

    const hexes = rows.map((r) => ({
      hexId: r.HEX_ID,
      hexGeoJson: r.HEX_GEOJSON,
      centerGeoJson: r.CENTER_GEOJSON,
      totalHazards: r.TOTAL_HAZARDS,
      avgSeverity: r.AVG_SEVERITY,
      uniqueReporters: r.UNIQUE_REPORTERS,
      maxSeverity: r.MAX_SEVERITY,
    }))

    return NextResponse.json(hexes)
  } catch (err) {
    console.error('[GET /api/map/heatmap]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
