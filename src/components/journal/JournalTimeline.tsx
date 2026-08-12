import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PenLine } from 'lucide-react'
import { useJournalEntries } from '@/hooks/useJournal'
import { useUIStore } from '@/store/uiStore'
import { JournalCard } from './JournalCard'
import type { JournalEntry } from '@/types'

function formatMonthLabel(ym: string): string {
  const [y, m] = ym.split('-')
  return `${y}年${parseInt(m, 10)}月`
}

export function JournalTimeline() {
  const { data: entries, isLoading } = useJournalEntries()
  const openJournalForm = useUIStore((s) => s.openJournalForm)

  // Local state: which cards are expanded
  const [expandedCards, setExpandedCards] = useState<Set<number>>(new Set())

  // Group entries by YYYY-MM, sorted descending
  const monthGroups = useMemo(() => {
    if (!entries) return []
    const groups = new Map<string, JournalEntry[]>()
    for (const entry of entries) {
      const ym = entry.date.slice(0, 7)
      if (!groups.has(ym)) groups.set(ym, [])
      groups.get(ym)!.push(entry)
    }
    return Array.from(groups.entries()).sort((a, b) => b[0].localeCompare(a[0]))
  }, [entries])

  const toggleCard = (id: number) => {
    setExpandedCards((prev) => {
      const s = new Set(prev)
      if (s.has(id)) s.delete(id); else s.add(id)
      return s
    })
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-20 rounded-2xl bg-white/20 animate-pulse" />
        ))}
      </div>
    )
  }

  if (!entries || entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
          className="text-5xl mb-4"
        >
          📝
        </motion.div>
        <p className="text-lg font-bold text-milk-text mb-2 tracking-wide">还没有随想记录</p>
        <p className="text-sm text-milk-text-muted mb-6">记录灵感、心情或摘抄，让思绪有迹可循</p>
        <button
          onClick={() => openJournalForm()}
          className="flex items-center gap-2 px-6 py-3 rounded-2xl
                     bg-milk-primary text-white font-semibold text-sm
                     hover:bg-milk-primary-dark active:scale-[0.98] transition-all
                     shadow-md shadow-milk-primary/10"
        >
          <PenLine className="w-4 h-4" />
          写想法
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Continuous timeline — all months in one scrollable view */}
      <div className="relative pl-8">
        {/* Single continuous vertical line through all months */}
        <div className="absolute left-[19px] top-0 bottom-0 w-px bg-milk-border/40" />

        <div className="space-y-6">
          {monthGroups.map(([ym, monthEntries]) => (
            <div key={ym}>
              {/* Month header */}
              <div className="relative mb-3">
                <span className="text-[11px] font-bold text-milk-text-secondary tracking-widest
                                 bg-milk-bg/60 backdrop-blur-sm px-3 py-1 rounded-full
                                 border border-milk-border/30">
                  {formatMonthLabel(ym)} · {monthEntries.length}条
                </span>
              </div>

              {/* Month entries */}
              <AnimatePresence mode="wait">
                {monthEntries.map((entry, idx) => (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="relative pb-3 last:pb-0"
                  >
                    {/* Timeline dot: first entry of each month is filled */}
                    <div
                      className={`absolute left-[-19px] top-5 w-2.5 h-2.5 rounded-full border-2 z-10
                        ${idx === 0
                          ? 'bg-milk-primary border-milk-primary'
                          : 'bg-white border-milk-border/60'
                        }`}
                    />
                    {/* Connector line from dot to card */}
                    <div className="absolute left-[-19px] top-[22px] w-[19px] h-px bg-milk-border/30" />

                    <JournalCard
                      entry={entry}
                      isExpanded={expandedCards.has(entry.id)}
                      onToggleExpand={() => toggleCard(entry.id)}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
