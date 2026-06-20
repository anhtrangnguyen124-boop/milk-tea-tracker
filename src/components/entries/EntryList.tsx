import { AnimatePresence, motion } from 'framer-motion'
import { EntryCard } from './EntryCard'
import type { Entry } from '@/types'
import { useUIStore } from '@/store/uiStore'
import { DrinkIcon } from '@/components/icons/DrinkIcon'

interface Props { entries: Entry[]; isLoading: boolean }

export function EntryList({ entries, isLoading }: Props) {
  const openEntryForm = useUIStore((s) => s.openEntryForm)

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-3xl border border-milk-border/40 p-5 animate-pulse">
            <div className="flex gap-4">
              <div className="w-24 h-24 rounded-2xl bg-milk-bg" />
              <div className="flex-1 space-y-3 py-1">
                <div className="h-5 w-36 bg-milk-bg rounded-xl" />
                <div className="h-4 w-24 bg-milk-bg rounded-xl" />
                <div className="h-4 w-56 bg-milk-bg rounded-xl" />
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (entries.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-24 text-center"
      >
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className="w-32 h-32 rounded-full bg-gradient-to-br from-milk-bg via-milk-sidebar to-milk-primary/5
                     flex items-center justify-center mb-8 shadow-[inset_0_2px_8px_rgba(51,34,27,0.04)] p-4"
        >
          <DrinkIcon type="milktea" size={72} />
        </motion.div>

        <h3 className="text-xl font-bold text-milk-text mb-2">还没有奶茶记录</h3>
        <p className="text-sm text-milk-text-secondary mb-10 max-w-xs leading-relaxed">
          记录下今天喝的第一杯奶茶吧，每一杯都值得被记住 ✨
        </p>

        <button
          onClick={() => openEntryForm()}
          className="px-10 py-4 rounded-full bg-milk-primary text-white font-bold text-[15px]
                     shadow-lg shadow-milk-primary/15 hover:shadow-xl hover:shadow-milk-primary/25
                     hover:scale-[1.02] active:scale-95 transition-all duration-300
                     flex items-center gap-2.5"
        >
          添加第一杯奶茶
        </button>
        <p className="text-xs text-milk-text-muted mt-5">或按 Cmd+N 快速添加</p>
      </motion.div>
    )
  }

  return (
    <div className="space-y-4">
      <AnimatePresence mode="popLayout">
        {entries.map((entry) => <EntryCard key={entry.id} entry={entry} />)}
      </AnimatePresence>
    </div>
  )
}
