import { NextResponse } from 'next/server'
import { getUserId } from '@/lib/auth'
import { query } from '@/lib/snowflake'
import type { SubmissionRow, SubmissionRecord } from '@/types'

export const runtime = 'nodejs'

export async function GET() {
  const userId = await getUserId()
  if (!userId) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  try {
    const rows = await query<SubmissionRow>(
      `SELECT
           s.SUBMISSION_ID,
           s.FILE_NAME,
           s.HAZARD_TYPE,
           s.CONFIDENCE,
           s.SEVERITY,
           s.ROAD_TYPE,
           s.WEATHER,
           s.TIME_OF_DAY,
           s.DESCRIPTION,
           s.POINTS_AWARDED,
           s.STATUS,
           s.UPLOADED_AT,
           s.LATITUDE,
           s.LONGITUDE,
           s.H3_CELL_RES8,
           u.USERNAME
       FROM SUBMISSIONS s
       JOIN USERS u ON s.USER_ID = u.USER_ID
       WHERE s.USER_ID = ?
       ORDER BY s.UPLOADED_AT DESC
       LIMIT 200`,
      [userId],
    )

    const records: SubmissionRecord[] = rows.map((r) => ({
      id:            r.SUBMISSION_ID,
      status:        r.STATUS,
      hazardType:    r.HAZARD_TYPE,
      confidence:    r.CONFIDENCE,
      severity:      r.SEVERITY,
      roadType:      r.ROAD_TYPE,
      weather:       r.WEATHER,
      timeOfDay:     r.TIME_OF_DAY,
      description:   r.DESCRIPTION,
      pointsAwarded: r.POINTS_AWARDED,
      fileName:      r.FILE_NAME,
      uploadedAt:    r.UPLOADED_AT,
      latitude:      r.LATITUDE,
      longitude:     r.LONGITUDE,
      h3CellRes8:    r.H3_CELL_RES8,
      username:      r.USERNAME ?? '',
    }))

    return NextResponse.json(records)
  } catch (err) {
    console.error('[GET /api/submissions]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
