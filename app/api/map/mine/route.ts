import { NextResponse } from 'next/server'
import { getUserId } from '@/lib/auth'
import { query } from '@/lib/snowflake'
import type { ExplorationHexRow, SubmissionPinRow } from '@/types'

export const runtime = 'nodejs'

export async function GET() {
  const userId = await getUserId()
  if (!userId) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  try {
    const [hexRows, pinRows] = await Promise.all([
      query<ExplorationHexRow>(
        `SELECT HEX_ID, ST_ASGEOJSON(HEX_BOUNDARY) AS HEX_GEOJSON,
                CELL_DANGER_LEVEL, TOTAL_OBSERVATIONS, HAZARDS_IN_CELL,
                MAX_SEVERITY, HAZARD_TYPES_FOUND, FIRST_EXPLORED
         FROM EXPLORATION_MAP
         WHERE USER_ID = ?`,
        [userId],
      ),
      query<SubmissionPinRow>(
        `SELECT SUBMISSION_ID, LATITUDE, LONGITUDE, HAZARD_TYPE, SEVERITY,
                CONFIDENCE, DESCRIPTION, ROAD_TYPE, WEATHER, TIME_OF_DAY,
                POINTS_AWARDED, UPLOADED_AT, H3_CELL_RES8, FILE_NAME
         FROM SUBMISSION_PINS
         WHERE USER_ID = ?
         ORDER BY UPLOADED_AT DESC`,
        [userId],
      ),
    ])

    return NextResponse.json({
      hexes: hexRows.map((r) => ({
        hexId: r.HEX_ID,
        hexGeoJson: r.HEX_GEOJSON,
        cellDangerLevel: r.CELL_DANGER_LEVEL,
        totalObservations: r.TOTAL_OBSERVATIONS,
        hazardsInCell: r.HAZARDS_IN_CELL,
        maxSeverity: r.MAX_SEVERITY,
        hazardTypesFound: r.HAZARD_TYPES_FOUND,
        firstExplored: r.FIRST_EXPLORED,
      })),
      pins: pinRows.map((r) => ({
        submissionId: r.SUBMISSION_ID,
        latitude: r.LATITUDE,
        longitude: r.LONGITUDE,
        hazardType: r.HAZARD_TYPE,
        severity: r.SEVERITY,
        confidence: r.CONFIDENCE,
        description: r.DESCRIPTION,
        roadType: r.ROAD_TYPE,
        weather: r.WEATHER,
        timeOfDay: r.TIME_OF_DAY,
        pointsAwarded: r.POINTS_AWARDED,
        uploadedAt: r.UPLOADED_AT,
        h3CellRes8: r.H3_CELL_RES8,
        fileName: r.FILE_NAME,
      })),
    })
  } catch (err) {
    console.error('[GET /api/map/mine]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
