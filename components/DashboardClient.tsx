'use client'

import { useState, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Image as ImageIcon, Film } from 'lucide-react'
import { cn } from '@/lib/utils'
import MedalBadge from './MedalBadge'
import ProgressBar from './ProgressBar'
import UploadDropzone from './UploadDropzone'
import VideoUploadDropzone from './VideoUploadDropzone'
import PointCounter from './PointCounter'
import TierUpCelebration from './TierUpCelebration'
import ExplorerProfileCard from './ExplorerProfileCard'
import type { User, UploadResult } from '@/types'

type UploadMode = 'photo' | 'video'

const MODES: { key: UploadMode; label: string; icon: typeof ImageIcon }[] = [
  { key: 'photo', label: 'Photo', icon: ImageIcon },
  { key: 'video', label: 'Dashcam Video', icon: Film },
]

interface Props {
  initialUser: User
}

export default function DashboardClient({ initialUser }: Props) {
  const [user, setUser] = useState(initialUser)
  const [celebrationTier, setCelebrationTier] = useState<User['medalTier'] | null>(null)
  const [mode, setMode] = useState<UploadMode>('photo')

  const applyUser = useCallback((next: User, tierChanged: boolean) => {
    setUser(next)
    if (tierChanged) setCelebrationTier(next.medalTier)
  }, [])

  const handleResult = useCallback((result: UploadResult) => {
    applyUser(
      {
        userId: result.user.userId ?? initialUser.userId,
        username: initialUser.username,
        points: result.user.points,
        medalTier: result.user.medalTier,
        nextTierThreshold: result.user.nextTierThreshold,
        progressPercentage: result.user.progressPercentage,
        cellsExplored: result.user.cellsExplored,
        zonesExplored: result.user.zonesExplored,
        explorationStreak: result.user.explorationStreak,
        explorerTitle: result.user.explorerTitle,
      },
      result.user.tierChanged,
    )
  }, [applyUser, initialUser.userId, initialUser.username])

  const handleRouteComplete = useCallback(
    (next: User) => {
      applyUser(next, next.medalTier !== user.medalTier)
    },
    [applyUser, user.medalTier],
  )

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

      <ExplorerProfileCard user={user} />

      <div className="inline-flex rounded-full border border-slate-800 bg-slate-900/60 p-1">
        {MODES.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            type="button"
            onClick={() => setMode(key)}
            className={cn(
              'flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors',
              mode === key ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-100',
            )}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      {mode === 'photo' ? (
        <UploadDropzone onResult={handleResult} />
      ) : (
        <VideoUploadDropzone onRouteComplete={handleRouteComplete} />
      )}

      <TierUpCelebration tier={celebrationTier} onClose={() => setCelebrationTier(null)} />
    </div>
  )
}
