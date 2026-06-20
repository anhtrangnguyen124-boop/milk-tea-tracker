import { useState } from 'react'
import { motion } from 'framer-motion'
import { Pin, Trash2, Maximize2, Edit3 } from 'lucide-react'
import { StarRating } from './StarRating'
import { useUIStore } from '@/store/uiStore'
import { useUpdateEntry } from '@/hooks/useEntries'
import { useToastStore } from '@/store/toastStore'
import { DrinkIcon, pickDrinkType } from '@/components/icons/DrinkIcon'
import type { Entry } from '@/types'
import { format } from 'date-fns'

interface Props { entry: Entry }

export function EntryCard({ entry }: Props) {
  const { openEntryForm, setDeletingEntryId, setViewingImageUrl } = useUIStore()
  const updateEntry = useUpdateEntry()
  const [imgError, setImgError] = useState(false)

  const handlePin = () => {
    updateEntry.mutate({ id: entry.id, isPinned: !entry.isPinned })
    useToastStore.getState().addToast(entry.isPinned ? '已取消置顶' : '已置顶')
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-white/70 backdrop-blur-md rounded-3xl border border-white/50
                 shadow-[0_4px_16px_rgba(51,34,27,0.03)]
                 hover:shadow-[0_10px_30px_rgba(51,34,27,0.06)] hover:-translate-y-0.5
                 hover:bg-white/90 transition-all duration-300 p-5 group"
    >
      <div className="flex gap-4 items-center">
        {/* LEFT: SVG sticker icon - the hero element */}
        <div className="w-[72px] h-[72px] flex-shrink-0 rounded-2xl bg-gradient-to-br from-milk-bg to-milk-sidebar
                        flex items-center justify-center ring-1 ring-milk-border/40 p-2.5
                        shadow-[0_2px_8px_rgba(51,34,27,0.04)]">
          <DrinkIcon type={pickDrinkType(entry.name)} size={50} />
        </div>

        {/* CENTER: text content */}
        <div className="flex-1 min-w-0 self-stretch flex flex-col justify-center">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <h3 className="font-bold text-milk-text text-[15px] truncate tracking-wide">
                {entry.brand && (
                  <span className="text-milk-primary font-semibold">{entry.brand} · </span>
                )}
                {entry.name}
              </h3>
              {entry.isPinned && (
                <Pin className="w-3.5 h-3.5 text-milk-pin fill-milk-pin flex-shrink-0 pin-pulse" />
              )}
            </div>
            <span className="text-[11px] text-milk-text-muted bg-milk-bg px-2.5 py-1 rounded-full whitespace-nowrap font-medium">
              {format(new Date(entry.date + 'T00:00:00'), 'M月d日')}
            </span>
          </div>

          <div className="mt-2">
            <StarRating rating={entry.rating} size={14} />
          </div>

          {entry.comment && (
            <p className="mt-2.5 text-[13px] text-milk-text-secondary leading-relaxed line-clamp-2
                          bg-milk-bg/70 rounded-xl px-3 py-2">
              💬 {entry.comment}
            </p>
          )}
        </div>

        {/* RIGHT: real photo thumbnail */}
        {entry.imageDataUrl && !imgError && (
          <div
            className="relative flex-shrink-0 cursor-pointer rounded-xl overflow-hidden w-[72px] h-[72px]
                       ring-1 ring-milk-border/40 group-hover:ring-milk-primary/30 transition-all
                       shadow-[0_2px_8px_rgba(51,34,27,0.04)]"
            onClick={() => setViewingImageUrl(entry.imageDataUrl)}
          >
            <img src={entry.imageDataUrl} alt={entry.name} className="w-[72px] h-[72px] object-cover"
              onError={() => setImgError(true)} />
            <div className="absolute inset-0 bg-black/10 flex items-center justify-center
                            opacity-0 group-hover:opacity-100 transition-opacity">
              <Maximize2 className="w-5 h-5 text-white drop-shadow-lg" />
            </div>
          </div>
        )}
      </div>

      {/* Actions - refined with warmer tones and more spacing */}
      <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-milk-border/30">
        <button onClick={handlePin}
          className={`flex items-center gap-1.5 px-3.5 py-2 text-[11px] font-semibold rounded-xl tracking-wider transition-all
            ${entry.isPinned
              ? 'text-milk-pin bg-amber-50/50 hover:bg-amber-100/50'
              : 'text-milk-text-secondary/70 hover:bg-milk-bg/60 hover:text-milk-text-secondary'
            }`}>
          <Pin className={`w-3 h-3 ${entry.isPinned ? 'fill-milk-pin text-milk-pin' : ''}`} />
          {entry.isPinned ? '已置顶' : '置顶'}
        </button>
        <button onClick={() => openEntryForm(entry.id)}
          className="flex items-center gap-1.5 px-3.5 py-2 text-[11px] font-semibold rounded-xl tracking-wider
                     text-milk-text-secondary/70 hover:bg-milk-bg/60 hover:text-milk-text-secondary transition-all">
          <Edit3 className="w-3 h-3" /> 编辑
        </button>
        <button onClick={() => setDeletingEntryId(entry.id)}
          className="flex items-center gap-1.5 px-3.5 py-2 text-[11px] font-semibold rounded-xl tracking-wider
                     text-milk-text-muted/70 hover:text-milk-danger hover:bg-red-50/50 transition-all">
          <Trash2 className="w-3 h-3" /> 删除
        </button>
      </div>
    </motion.div>
  )
}
