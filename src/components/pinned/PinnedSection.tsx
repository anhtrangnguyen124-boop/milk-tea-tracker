import { usePinnedEntries } from '@/hooks/useEntries'
import { PinnedEntryCard } from './PinnedEntryCard'
import { Pin } from 'lucide-react'

export function PinnedSection() {
  const { data: pinned, isLoading } = usePinnedEntries()

  return (
    <div>
      <h3 className="text-[11px] font-bold text-milk-text-muted tracking-widest mb-3 pl-1 flex items-center gap-1.5">
        <Pin className="w-3 h-3 text-milk-pin fill-milk-pin" />
        置顶
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
          暂无置顶，点击卡片中的 📌 按钮置顶你最喜欢的奶茶
        </p>
      )}
    </div>
  )
}
