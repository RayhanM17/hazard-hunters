import { NextResponse } from 'next/server'
import { query } from '@/lib/snowflake'
import type { LeaderboardRow } from '@/types'

export const runtime = 'nodejs'

export async function GET() {
  try {
    const rows = await query<LeaderboardRow & { RANK: number }>(
      `SELECT *, RANK() OVER (ORDER BY POINTS DESC) AS RANK
       FROM LEADERBOARD_VIEW
       ORDER BY POINTS DESC
       LIMIT 100`,
    )

    const entries = rows.map((r) => ({
      rank:               r.RANK,
      userId:             r.USER_ID,
      username:           r.USERNAME,
      points:             r.POINTS,
      medalTier:          r.MEDAL_TIER,
      nextTierThreshold:  r.NEXT_TIER_THRESHOLD,
      progressPercentage: r.PROGRESS_PERCENTAGE,
      cellsExplored:      r.CELLS_EXPLORED,
      zonesExplored:      r.ZONES_EXPLORED,
      explorationStreak:  r.EXPLORATION_STREAK,
      explorerTitle:      r.EXPLORER_TITLE,
    }))

    return NextResponse.json(entries)
  } catch (err) {
    console.error('[GET /api/leaderboard]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
