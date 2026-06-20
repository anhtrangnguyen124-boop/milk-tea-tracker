import { useEffect, useState, useRef } from 'react'
import { Search, X, SlidersHorizontal, Filter } from 'lucide-react'
import { useUIStore } from '@/store/uiStore'

export function SearchBar() {
  const setSearchTerm = useUIStore((s) => s.setSearchTerm)
  const searchTerm = useUIStore((s) => s.searchTerm)
  const [local, setLocal] = useState(searchTerm)
  const [focused, setFocused] = useState(false)
  const [brandFilter, setBrandFilter] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const timer = setTimeout(() => {
      let fullTerm = local
      if (brandFilter.trim()) fullTerm += ' ' + brandFilter.trim()
      setSearchTerm(fullTerm)
    }, 300)
    return () => clearTimeout(timer)
  }, [local, brandFilter, setSearchTerm])

  useEffect(() => { setLocal(searchTerm) }, [searchTerm])

  const hasFilters = brandFilter.trim() || dateFrom || dateTo

  return (
    <div className="space-y-4">
      {/* Main search input - large and elegant */}
      <div className={`flex items-center rounded-2xl transition-all duration-300
        ${focused
          ? 'bg-white/80 ring-2 ring-milk-primary/15 shadow-lg'
          : 'bg-white/40 hover:bg-white/50'
        }`}>
        {/* Search icon - clearly separated */}
        <div className={`flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-l-2xl transition-colors duration-300
          ${focused ? 'text-milk-primary' : 'text-milk-text-muted'}`}>
          <Search className="w-5 h-5" />
        </div>

        <input
          ref={inputRef}
          type="text"
          value={local}
          onChange={(e) => setLocal(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => { if (!hasFilters && !local) setFocused(false) }}
          placeholder="输入奶茶名称或品牌..."
          className="flex-1 py-3 bg-transparent text-[15px] text-milk-text tracking-wide
                     placeholder:text-milk-text-muted focus:outline-none transition-all"
        />

        {local && (
          <button
            onClick={() => { setLocal(''); setBrandFilter(''); setDateFrom(''); setDateTo('') }}
            className="flex-shrink-0 w-8 h-8 rounded-full bg-milk-border/30 flex items-center justify-center
                       text-milk-text-muted hover:bg-milk-border/60 hover:text-milk-text transition-all mr-2">
            <X size={12} />
          </button>
        )}

        <div className={`flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-r-2xl transition-colors
          ${hasFilters ? 'text-milk-primary' : 'text-milk-text-muted'}`}>
          <Filter className="w-4 h-4" />
        </div>
      </div>

      {/* Focus-triggered filter panel */}
      {(focused || hasFilters) && (
        <div className="bg-white/50 backdrop-blur-md rounded-2xl border border-white/40 p-5 space-y-4
                        shadow-[0_8px_24px_rgba(51,34,27,0.04)] animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2 mb-1">
            <SlidersHorizontal className="w-3.5 h-3.5 text-milk-text-muted" />
            <span className="text-[11px] font-bold text-milk-text-muted tracking-widest">筛选条件</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Brand */}
            <div>
              <label className="block text-[10px] font-bold text-milk-text-muted tracking-widest mb-1.5 pl-1">
                品牌
              </label>
              <input type="text" value={brandFilter} onChange={(e) => setBrandFilter(e.target.value)}
                placeholder="一点点、喜茶..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/50 border border-white/40
                           text-[13px] text-milk-text placeholder:text-milk-text-muted tracking-wide
                           focus:outline-none focus:ring-2 focus:ring-milk-primary/15 focus:border-milk-primary/30 transition-all" />
            </div>

            {/* Date from */}
            <div>
              <label className="block text-[10px] font-bold text-milk-text-muted tracking-widest mb-1.5 pl-1">
                开始日期
              </label>
              <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/50 border border-white/40
                           text-[13px] text-milk-text tracking-wide
                           focus:outline-none focus:ring-2 focus:ring-milk-primary/15 focus:border-milk-primary/30 transition-all" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Date to */}
            <div>
              <label className="block text-[10px] font-bold text-milk-text-muted tracking-widest mb-1.5 pl-1">
                结束日期
              </label>
              <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/50 border border-white/40
                           text-[13px] text-milk-text tracking-wide
                           focus:outline-none focus:ring-2 focus:ring-milk-primary/15 focus:border-milk-primary/30 transition-all" />
            </div>

            {/* Clear */}
            {hasFilters && (
              <div className="flex items-end pb-1">
                <button
                  onClick={() => { setBrandFilter(''); setDateFrom(''); setDateTo('') }}
                  className="text-[12px] text-milk-text-muted hover:text-milk-primary transition-colors tracking-wide">
                  清除筛选
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
