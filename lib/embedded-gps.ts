import type { Waypoint } from '@/types'
import { extractEmbeddedGps as extractNovatekGps } from './novatek-gps'
import { extractEmbeddedNmeaGps } from './blackvue-nmea'

export type EmbeddedGpsSource = 'novatek' | 'blackvue-nmea' | null

/**
 * Tries every known "GPS baked into the video file itself" format, cheapest/most-specific first:
 * Novatek's binary box (Viofo, 70mai, most budget cams — a targeted read of a few atom headers)
 * before BlackVue's raw NMEA text (a full-file scan). Returns no waypoints if neither matches —
 * callers should fall back to a sidecar .srt/.gpx file, or proceed without location.
 */
export async function extractEmbeddedGps(
  videoFile: File,
): Promise<{ waypoints: Waypoint[]; source: EmbeddedGpsSource }> {
  const novatek = await extractNovatekGps(videoFile)
  if (novatek.length > 0) return { waypoints: novatek, source: 'novatek' }

  const blackvue = await extractEmbeddedNmeaGps(videoFile)
  if (blackvue.length > 0) return { waypoints: blackvue, source: 'blackvue-nmea' }

  return { waypoints: [], source: null }
}
