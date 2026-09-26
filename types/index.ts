export type MedalTier =
  | 'Scout'
  | 'Pathfinder'
  | 'Trailblazer'
  | 'Road Warrior'
  | 'Apex Driver'

export type HazardType = 'POTHOLE' | 'FADED_LINE' | 'CONSTRUCTION' | 'NONE'

export type SubmissionStatus = 'PENDING' | 'PROCESSED'

export interface User {
  userId: string
  username: string
  points: number
  medalTier: MedalTier
  nextTierThreshold: number
  progressPercentage: number
}

export interface Submission {
  id: string
  status: SubmissionStatus
  hazardType: HazardType | null
}

export interface UploadResult {
  submission: Submission
  user: User & { tierChanged: boolean }
}

export interface LeaderboardEntry extends User {
  rank: number
}

/** Raw row shape returned from LEADERBOARD_VIEW */
export interface LeaderboardRow {
  USER_ID: string
  USERNAME: string
  POINTS: number
  MEDAL_TIER: MedalTier
  NEXT_TIER_THRESHOLD: number
  PROGRESS_PERCENTAGE: number
}
