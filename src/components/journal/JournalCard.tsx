import { motion } from 'framer-motion'
import { Pencil, Trash2 } from 'lucide-react'
import { useUIStore } from '@/store/uiStore'
import { useDeleteJournalEntry } from '@/hooks/useJournal'
import { useToastStore } from '@/store/toastStore'
import { MOODS, PAPER_CSS } from '@/constants/journal'
import type { JournalEntry } from '@/types'

interface Props {
  entry: JournalEntry
  isExpanded: boolean
  onToggleExpand: () => void
}

export function JournalCard({ entry, isExpanded, onToggleExpand }: Props) {
  const openJournalForm = useUIStore((s) => s.openJournalForm)
  const deleteEntry = useDeleteJournalEntry()
  const moodPreset = MOODS.find((m) => m.key === entry.mood)
  const paperClass = PAPER_CSS[entry.paper] ?? ''
  const isCustomMood = entry.mood === 'custom'

  // Format date: show MM-DD + weekday
  const displayDate = (() => {
    const d = new Date(entry.date)
    const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    return `${mm}-${dd} ${weekdays[d.getDay()]}`
  })()

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (confirm('确定删除这条随想吗？')) {
      deleteEntry.mutate(entry.id)
      useToastStore.getState().addToast('已删除')
    }
  }

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation()
    openJournalForm(entry.id)
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      onClick={onToggleExpand}
      className={`relative bg-white/70 backdrop-blur-md rounded-2xl border border-white/50
                 shadow-[0_2px_12px_rgba(51,34,27,0.02)] p-4
                 group hover:shadow-md hover:border-white/70 transition-all duration-300
                 cursor-pointer ${paperClass}`}
    >
      {/* Header row: date + title */}
      <div className="flex items-center gap-2.5 mb-2">
        {/* Date */}
        <span className="text-xs text-milk-text-muted font-medium whitespace-nowrap">
          {displayDate}
        </span>

        {/* Title */}
        {entry.title && (
          <h3 className="font-bold text-milk-text text-sm tracking-wide truncate flex-1">
            {entry.title}
          </h3>
        )}
        {!entry.title && (
          <span className="text-xs text-milk-text-muted/50 italic flex-1">无标题</span>
        )}

        {/* Edit/Delete — hover reveal */}
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <button
            type="button"
            onClick={handleEdit}
            className="p-1 rounded-lg text-milk-text-muted hover:text-milk-primary transition-colors"
            title="编辑"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="p-1 rounded-lg text-milk-text-muted hover:text-milk-danger transition-colors"
            title="删除"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Content — truncated or full */}
      <div
        className={`text-sm text-milk-text-secondary leading-relaxed whitespace-pre-wrap
          ${isExpanded ? '' : 'line-clamp-2'}`}
      >
        {entry.content}
      </div>

      {/* Bottom row: expand hint (left) + mood (right) */}
      <div className="flex items-end justify-between mt-2">
        <div>
          {entry.content.length > 80 && !isExpanded && (
            <span className="text-[10px] text-milk-primary/60">
              点击展开全文
            </span>
          )}
          {isExpanded && entry.content.length > 80 && (
            <span className="text-[10px] text-milk-primary/60">
              点击收起
            </span>
          )}
        </div>

        {/* Mood: emoji for presets, custom text chip for custom mood */}
        {isCustomMood ? (
          <span className="text-xs text-milk-text-secondary font-medium bg-milk-bg/60 px-2 py-0.5 rounded-full">
            {entry.customMood || '自定义'}
          </span>
        ) : (
          <span className="text-base leading-none" title={moodPreset?.label}>
            {moodPreset?.emoji}
          </span>
        )}
      </div>

    </motion.div>
  )
}
