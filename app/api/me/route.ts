import { NextResponse } from 'next/server'
import { getUserId } from '@/lib/auth'
import { query } from '@/lib/snowflake'
import type { LeaderboardRow, ExplorerRow } from '@/types'

export const runtime = 'nodejs'

export async function GET() {
  const userId = await getUserId()
  if (!userId) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  try {
    const [rows, explorerRows] = await Promise.all([
      query<LeaderboardRow>(`SELECT * FROM LEADERBOARD_VIEW WHERE USER_ID = ?`, [userId]),
      query<ExplorerRow>(`SELECT * FROM EXPLORER_LEADERBOARD WHERE USER_ID = ?`, [userId]),
    ])

    if (!rows.length) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const r = rows[0]
    const e = explorerRows[0]
    return NextResponse.json({
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
      explorerRank:       e?.EXPLORER_RANK,
      streakStatus:       e?.STREAK_STATUS ?? null,
    })
  } catch (err) {
    console.error('[GET /api/me]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
