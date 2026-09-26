export type MedalTier =
  | 'Scout'
  | 'Pathfinder'
  | 'Trailblazer'
  | 'Road Warrior'
  | 'Apex Driver'

export type HazardType =
  | 'POTHOLE'
  | 'CRACK'
  | 'FADED_LINE'
  | 'CONSTRUCTION'
  | 'DEBRIS'
  | 'FLOODING'
  | 'DAMAGED_SIGN'
  | 'MISSING_GUARDRAIL'
  | 'ANIMAL'
  | 'UNEVEN_SURFACE'
  | 'SLIPPERY_SURFACE'
  | 'SIGNAL_MALFUNCTION'
  | 'STALLED_VEHICLE'
  | 'NONE'

export type Confidence = 'HIGH' | 'MEDIUM' | 'LOW'

export type Severity = 1 | 2 | 3 | 4 | 5

export type RoadType = 'HIGHWAY' | 'ARTERIAL' | 'RESIDENTIAL' | 'RURAL' | 'PARKING_LOT' | 'UNKNOWN'

export type Weather = 'CLEAR' | 'RAINY' | 'SNOWY' | 'FOGGY' | 'OVERCAST' | 'NIGHT' | 'UNKNOWN'

export type TimeOfDay = 'DAWN' | 'DAYTIME' | 'DUSK' | 'NIGHT' | 'UNKNOWN'

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
  confidence: Confidence | null
  severity: Severity | null
  roadType: RoadType | null
  weather: Weather | null
  timeOfDay: TimeOfDay | null
  description: string | null
  pointsAwarded: number
  fileName?: string
  uploadedAt?: string
}

/** A submission joined with its owner's username, for the history feed. */
export interface SubmissionRecord extends Submission {
  username: string
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

/** Raw row shape returned from SUBMISSIONS (joined with USERS for USERNAME) */
export interface SubmissionRow {
  SUBMISSION_ID: string
  FILE_NAME: string
  HAZARD_TYPE: HazardType | null
  CONFIDENCE: Confidence | null
  SEVERITY: Severity | null
  ROAD_TYPE: RoadType | null
  WEATHER: Weather | null
  TIME_OF_DAY: TimeOfDay | null
  DESCRIPTION: string | null
  POINTS_AWARDED: number
  STATUS: SubmissionStatus
  UPLOADED_AT: string
  USERNAME?: string
}
