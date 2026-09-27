import type { CellDangerLevel, Waypoint } from '@/types'

/** Spec §4.1 CELL_DANGER_LEVEL color mapping. */
export const DANGER_COLORS: Record<CellDangerLevel, string> = {
  GREEN: 'rgba(76, 175, 80, 0.5)',
  YELLOW: 'rgba(255, 235, 59, 0.6)',
  ORANGE: 'rgba(255, 152, 0, 0.7)',
  RED: 'rgba(244, 67, 54, 0.8)',
}

/** Parses a ST_ASGEOJSON() string column; never throws. */
export function parseGeoJson<T = GeoJSON.Geometry>(raw: string | null | undefined): T | null {
  if (!raw) return null
  try {
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

/** Escapes AI-generated / DB text before interpolating into Leaflet's HTML-string tooltip/popup APIs. */
export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/**
 * Converts the DDDmm.mmmm (degrees + decimal minutes) format used by both NMEA 0183 sentences
 * and Novatek's dashcam GPS box into signed decimal degrees.
 */
export function ddmmToDecimal(raw: number, hemisphere: string): number {
  const minutes = raw % 100
  const degrees = raw - minutes
  const decimal = degrees / 100 + minutes / 60
  return hemisphere === 'S' || hemisphere === 'W' ? -decimal : decimal
}

const EARTH_RADIUS_METERS = 6_371_000

/** Great-circle distance between two lat/lng points, in meters. */
export function haversineMeters(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
  return 2 * EARTH_RADIUS_METERS * Math.asin(Math.sqrt(a))
}

/** Sums haversine distance across consecutive waypoints (already in SEQUENCE_NUM order). */
export function totalRouteDistanceMeters(waypoints: Waypoint[]): number {
  let total = 0
  for (let i = 1; i < waypoints.length; i++) {
    const a = waypoints[i - 1]
    const b = waypoints[i]
    total += haversineMeters(a.latitude, a.longitude, b.latitude, b.longitude)
  }
  return total
}

/** Green (low) -> red (high) gradient for HAZARD_HEATMAP's AVG_SEVERITY (1-5 scale). */
export function severityGradientColor(avgSeverity: number): string {
  const t = Math.min(Math.max((avgSeverity - 1) / 4, 0), 1)
  const stops = [
    [76, 175, 80], // green
    [255, 235, 59], // yellow
    [255, 152, 0], // orange
    [244, 67, 54], // red
  ]
  const scaled = t * (stops.length - 1)
  const i = Math.min(Math.floor(scaled), stops.length - 2)
  const localT = scaled - i
  const [r1, g1, b1] = stops[i]
  const [r2, g2, b2] = stops[i + 1]
  const r = Math.round(r1 + (r2 - r1) * localT)
  const g = Math.round(g1 + (g2 - g1) * localT)
  const b = Math.round(b1 + (b2 - b1) * localT)
  return `rgba(${r}, ${g}, ${b}, 0.7)`
}
