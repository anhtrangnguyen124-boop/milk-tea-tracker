import { useState } from 'react'
import { motion } from 'framer-motion'
import { Star, Trash2, Maximize2 } from 'lucide-react'
import { StarRating } from './StarRating'
import { useUIStore } from '@/store/uiStore'
import { useUpdateEntry } from '@/hooks/useEntries'
import { useToastStore } from '@/store/toastStore'
import { DrinkIcon, pickDrinkType } from '@/components/icons/DrinkIcon'
import { DRINK_CATEGORY_LABELS } from '@/constants/drinks'
import { useEntryImageUrls } from '@/hooks/useEntryImageUrls'
import type { Entry, ColorTheme } from '@/types'
import { format } from 'date-fns'

const THEME_COLORS: Record<ColorTheme, string> = {
  orange: '#FF9800',
  peach: '#F48FB1',
  matcha: '#81C784',
  taro: '#BA68C8',
  sea: '#4FC3F7',
}

interface Props { entry: Entry }

export function EntryCard({ entry }: Props) {
  const { openEntryForm, setDeletingEntryId, setViewingImageUrl } = useUIStore()
  const updateEntry = useUpdateEntry()
  const [imgErrors, setImgErrors] = useState<Record<number, boolean>>({})

  const storedImageUrls = useEntryImageUrls(entry.imageIds ?? [])
  const legacyImages = entry.images?.length ? entry.images : (entry.imageDataUrl ? [entry.imageDataUrl] : [])
  const allImages = [...legacyImages, ...storedImageUrls]
  const accentColor = entry.colorTheme ? THEME_COLORS[entry.colorTheme] : undefined
  const hasDrinkDetails = Boolean(
    entry.drinkCategory || entry.sweetness || entry.ice || entry.toppings?.length || entry.repurchase,
  )

  const handlePin = () => {
    updateEntry.mutate({ id: entry.id, isPinned: !entry.isPinned })
    useToastStore.getState().addToast(entry.isPinned ? '已取消收藏' : '已收藏')
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="relative bg-white/70 backdrop-blur-md rounded-3xl border border-white/50
                 shadow-[0_4px_16px_rgba(51,34,27,0.03)]
                 hover:shadow-[0_10px_30px_rgba(51,34,27,0.06)]
                 hover:bg-white/90 transition-shadow duration-300 p-5 group !cursor-pointer overflow-hidden"
      onClick={() => openEntryForm(entry.id, entry)}
    >
      {/* Color theme accent strip */}
      {accentColor && (
        <div className="absolute left-0 top-3 bottom-3 w-1 rounded-r-full" style={{ backgroundColor: accentColor }} />
      )}

      {/* Top-right action icons */}
      <div className="absolute top-3 right-3 flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
        <button type="button" onClick={handlePin}
          className="p-1 rounded-lg !cursor-pointer transition-colors select-none"
          title={entry.isPinned ? '取消收藏' : '收藏'}>
          <Star className={`w-4 h-4 ${entry.isPinned ? 'text-amber-500 fill-amber-500 star-glow' : 'text-milk-text-muted/50'}`} />
        </button>
        <button type="button" onClick={() => setDeletingEntryId(entry.id)}
          className="p-1 rounded-lg !cursor-pointer transition-colors select-none
                     text-milk-text-muted/50 hover:text-milk-danger"
          title="删除">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="flex gap-4 items-center">
        {/* LEFT: SVG sticker icon */}
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
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500 flex-shrink-0 star-glow" />
              )}
            </div>
            <div className="flex items-center gap-1.5">
              {entry.price != null && (
                <span className="text-[11px] text-milk-primary font-semibold bg-milk-bg px-2 py-0.5 rounded-full">
                  ¥{entry.price}
                </span>
              )}
              <span className="text-[11px] text-milk-text-muted bg-milk-bg px-2.5 py-1 rounded-full whitespace-nowrap font-medium">
                {format(new Date(entry.date + 'T00:00:00'), 'M月d日')}
              </span>
            </div>
          </div>

          <div className="mt-2">
            <StarRating rating={entry.rating} size={14} />
          </div>

          {hasDrinkDetails && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {entry.drinkCategory && (
                <span className="rounded-full bg-milk-primary/8 px-2 py-0.5 text-[11px] font-medium text-milk-primary">
                  {DRINK_CATEGORY_LABELS[entry.drinkCategory]}
                </span>
              )}
              {entry.sweetness && <span className="rounded-full bg-milk-bg px-2 py-0.5 text-[11px] text-milk-text-secondary">{entry.sweetness}</span>}
              {entry.ice && <span className="rounded-full bg-milk-bg px-2 py-0.5 text-[11px] text-milk-text-secondary">{entry.ice}</span>}
              {entry.toppings?.map((topping) => <span key={topping} className="rounded-full bg-milk-bg px-2 py-0.5 text-[11px] text-milk-text-secondary">+{topping}</span>)}
              {entry.repurchase && <span className="rounded-full bg-milk-bg px-2 py-0.5 text-[11px] text-milk-text-secondary">{entry.repurchase === '是' ? '👍 会再喝' : '👎 暂不回购'}</span>}
            </div>
          )}

          {entry.comment && (
            <p className="mt-2.5 text-[13px] text-milk-text-secondary leading-relaxed line-clamp-2
                          bg-milk-bg/70 rounded-xl px-3 py-2">
              💬 {entry.comment}
            </p>
          )}
        </div>

        {/* RIGHT: photo thumbnails (up to 3) */}
        {allImages.length > 0 && (
          <div className="flex-shrink-0 flex gap-1">
            {allImages.slice(0, 3).map((img, i) =>
              !imgErrors[i] ? (
                <div
                  key={i}
                  className="relative cursor-pointer rounded-xl overflow-hidden w-[60px] h-[60px]
                             ring-1 ring-milk-border/40 group-hover:ring-milk-primary/30 transition-all
                             shadow-[0_2px_8px_rgba(51,34,27,0.04)]"
                  onClick={(e) => { e.stopPropagation(); setViewingImageUrl(img); }}
                >
                  <img src={img} alt={`${entry.name} ${i + 1}`} className="w-[60px] h-[60px] object-cover"
                    onError={() => setImgErrors(prev => ({ ...prev, [i]: true }))} />
                  {i === 2 && allImages.length > 3 && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <span className="text-white text-xs font-bold">+{allImages.length - 3}</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/10 flex items-center justify-center
                                  opacity-0 group-hover:opacity-100 transition-opacity">
                    <Maximize2 className="w-4 h-4 text-white drop-shadow-lg" />
                  </div>
                </div>
              ) : null
            )}
          </div>
        )}
      </div>
    </motion.div>
  )
}
