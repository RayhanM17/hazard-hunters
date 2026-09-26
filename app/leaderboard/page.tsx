import { query } from '@/lib/snowflake'
import { getUserId } from '@/lib/auth'
import LeaderboardTabs from '@/components/LeaderboardTabs'
import type { LeaderboardEntry, LeaderboardRow as LBRow } from '@/types'

export const revalidate = 30

async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  const rows = await query<LBRow & { RANK: number }>(
    `SELECT *, RANK() OVER (ORDER BY POINTS DESC) AS RANK
     FROM LEADERBOARD_VIEW
     ORDER BY POINTS DESC
     LIMIT 100`,
  )
  return rows.map((r) => ({
    rank: r.RANK,
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
  }))
}

export default async function LeaderboardPage() {
  const [entries, currentUserId] = await Promise.all([getLeaderboard(), getUserId()])

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold text-slate-100">Global Leaderboard</h1>
      <LeaderboardTabs entries={entries} currentUserId={currentUserId} />
    </div>
  )
}
