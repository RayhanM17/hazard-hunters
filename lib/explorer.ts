import { Home, Footprints, Compass, Binoculars, Ship, Map, type LucideIcon } from 'lucide-react'
import type { ExplorerTitle } from '@/types'

export interface ExplorerTitleMeta {
  name: ExplorerTitle
  min: number
  color: string
  icon: LucideIcon
}

/** Mirrors lib/medals.ts's TIERS shape — same tonal-badge pattern, ordered highest first. */
export const EXPLORER_TITLES: ExplorerTitleMeta[] = [
  { name: 'Cartographer', min: 100, color: '#FCD34D', icon: Map },
  { name: 'Voyager', min: 50, color: '#F472B6', icon: Ship },
  { name: 'Ranger', min: 25, color: '#FBBF24', icon: Binoculars },
  { name: 'Wanderer', min: 10, color: '#22D3EE', icon: Compass },
  { name: 'Rookie Explorer', min: 1, color: '#94A3B8', icon: Footprints },
  { name: 'Stationary', min: 0, color: '#64748B', icon: Home },
]

export const EXPLORER_TITLE_ORDER: Record<ExplorerTitle, number> = {
  Cartographer: 0,
  Voyager: 1,
  Ranger: 2,
  Wanderer: 3,
  'Rookie Explorer': 4,
  Stationary: 5,
}

export function getExplorerTitleMeta(title: ExplorerTitle): ExplorerTitleMeta {
  return EXPLORER_TITLES.find((t) => t.name === title) ?? EXPLORER_TITLES[EXPLORER_TITLES.length - 1]
}

/** Next title threshold + progress, for a progress bar toward the next title (mirrors ProgressBar's inputs). */
export function nextTitleProgress(cellsExplored: number): { nextThreshold: number | null; percentage: number } {
  const ascending = [...EXPLORER_TITLES].sort((a, b) => a.min - b.min)
  const next = ascending.find((t) => t.min > cellsExplored)
  if (!next) return { nextThreshold: null, percentage: 100 }
  const prev = [...ascending].reverse().find((t) => t.min <= cellsExplored) ?? ascending[0]
  const span = next.min - prev.min
  const progressed = cellsExplored - prev.min
  return { nextThreshold: next.min, percentage: span > 0 ? (progressed / span) * 100 : 100 }
}
