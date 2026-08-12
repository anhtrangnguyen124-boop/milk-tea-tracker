import { useEffect, useState } from 'react'
import { motion, useSpring, useTransform } from 'framer-motion'

interface Props {
  value: number
  prefix?: string
  suffix?: string
  className?: string
}

export function NumberScroll({ value, prefix, suffix, className = '' }: Props) {
  const [displayValue, setDisplayValue] = useState(0)
  const spring = useSpring(0, { stiffness: 80, damping: 20 })

  useEffect(() => {
    spring.set(value)
  }, [value, spring])

  const rounded = useTransform(spring, (v) => Math.round(v))

  useEffect(() => {
    const unsub = rounded.on('change', (v) => setDisplayValue(v))
    return () => unsub()
  }, [rounded])

  return (
    <motion.span className={`tabular-nums ${className}`}>
      {prefix}{displayValue}{suffix}
    </motion.span>
  )
}
