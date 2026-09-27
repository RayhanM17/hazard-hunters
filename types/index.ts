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

export type SubmissionStatus = 'PENDING' | 'PROCESSED' | 'FAILED'

export type CellDangerLevel = 'GREEN' | 'YELLOW' | 'ORANGE' | 'RED'

export type ExplorerTitle =
  | 'Stationary'
  | 'Rookie Explorer'
  | 'Wanderer'
  | 'Ranger'
  | 'Voyager'
  | 'Cartographer'

export interface User {
  userId: string
  username: string
  points: number
  medalTier: MedalTier
  nextTierThreshold: number
  progressPercentage: number
  cellsExplored: number
  zonesExplored: number
  explorationStreak: number
  explorerTitle: ExplorerTitle
  /** Only populated where fetched from EXPLORER_LEADERBOARD (e.g. /api/me). */
  explorerRank?: number
  streakStatus?: string | null
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
  latitude: number | null
  longitude: number | null
  h3CellRes8: string | null
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

/** Raw row shape returned from LEADERBOARD_VIEW (post fog-of-war upgrade) */
export interface LeaderboardRow {
  USER_ID: string
  USERNAME: string
  POINTS: number
  MEDAL_TIER: MedalTier
  NEXT_TIER_THRESHOLD: number
  PROGRESS_PERCENTAGE: number
  CELLS_EXPLORED: number
  ZONES_EXPLORED: number
  EXPLORATION_STREAK: number
  TOTAL_SUBMISSIONS: number
  HAZARDS_FOUND: number
  EXPLORER_TITLE: ExplorerTitle
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
  LATITUDE: number | null
  LONGITUDE: number | null
  H3_CELL_RES8: string | null
}

/** Raw row shape returned from EXPLORER_LEADERBOARD */
export interface ExplorerRow {
  USER_ID: string
  USERNAME: string
  POINTS: number
  CELLS_EXPLORED: number
  ZONES_EXPLORED: number
  EXPLORATION_STREAK: number
  EXPLORER_RANK: number
  EXPLORER_TITLE: ExplorerTitle
  STREAK_STATUS: string | null
  LAST_SUBMISSION_DATE: string | null
}

export interface ExplorerEntry {
  userId: string
  username: string
  points: number
  cellsExplored: number
  zonesExplored: number
  explorationStreak: number
  explorerRank: number
  explorerTitle: ExplorerTitle
  streakStatus: string | null
}

/** Raw row shape returned from EXPLORATION_MAP (per-user revealed hex tiles) */
export interface ExplorationHexRow {
  HEX_ID: string
  HEX_GEOJSON: string
  CELL_DANGER_LEVEL: CellDangerLevel
  TOTAL_OBSERVATIONS: number
  HAZARDS_IN_CELL: number
  MAX_SEVERITY: number
  HAZARD_TYPES_FOUND: string | null
  FIRST_EXPLORED: string
}

export interface ExplorationHex {
  hexId: string
  hexGeoJson: string
  cellDangerLevel: CellDangerLevel
  totalObservations: number
  hazardsInCell: number
  maxSeverity: number
  hazardTypesFound: string | null
  firstExplored: string
}

/** Raw row shape returned from HAZARD_HEATMAP (global hazard density) */
export interface HeatmapHexRow {
  HEX_ID: string
  HEX_GEOJSON: string
  CENTER_GEOJSON: string
  TOTAL_HAZARDS: number
  AVG_SEVERITY: number
  UNIQUE_REPORTERS: number
  MAX_SEVERITY: number
}

export interface HeatmapHex {
  hexId: string
  hexGeoJson: string
  centerGeoJson: string
  totalHazards: number
  avgSeverity: number
  uniqueReporters: number
  maxSeverity: number
}

/** Raw row shape returned from ZONE_LEADERBOARD */
export interface ZoneRow {
  ZONE_ID: string
  ZONE_GEOJSON: string
  CENTER_GEOJSON: string
  ACTIVE_SCOUTS: number
  CELLS_MAPPED: number
  HAZARDS_REPORTED: number
  ZONE_RANK: number
}

export interface Zone {
  zoneId: string
  zoneGeoJson: string
  centerGeoJson: string
  activeScouts: number
  cellsMapped: number
  hazardsReported: number
  zoneRank: number
}

/** Raw row shape returned from SUBMISSION_PINS */
export interface SubmissionPinRow {
  SUBMISSION_ID: string
  LATITUDE: number
  LONGITUDE: number
  HAZARD_TYPE: HazardType
  SEVERITY: Severity
  CONFIDENCE: Confidence
  DESCRIPTION: string | null
  ROAD_TYPE: RoadType
  WEATHER: Weather
  TIME_OF_DAY: TimeOfDay
  POINTS_AWARDED: number
  UPLOADED_AT: string
  H3_CELL_RES8: string
  FILE_NAME: string
}

/** A single GPS reading parsed client-side from an SRT or GPX sidecar file. */
export interface Waypoint {
  sequenceNum: number
  latitude: number
  longitude: number
  speedMph: number | null
  heading: number | null
  capturedAt: string | null
  /** Seconds from video start — used to match keyframes to the nearest waypoint. */
  timestampSeconds: number
}

/** A keyframe extracted client-side from the video, ready to upload. */
export interface Keyframe {
  timestampSeconds: number
  blob: Blob
  fileName: string
  latitude: number | null
  longitude: number | null
}

export type RouteStatus = 'PENDING' | 'PROCESSED' | 'FAILED'

/** Raw row shape returned from ROUTE_SUMMARY. */
export interface RouteSummaryRow {
  ROUTE_ID: string
  USER_ID: string
  USERNAME: string
  VIDEO_FILE_NAME: string
  START_LAT: number | null
  START_LNG: number | null
  END_LAT: number | null
  END_LNG: number | null
  DURATION_SECONDS: number | null
  DISTANCE_METERS: number | null
  TOTAL_WAYPOINTS: number
  TOTAL_KEYFRAMES: number
  CELLS_REVEALED: number
  STATUS: RouteStatus
  UPLOADED_AT: string
  PROCESSED_AT: string | null
  KEYFRAMES_PROCESSED: number
  HAZARDS_DETECTED: number
  MAX_SEVERITY: number | null
  HAZARD_TYPES_FOUND: string | null
  KEYFRAME_POINTS: number
}

export interface RouteSummary {
  routeId: string
  username: string
  videoFileName: string
  startLat: number | null
  startLng: number | null
  endLat: number | null
  endLng: number | null
  durationSeconds: number | null
  distanceMeters: number | null
  totalWaypoints: number
  totalKeyframes: number
  cellsRevealed: number
  status: RouteStatus
  uploadedAt: string
  processedAt: string | null
  keyframesProcessed: number
  hazardsDetected: number
  maxSeverity: number | null
  hazardTypesFound: string | null
  keyframePoints: number
}

/** COUNT_IF breakdown of SUBMISSIONS.STATUS for a route's keyframes, used for polling. */
export interface RouteProgress {
  done: number
  pending: number
  failed: number
  total: number
}

/** Raw row shape returned from ROUTE_TRAIL, ordered by SEQUENCE_NUM. */
export interface RouteTrailRow {
  ROUTE_ID: string
  LATITUDE: number
  LONGITUDE: number
  SPEED_MPH: number | null
  SEQUENCE_NUM: number
  ROUTE_STATUS: RouteStatus
}

export interface RouteTrailPoint {
  latitude: number
  longitude: number
  speedMph: number | null
  sequenceNum: number
}

export interface SubmissionPin {
  submissionId: string
  latitude: number
  longitude: number
  hazardType: HazardType
  severity: Severity
  confidence: Confidence
  description: string | null
  roadType: RoadType
  weather: Weather
  timeOfDay: TimeOfDay
  pointsAwarded: number
  uploadedAt: string
  h3CellRes8: string
  fileName: string
}
