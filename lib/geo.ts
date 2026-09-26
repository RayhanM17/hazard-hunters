import type { CellDangerLevel } from '@/types'

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
