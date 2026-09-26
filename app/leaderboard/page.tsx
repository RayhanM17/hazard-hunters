import { query } from '@/lib/snowflake'
import { getUserId } from '@/lib/auth'
import LeaderboardRow from '@/components/LeaderboardRow'
import { TIER_ORDER, getTier } from '@/lib/medals'
import type { LeaderboardEntry, LeaderboardRow as LBRow, MedalTier } from '@/types'

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
  }))
}

export default async function LeaderboardPage() {
  const [entries, currentUserId] = await Promise.all([getLeaderboard(), getUserId()])

  const top3 = entries.slice(0, 3)
  const rest = entries.slice(3)

  const grouped = rest.reduce<Record<MedalTier, LeaderboardEntry[]>>((acc, e) => {
    acc[e.medalTier] ??= []
    acc[e.medalTier].push(e)
    return acc
  }, {} as Record<MedalTier, LeaderboardEntry[]>)

  const tierGroups = (Object.entries(grouped) as [MedalTier, LeaderboardEntry[]][]).sort(
    ([a], [b]) => TIER_ORDER[a] - TIER_ORDER[b],
  )

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold text-slate-100">Global Leaderboard</h1>

      <div className="space-y-2">
        {top3.map((entry) => (
          <LeaderboardRow
            key={entry.userId}
            entry={entry}
            isCurrentUser={entry.userId === currentUserId}
            podium
          />
        ))}
      </div>

      {tierGroups.map(([tier, tierEntries]) => {
        const meta = getTier(tier)
        const Icon = meta.icon
        return (
          <section key={tier}>
            <h2 className="mb-2 flex items-center gap-1.5 font-display text-sm font-semibold uppercase tracking-wider text-slate-400">
              <Icon size={14} />
              {tier}
            </h2>
            <div className="space-y-1">
              {tierEntries.map((entry) => (
                <LeaderboardRow
                  key={entry.userId}
                  entry={entry}
                  isCurrentUser={entry.userId === currentUserId}
                />
              ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}
