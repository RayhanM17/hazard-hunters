import type { Waypoint } from '@/types'

/** "00:00:01,000" -> 1 (seconds, fractional). Also accepts a "." ms separator. */
function srtTimeToSeconds(raw: string): number {
  const m = raw.trim().match(/^(\d+):(\d+):(\d+)[,.](\d+)$/)
  if (!m) return 0
  const [, h, min, s, ms] = m
  return Number(h) * 3600 + Number(min) * 60 + Number(s) + Number(ms) / 1000
}

const SRT_BLOCK_RE = /(\d+)\s*\r?\n(\d{2}:\d{2}:\d{2}[,.]\d+)\s*-->\s*(\d{2}:\d{2}:\d{2}[,.]\d+)\s*\r?\n([\s\S]*?)(?=\r?\n\r?\n|\r?\n*$)/g
const GPS_RE = /GPS\s*\(([-\d.]+),\s*([-\d.]+),\s*([-\d.]+)\)/
const SPEED_RE = /([\d.]+)\s*km\/h/i

/**
 * Parses the GPS subtitle track most dashcams (Viofo, 70mai, etc.) embed as an SRT sidecar —
 * spec §3a. Each block's timestamp becomes `timestampSeconds`; only blocks with a GPS reading
 * become waypoints, numbered by their order in the file.
 */
export function parseSrt(text: string): Waypoint[] {
  const waypoints: Waypoint[] = []
  let sequenceNum = 0

  for (const match of text.matchAll(SRT_BLOCK_RE)) {
    const [, , startTime, , body] = match
    const gps = body.match(GPS_RE)
    if (!gps) continue

    const [, latRaw, lngRaw] = gps
    const latitude = Number(latRaw)
    const longitude = Number(lngRaw)
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) continue

    const speedMatch = body.match(SPEED_RE)
    const speedMph = speedMatch ? Number(speedMatch[1]) * 0.621371 : null

    sequenceNum += 1
    waypoints.push({
      sequenceNum,
      latitude,
      longitude,
      speedMph,
      heading: null,
      capturedAt: null,
      timestampSeconds: srtTimeToSeconds(startTime),
    })
  }

  return waypoints
}

/**
 * Parses a Garmin-style GPX sidecar (spec §3a): <trkpt lat="..." lon="..."><time>...</time>
 * <speed>...</speed></trkpt>. `timestampSeconds` is relative to the first trackpoint's <time>.
 */
export function parseGpx(text: string): Waypoint[] {
  const doc = new DOMParser().parseFromString(text, 'application/xml')
  const points = Array.from(doc.getElementsByTagName('trkpt'))

  const waypoints: Waypoint[] = []
  let startMs: number | null = null
  let sequenceNum = 0

  for (const pt of points) {
    const latRaw = pt.getAttribute('lat')
    const lngRaw = pt.getAttribute('lon')
    if (!latRaw || !lngRaw) continue
    const latitude = Number(latRaw)
    const longitude = Number(lngRaw)
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) continue

    const timeEl = pt.getElementsByTagName('time')[0]
    const capturedAt = timeEl?.textContent?.trim() || null
    const ms = capturedAt ? Date.parse(capturedAt) : NaN
    if (Number.isFinite(ms)) {
      if (startMs === null) startMs = ms
    }

    const speedEl = pt.getElementsByTagName('speed')[0]
    const speedMps = speedEl?.textContent ? Number(speedEl.textContent) : null
    const speedMph = speedMps !== null && Number.isFinite(speedMps) ? speedMps * 2.23694 : null

    sequenceNum += 1
    waypoints.push({
      sequenceNum,
      latitude,
      longitude,
      speedMph,
      heading: null,
      capturedAt,
      timestampSeconds:
        Number.isFinite(ms) && startMs !== null ? (ms - startMs) / 1000 : sequenceNum - 1,
    })
  }

  return waypoints
}

export class GpsParseError extends Error {}

/** Dispatches on file extension. Throws GpsParseError for anything else. */
export async function parseGpsFile(file: File): Promise<Waypoint[]> {
  const name = file.name.toLowerCase()
  const text = await file.text()

  if (name.endsWith('.srt')) return parseSrt(text)
  if (name.endsWith('.gpx')) return parseGpx(text)

  throw new GpsParseError('Unsupported GPS file — expected a .srt or .gpx sidecar file.')
}

/** Nearest waypoint to a given video timestamp — spec §3b, used to geotag each keyframe. */
export function findNearestWaypoint(waypoints: Waypoint[], timestampSeconds: number): Waypoint | null {
  if (waypoints.length === 0) return null
  let nearest = waypoints[0]
  let bestDelta = Math.abs(nearest.timestampSeconds - timestampSeconds)
  for (const wp of waypoints) {
    const delta = Math.abs(wp.timestampSeconds - timestampSeconds)
    if (delta < bestDelta) {
      nearest = wp
      bestDelta = delta
    }
  }
  return nearest
}
