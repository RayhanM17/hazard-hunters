'use client'

import { useEffect, useRef } from 'react'
import { motion, useMotionValue, useTransform, animate } from 'framer-motion'
import { cn } from '@/lib/utils'

interface Props {
  value: number
  className?: string
  suffix?: string
}

export default function PointCounter({ value, className, suffix }: Props) {
  const motionValue = useMotionValue(value)
  const rounded = useTransform(motionValue, (v) => Math.round(v).toLocaleString())
  const prevValue = useRef(value)

  useEffect(() => {
    const controls = animate(motionValue, value, {
      duration: 1.2,
      ease: [0.16, 1, 0.3, 1],
    })
    prevValue.current = value
    return controls.stop
  }, [value, motionValue])

  return (
    <span className={cn('font-display tabular-nums', className)}>
      <motion.span>{rounded}</motion.span>
      {suffix}
    </span>
  )
}
