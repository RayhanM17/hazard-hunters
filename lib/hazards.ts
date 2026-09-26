import {
  CircleDot,
  Zap,
  Milestone,
  Construction,
  Package,
  Droplets,
  Signpost,
  ShieldOff,
  PawPrint,
  TrendingDown,
  Snowflake,
  TriangleAlert,
  Car,
  CircleSlash,
  type LucideIcon,
} from 'lucide-react'
import type { HazardType, Confidence, Severity } from '@/types'

export interface HazardMeta {
  label: string
  icon: LucideIcon
  /** Solid accent hex — same tonal-badge pattern as lib/medals.ts (color on a fixed dark chip). */
  color: string
}

export const HAZARDS: Record<HazardType, HazardMeta> = {
  POTHOLE: { label: 'Pothole', icon: CircleDot, color: '#F87171' },
  CRACK: { label: 'Crack', icon: Zap, color: '#FB923C' },
  FADED_LINE: { label: 'Faded Line', icon: Milestone, color: '#94A3B8' },
  CONSTRUCTION: { label: 'Construction', icon: Construction, color: '#FBBF24' },
  DEBRIS: { label: 'Debris', icon: Package, color: '#D97706' },
  FLOODING: { label: 'Flooding', icon: Droplets, color: '#38BDF8' },
  DAMAGED_SIGN: { label: 'Damaged Sign', icon: Signpost, color: '#F472B6' },
  MISSING_GUARDRAIL: { label: 'Missing Guardrail', icon: ShieldOff, color: '#EF4444' },
  ANIMAL: { label: 'Animal', icon: PawPrint, color: '#A78BFA' },
  UNEVEN_SURFACE: { label: 'Uneven Surface', icon: TrendingDown, color: '#FCD34D' },
  SLIPPERY_SURFACE: { label: 'Slippery Surface', icon: Snowflake, color: '#22D3EE' },
  SIGNAL_MALFUNCTION: { label: 'Signal Malfunction', icon: TriangleAlert, color: '#EF4444' },
  STALLED_VEHICLE: { label: 'Stalled Vehicle', icon: Car, color: '#FB7185' },
  NONE: { label: 'No Hazard', icon: CircleSlash, color: '#64748B' },
}

export function getHazard(type: HazardType | null): HazardMeta {
  return HAZARDS[type ?? 'NONE'] ?? HAZARDS.NONE
}

/** 1=green, 2=yellow, 3=orange, 4=red, 5=dark red */
export const SEVERITY_COLORS: Record<Severity, string> = {
  1: '#10B981',
  2: '#FACC15',
  3: '#F97316',
  4: '#EF4444',
  5: '#991B1B',
}

export interface ConfidenceMeta {
  label: string
  /** solid = filled chip, outline = bordered only, dashed = dashed border + dimmed text */
  variant: 'solid' | 'outline' | 'dashed'
}

export const CONFIDENCE_META: Record<Confidence, ConfidenceMeta> = {
  HIGH: { label: 'High confidence', variant: 'solid' },
  MEDIUM: { label: 'Medium confidence', variant: 'outline' },
  LOW: { label: 'Low confidence', variant: 'dashed' },
}
