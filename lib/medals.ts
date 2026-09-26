import type { MedalTier } from '@/types'

export const TIERS = [
  { name: 'Apex Driver'  as MedalTier, min: 5000, color: '#F59E0B', icon: '👑' },
  { name: 'Road Warrior' as MedalTier, min: 3000, color: '#8B5CF6', icon: '⚔️' },
  { name: 'Trailblazer'  as MedalTier, min: 1500, color: '#0EA5E9', icon: '🔥' },
  { name: 'Pathfinder'   as MedalTier, min: 500,  color: '#10B981', icon: '🧭' },
  { name: 'Scout'        as MedalTier, min: 0,    color: '#64748B', icon: '🔍' },
] as const

/** Tier order index used when grouping the leaderboard (0 = highest). */
export const TIER_ORDER: Record<MedalTier, number> = {
  'Apex Driver':  0,
  'Road Warrior': 1,
  'Trailblazer':  2,
  'Pathfinder':   3,
  'Scout':        4,
}

export function getTier(tierName: MedalTier) {
  return TIERS.find(t => t.name === tierName)
}
