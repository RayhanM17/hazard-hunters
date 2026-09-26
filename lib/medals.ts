import { Search, Compass, Flame, Swords, Crown, type LucideIcon } from 'lucide-react'
import type { MedalTier } from '@/types'

export interface TierMeta {
  name: MedalTier
  min: number
  /**
   * Solid accent hex, chosen so it stays readable against the app's dark
   * surfaces (bg-slate-800/900/950) — used for badge text/icons/borders.
   * Gradients look great as large fills, but small text sitting directly on
   * top of a two-stop gradient loses contrast wherever the gradient dips
   * dark (this is what made "Pathfinder" hard to read: cyan-600, the darker
   * stop, is a grayish blue that near-black text barely cleared).
   */
  color: string
  icon: LucideIcon
  /** Tailwind gradient classes for large fills: progress bar, tier-up overlay. */
  gradient: string
  glow?: string
  /** Foreground color for text/icons on `gradient` fills (large-text contexts only). */
  textOn: 'dark' | 'light'
}

export const TIERS: TierMeta[] = [
  {
    name: 'Apex Driver',
    min: 5000,
    color: '#FCD34D',
    icon: Crown,
    gradient: 'bg-gradient-to-r from-violet-600 via-fuchsia-500 to-amber-500 bg-gradient-pan animate-gradient-pan',
    glow: 'shadow-glow-violet',
    textOn: 'light',
  },
  {
    name: 'Road Warrior',
    min: 3000,
    color: '#F472B6',
    icon: Swords,
    gradient: 'bg-gradient-to-r from-fuchsia-600 to-pink-400',
    textOn: 'light',
  },
  {
    name: 'Trailblazer',
    min: 1500,
    color: '#FBBF24',
    icon: Flame,
    gradient: 'bg-gradient-to-r from-amber-600 to-yellow-400',
    textOn: 'dark',
  },
  {
    name: 'Pathfinder',
    min: 500,
    color: '#22D3EE',
    icon: Compass,
    gradient: 'bg-gradient-to-r from-cyan-600 to-cyan-400',
    textOn: 'dark',
  },
  {
    name: 'Scout',
    min: 0,
    color: '#94A3B8',
    icon: Search,
    gradient: 'bg-gradient-to-r from-slate-500 to-slate-400',
    textOn: 'dark',
  },
]

/** Tier order index used when grouping the leaderboard (0 = highest). */
export const TIER_ORDER: Record<MedalTier, number> = {
  'Apex Driver': 0,
  'Road Warrior': 1,
  Trailblazer: 2,
  Pathfinder: 3,
  Scout: 4,
}

export function getTier(tierName: MedalTier): TierMeta {
  return TIERS.find((t) => t.name === tierName) ?? TIERS[TIERS.length - 1]
}
