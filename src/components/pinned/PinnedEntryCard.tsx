import { Pin } from 'lucide-react'
import { useUIStore } from '@/store/uiStore'
import { StarRating } from '@/components/entries/StarRating'
import { DrinkIcon, pickDrinkType } from '@/components/icons/DrinkIcon'
import type { Entry } from '@/types'

interface Props { entry: Entry }

export function PinnedEntryCard({ entry }: Props) {
  const { setSelectedDate, setCalendarMonth } = useUIStore()

  return (
    <button
      onClick={() => {
        setSelectedDate(entry.date)
        setCalendarMonth(new Date(entry.date + 'T00:00:00'))
      }}
      className="w-full text-left p-3 rounded-2xl bg-white/40 backdrop-blur-sm border border-white/40
                 hover:bg-white/80 hover:shadow-sm hover:border-milk-primary/20 transition-all group"
    >
      <div className="flex items-center gap-2.5">
        {entry.imageDataUrl ? (
          <img src={entry.imageDataUrl} alt={entry.name}
            className="w-9 h-9 rounded-xl object-cover flex-shrink-0 ring-1 ring-milk-border/50" />
        ) : (
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-milk-bg to-milk-sidebar
                          flex items-center justify-center flex-shrink-0 ring-1 ring-milk-border/50 p-1">
            <DrinkIcon type={pickDrinkType(entry.name)} size={28} />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1">
            <span className="text-[13px] font-semibold text-milk-text truncate">{entry.name}</span>
            <Pin className="w-2.5 h-2.5 text-milk-pin fill-milk-pin flex-shrink-0" />
          </div>
          <div className="mt-1"><StarRating rating={entry.rating} size={10} /></div>
        </div>
      </div>
    </button>
  )
}
