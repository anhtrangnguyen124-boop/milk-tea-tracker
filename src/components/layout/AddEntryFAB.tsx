import { Plus } from 'lucide-react'
import { useUIStore } from '@/store/uiStore'
import { useEntries } from '@/hooks/useEntries'
import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export function AddEntryFAB() {
  const { timeRange, openEntryForm, activeTab } = useUIStore()
  const { data: entries } = useEntries(timeRange)

  useEffect(() => {
    const cleanup = window.electronAPI?.onNewEntry(() => openEntryForm())
    return cleanup
  }, [openEntryForm])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
        e.preventDefault()
        openEntryForm()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [openEntryForm])

  const hasEntries = entries && entries.length > 0
  const show = activeTab === 'calendar' && hasEntries

  return (
    <AnimatePresence>
      {show && (
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => openEntryForm()}
          className="fixed bottom-24 right-8 w-14 h-14 rounded-2xl
                     bg-gradient-to-br from-milk-primary to-milk-primary-dark text-white
                     shadow-lg shadow-milk-primary/20 hover:shadow-xl hover:shadow-milk-primary/30
                     transition-shadow duration-300 flex items-center justify-center z-40"
          title="添加奶茶记录 (Cmd+N)"
        >
          <Plus className="w-6 h-6" strokeWidth={2.5} />
        </motion.button>
      )}
    </AnimatePresence>
  )
}
