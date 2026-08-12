import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useUIStore } from '@/store/uiStore'

const PARTICLE_COUNT = 40
const COLORS = ['#FF9800', '#F48FB1', '#81C784', '#BA68C8', '#4FC3F7', '#FFD54F', '#FF8A65']

interface Particle {
  id: number
  x: number
  y: number
  color: string
  size: number
  rotation: number
}

export function Confetti() {
  const [particles, setParticles] = useState<Particle[]>([])
  const confetti = useUIStore((s) => s.confetti)
  const setConfetti = useUIStore((s) => s.setConfetti)

  useEffect(() => {
    if (!confetti) return

    const newParticles: Particle[] = Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
      id: i,
      x: Math.random() * window.innerWidth,
      y: -20 - Math.random() * 100,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      size: 6 + Math.random() * 10,
      rotation: Math.random() * 360,
    }))
    setParticles(newParticles)

    // Auto-clear after animation
    const timer = setTimeout(() => {
      setParticles([])
      setConfetti(false)
    }, 2000)
    return () => clearTimeout(timer)
  }, [confetti, setConfetti])

  return (
    <AnimatePresence>
      {particles.length > 0 && (
        <div className="fixed inset-0 pointer-events-none z-[100]" aria-hidden>
          {particles.map((p) => (
            <motion.div
              key={p.id}
              initial={{ x: p.x, y: p.y, rotate: p.rotation, opacity: 1, scale: 0 }}
              animate={{ y: window.innerHeight + 50, opacity: [1, 1, 0], rotate: p.rotation + 360, scale: [0, 1, 1] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5 + Math.random() * 0.8, ease: 'easeIn' }}
              className="absolute rounded-sm"
              style={{
                left: 0, top: 0,
                width: p.size, height: p.size * 0.6,
                backgroundColor: p.color,
              }}
            />
          ))}
        </div>
      )}
    </AnimatePresence>
  )
}
