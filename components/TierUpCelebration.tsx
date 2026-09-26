'use client'

import { useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import confetti from 'canvas-confetti'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { getTier } from '@/lib/medals'
import { cn } from '@/lib/utils'
import type { MedalTier } from '@/types'

interface Props {
  tier: MedalTier | null
  onClose: () => void
}

/** Confetti colors per tier, matched to each tier's gradient stops. */
const CONFETTI_COLORS: Record<MedalTier, string[]> = {
  Scout: ['#94A3B8', '#64748B'],
  Pathfinder: ['#22D3EE', '#0891B2'],
  Trailblazer: ['#F59E0B', '#FACC15'],
  'Road Warrior': ['#D946EF', '#F472B6'],
  'Apex Driver': ['#8B5CF6', '#D946EF', '#F59E0B'],
}

export default function TierUpCelebration({ tier, onClose }: Props) {
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => {
    if (!tier) return

    confetti({
      particleCount: 140,
      spread: 100,
      startVelocity: 45,
      origin: { y: 0.6 },
      colors: CONFETTI_COLORS[tier],
    })

    timeoutRef.current = setTimeout(onClose, 3200)
    return () => clearTimeout(timeoutRef.current)
  }, [tier, onClose])

  if (!tier) return null

  const meta = getTier(tier)
  const Icon = meta.icon

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent onClick={onClose}>
        <AnimatePresence>
          <motion.div
            className={`absolute inset-0 opacity-90 ${meta.gradient}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.9 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          />
          <motion.div
            className="relative flex flex-col items-center gap-4 text-center"
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.6, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          >
            <Icon
              size={96}
              strokeWidth={1.5}
              className={cn('drop-shadow-lg', meta.textOn === 'light' ? 'text-white' : 'text-slate-950')}
            />
            <p
              className={cn(
                'font-display text-sm uppercase tracking-widest',
                meta.textOn === 'light' ? 'text-white/70' : 'text-slate-950/70',
              )}
            >
              New Tier Reached
            </p>
            <h2
              className={cn(
                'font-display text-4xl font-bold drop-shadow-lg sm:text-5xl',
                meta.textOn === 'light' ? 'text-white' : 'text-slate-950',
              )}
            >
              {tier}
            </h2>
          </motion.div>
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  )
}
