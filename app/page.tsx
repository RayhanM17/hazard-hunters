import { redirect } from 'next/navigation'
import { getUserId } from '@/lib/auth'
import { query } from '@/lib/snowflake'
import MedalBadge from '@/components/MedalBadge'
import ProgressBar from '@/components/ProgressBar'
import UploadDropzone from '@/components/UploadDropzone'
import type { User, LeaderboardRow } from '@/types'

export const dynamic = 'force-dynamic'

async function getUser(userId: string): Promise<User | null> {
  // TODO: query LEADERBOARD_VIEW for this user's row
  const rows = await query<LeaderboardRow>(
    `SELECT * FROM LEADERBOARD_VIEW WHERE USER_ID = ?`,
    [userId],
  )
  if (!rows.length) return null
  const r = rows[0]
  return {
    userId:             r.USER_ID,
    username:           r.USERNAME,
    points:             r.POINTS,
    medalTier:          r.MEDAL_TIER,
    nextTierThreshold:  r.NEXT_TIER_THRESHOLD,
    progressPercentage: r.PROGRESS_PERCENTAGE,
  }
}

export default async function DashboardPage() {
  const userId = await getUserId()
  if (!userId) redirect('/login')

  const user = await getUser(userId)
  if (!user) redirect('/login')

  return (
    <div className="space-y-6">
      {/* Header card */}
      <div className="rounded-xl border border-gray-800 bg-gray-900 p-6 flex items-center gap-4">
        <MedalBadge tier={user.medalTier} size="lg" />
        <div>
          <h1 className="text-2xl font-bold">{user.username}</h1>
          <p className="text-gray-400">{user.points.toLocaleString()} pts</p>
        </div>
      </div>

      {/* Progress bar */}
      <ProgressBar
        percentage={user.progressPercentage}
        nextThreshold={user.nextTierThreshold}
        tier={user.medalTier}
      />

      {/* Upload + result (client component handles state) */}
      <UploadDropzone />
    </div>
  )
}
