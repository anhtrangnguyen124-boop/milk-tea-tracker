import { usePinnedEntries } from '@/hooks/useEntries'
import { PinnedEntryCard } from './PinnedEntryCard'
import { Star } from 'lucide-react'

export function PinnedSection() {
  const { data: pinned, isLoading } = usePinnedEntries()

  return (
    <div>
      <h3 className="text-[11px] font-bold text-milk-text-muted tracking-widest mb-3 pl-1 flex items-center gap-1.5">
        <Star className="w-3 h-3 text-amber-500 fill-amber-500 star-glow" />
        我的收藏
      </h3>

      {isLoading ? (
        <div className="space-y-1.5">
          {[1, 2].map((i) => (
            <div key={i} className="h-14 rounded-xl bg-white/50 animate-pulse" />
          ))}
        </div>
      ) : pinned && pinned.length > 0 ? (
        <div className="space-y-1.5">
          {pinned.map((entry) => (
            <PinnedEntryCard key={entry.id} entry={entry} />
          ))}
        </div>
      ) : (
        <p className="text-[12px] text-milk-text-muted py-2 pl-1 leading-relaxed">
          暂无收藏，点击卡片中的 ⭐ 按钮收藏你最喜欢的奶茶
        </p>
      )}
    </div>
  )
}
