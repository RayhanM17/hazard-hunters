import type { Waypoint } from '@/types'
import { ddmmToDecimal } from './geo'

/**
 * Extracts GPS waypoints from BlackVue (and other) dashcams that embed raw NMEA 0183 text
 * sentences directly in the file, rather than Novatek's binary box (lib/novatek-gps.ts). This is
 * literally readable with `strings file.mp4 | grep GPRMC` — no container parsing needed, just a
 * scan for `$GPRMC`/`$GNRMC` sentences and their checksum.
 *
 * $GPRMC field layout (comma-separated, after the "GPRMC" tag):
 *   0 time (hhmmss.ss)   1 status (A=valid/V=void)   2 lat (ddmm.mmmm)   3 N/S
 *   4 lon (dddmm.mmmm)   5 E/W                        6 speed (knots)     7 track angle
 *   8 date (ddmmyy)      9 mag variation              10 E/W
 */

const KNOTS_TO_MPH = 1.150779
const WINDOW_BYTES = 4 * 1024 * 1024
// Generously larger than any real NMEA sentence (~80 chars) so one spanning a chunk boundary is
// always read whole in the chunk that owns its start byte.
const LOOKAHEAD_BYTES = 256

const RMC_RE = /\$((?:GP|GN)RMC,[0-9A-Za-z.,+-]*)\*([0-9A-Fa-f]{2})/g

function checksumValid(body: string, hex: string): boolean {
  let cs = 0
  for (let i = 0; i < body.length; i++) cs ^= body.charCodeAt(i)
  return cs.toString(16).toUpperCase().padStart(2, '0') === hex.toUpperCase()
}

interface RmcFix {
  hour: number
  minute: number
  second: number
  ms: number
  day: number
  month: number
  year: number
  latitude: number
  longitude: number
  speedMph: number | null
}

function parseRmc(sentence: string): RmcFix | null {
  // sentence is "GPRMC,<fields...>" (talker+type prefix already stripped of '$' and checksum)
  const fields = sentence.split(',')
  if (fields.length < 9) return null
  const [, time, status, latRaw, latHemi, lonRaw, lonHemi, speedKnotsRaw, , dateRaw] = fields
  if (status !== 'A') return null // void fix — no satellite lock at this instant

  const lat = parseFloat(latRaw)
  const lon = parseFloat(lonRaw)
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null
  if (time.length < 6 || dateRaw.length < 6) return null

  const hour = Number(time.slice(0, 2))
  const minute = Number(time.slice(2, 4))
  const secondsFloat = Number(time.slice(4))
  const second = Math.floor(secondsFloat)
  const ms = Math.round((secondsFloat - second) * 1000)
  const day = Number(dateRaw.slice(0, 2))
  const month = Number(dateRaw.slice(2, 4))
  const year = Number(dateRaw.slice(4, 6))
  if ([hour, minute, second, day, month, year].some((n) => !Number.isFinite(n))) return null

  const speedKnots = parseFloat(speedKnotsRaw)
  return {
    hour,
    minute,
    second,
    ms,
    day,
    month,
    year,
    latitude: ddmmToDecimal(lat, latHemi),
    longitude: ddmmToDecimal(lon, lonHemi),
    speedMph: Number.isFinite(speedKnots) ? speedKnots * KNOTS_TO_MPH : null,
  }
}

async function scanForRmcFixes(file: File): Promise<RmcFix[]> {
  const fixes: RmcFix[] = []

  for (let chunkStart = 0; chunkStart < file.size; chunkStart += WINDOW_BYTES) {
    const ownedEnd = chunkStart + WINDOW_BYTES
    const readEnd = Math.min(file.size, ownedEnd + LOOKAHEAD_BYTES)
    // Blob.text() lenient-decodes as UTF-8 — invalid bytes (the surrounding binary video data)
    // become replacement characters rather than throwing, so this is safe on arbitrary content.
    const text = await file.slice(chunkStart, readEnd).text()

    for (const m of text.matchAll(RMC_RE)) {
      const absStart = chunkStart + (m.index ?? 0)
      if (absStart >= ownedEnd) continue // belongs to the next chunk's owned region — skip here
      const [, body, checksum] = m
      if (!checksumValid(body, checksum)) continue
      const fix = parseRmc(body)
      if (fix) fixes.push(fix)
    }
  }

  return fixes
}

/**
 * Attempts to extract embedded GPS waypoints from a dashcam video's raw NMEA sentences. Returns
 * an empty array (never throws) if none are found.
 */
export async function extractEmbeddedNmeaGps(videoFile: File): Promise<Waypoint[]> {
  let fixes: RmcFix[]
  try {
    fixes = await scanForRmcFixes(videoFile)
  } catch {
    return []
  }
  if (fixes.length === 0) return []

  const firstEpoch = Date.UTC(fixes[0].year + 2000, fixes[0].month - 1, fixes[0].day, fixes[0].hour, fixes[0].minute, fixes[0].second, fixes[0].ms)

  return fixes.map((f, i) => {
    const epoch = Date.UTC(f.year + 2000, f.month - 1, f.day, f.hour, f.minute, f.second, f.ms)
    return {
      sequenceNum: i + 1,
      latitude: f.latitude,
      longitude: f.longitude,
      speedMph: f.speedMph,
      heading: null,
      capturedAt: new Date(epoch).toISOString(),
      timestampSeconds: (epoch - firstEpoch) / 1000,
    }
  })
}
