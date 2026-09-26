import { redirect } from 'next/navigation'
import { getUserId } from '@/lib/auth'
import { query } from '@/lib/snowflake'
import DashboardClient from '@/components/DashboardClient'
import type { User, LeaderboardRow, ExplorerRow } from '@/types'

export const dynamic = 'force-dynamic'

async function getUser(userId: string): Promise<User | null> {
  const [rows, explorerRows] = await Promise.all([
    query<LeaderboardRow>(`SELECT * FROM LEADERBOARD_VIEW WHERE USER_ID = ?`, [userId]),
    query<ExplorerRow>(`SELECT * FROM EXPLORER_LEADERBOARD WHERE USER_ID = ?`, [userId]),
  ])
  if (!rows.length) return null
  const r = rows[0]
  const e = explorerRows[0]
  return {
    userId: r.USER_ID,
    username: r.USERNAME,
    points: r.POINTS,
    medalTier: r.MEDAL_TIER,
    nextTierThreshold: r.NEXT_TIER_THRESHOLD,
    progressPercentage: r.PROGRESS_PERCENTAGE,
    cellsExplored: r.CELLS_EXPLORED,
    zonesExplored: r.ZONES_EXPLORED,
    explorationStreak: r.EXPLORATION_STREAK,
    explorerTitle: r.EXPLORER_TITLE,
    explorerRank: e?.EXPLORER_RANK,
    streakStatus: e?.STREAK_STATUS ?? null,
  }
}

export default async function DashboardPage() {
  const userId = await getUserId()
  if (!userId) redirect('/login')

  const user = await getUser(userId)
  if (!user) redirect('/login')

  return <DashboardClient initialUser={user} />
}
