'use client'

import { useState, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import MedalBadge from './MedalBadge'
import ProgressBar from './ProgressBar'
import UploadDropzone from './UploadDropzone'
import PointCounter from './PointCounter'
import TierUpCelebration from './TierUpCelebration'
import type { User, UploadResult } from '@/types'

interface Props {
  initialUser: User
}

export default function DashboardClient({ initialUser }: Props) {
  const [user, setUser] = useState(initialUser)
  const [celebrationTier, setCelebrationTier] = useState<User['medalTier'] | null>(null)

  const handleResult = useCallback((result: UploadResult) => {
    setUser({
      userId: result.user.userId ?? initialUser.userId,
      username: initialUser.username,
      points: result.user.points,
      medalTier: result.user.medalTier,
      nextTierThreshold: result.user.nextTierThreshold,
      progressPercentage: result.user.progressPercentage,
    })
    if (result.user.tierChanged) {
      setCelebrationTier(result.user.medalTier)
    }
  }, [initialUser.userId, initialUser.username])

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="flex items-center gap-4 pt-6">
          <MedalBadge tier={user.medalTier} size="lg" />
          <div>
            <h1 className="font-display text-2xl font-bold text-slate-100">{user.username}</h1>
            <p className="text-slate-400">
              <PointCounter value={user.points} suffix=" pts" />
            </p>
          </div>
        </CardContent>
      </Card>

      <ProgressBar
        percentage={user.progressPercentage}
        nextThreshold={user.nextTierThreshold}
        tier={user.medalTier}
      />

      <UploadDropzone onResult={handleResult} />

      <TierUpCelebration tier={celebrationTier} onClose={() => setCelebrationTier(null)} />
    </div>
  )
}
