import { useUIStore } from '@/store/uiStore'
import type { TimeRange } from '@/types'
import { SearchBar } from '@/components/search/SearchBar'
import { PinnedSection } from '@/components/pinned/PinnedSection'

const TIME_RANGES: { value: TimeRange; label: string }[] = [
  { value: '3days', label: '3 天' },
  { value: '1week', label: '一周' },
  { value: '2weeks', label: '两周' },
  { value: '1month', label: '一个月' },
]

export function Sidebar() {
  const { timeRange, setTimeRange } = useUIStore()

  return (
    <aside className="w-60 flex-shrink-0 border-r border-milk-border bg-milk-sidebar/60
                       flex flex-col h-full overflow-y-auto">
      <div className="p-6 space-y-6">
        {/* Time Range */}
        <div>
          <h3 className="text-[11px] font-bold text-milk-text-muted tracking-widest mb-3 pl-1">
            时间范围
          </h3>
          <div className="space-y-1">
            {TIME_RANGES.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setTimeRange(value)}
                className={`w-full text-left px-4 py-2.5 rounded-2xl text-[13px] font-semibold transition-all duration-200
                  ${timeRange === value
                    ? 'bg-milk-primary/10 text-milk-primary shadow-none'
                    : 'text-milk-text-secondary hover:bg-white/60 hover:text-milk-text'
                  }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Search */}
        <div>
          <h3 className="text-[11px] font-bold text-milk-text-muted tracking-widest mb-3 pl-1">
            搜索
          </h3>
          <SearchBar />
        </div>

        {/* Divider */}
        <div className="border-t border-milk-border" />

        {/* Pinned */}
        <PinnedSection />
      </div>
    </aside>
  )
}
