import { NextResponse } from 'next/server'
import { getUserId } from '@/lib/auth'
import { query } from '@/lib/snowflake'
import type { LeaderboardRow } from '@/types'

export const runtime = 'nodejs'

export async function GET() {
  const userId = await getUserId()
  if (!userId) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  try {
    const rows = await query<LeaderboardRow>(
      `SELECT * FROM LEADERBOARD_VIEW WHERE USER_ID = ?`,
      [userId],
    )

    if (!rows.length) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const r = rows[0]
    return NextResponse.json({
      userId:             r.USER_ID,
      username:           r.USERNAME,
      points:             r.POINTS,
      medalTier:          r.MEDAL_TIER,
      nextTierThreshold:  r.NEXT_TIER_THRESHOLD,
      progressPercentage: r.PROGRESS_PERCENTAGE,
    })
  } catch (err) {
    console.error('[GET /api/me]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
