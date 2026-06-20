import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, Search } from 'lucide-react'
import { useUIStore } from '@/store/uiStore'
import type { ActiveTab } from '@/store/uiStore'
import { useEntries, useSearchEntries } from '@/hooks/useEntries'
import { CalendarView } from '@/components/calendar/CalendarView'
import { EntryList } from '@/components/entries/EntryList'
import { EntryFormModal } from '@/components/entries/EntryFormModal'
import { AddEntryFAB } from './AddEntryFAB'
import { ImageViewer } from '@/components/entries/ImageViewer'
import { DeleteConfirmDialog } from '@/components/entries/DeleteConfirmDialog'
import { SearchBar } from '@/components/search/SearchBar'
import { PinnedSection } from '@/components/pinned/PinnedSection'
import { ToastContainer } from './ToastContainer'

// Glass card
function GlassCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white/30 backdrop-blur-lg rounded-3xl border border-white/40
                     shadow-[0_8px_32px_rgba(51,34,27,0.04)] ${className}`}>
      {children}
    </div>
  )
}

// Responsive grid: 70/30 desktop | 50/50 tablet | single-col mobile
function PageContainer({ main, sidebar }: { main: React.ReactNode; sidebar: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[70%_30%] gap-5 h-full">
      <div className="min-h-0 overflow-hidden">
        {main}
      </div>
      <div className="min-h-0 overflow-hidden">
        {sidebar}
      </div>
    </div>
  )
}

// Floating tab switch
function TabSwitch() {
  const { activeTab, setActiveTab } = useUIStore()

  return (
    <div className="fixed bottom-6 right-1/2 translate-x-1/2 z-50
                    bg-white/30 backdrop-blur-xl rounded-2xl border border-white/40
                    shadow-[0_12px_40px_rgba(51,34,27,0.08)] p-1.5 flex gap-1">
      {([
        { key: 'calendar' as ActiveTab, icon: Calendar, label: '打卡' },
        { key: 'explore' as ActiveTab, icon: Search, label: '探索' },
      ]).map(({ key, icon: Icon, label }) => (
        <button
          key={key}
          onClick={() => setActiveTab(key)}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold tracking-wide
            transition-all duration-200
            ${activeTab === key
              ? 'bg-milk-primary text-white shadow-md shadow-milk-primary/20'
              : 'text-milk-text-secondary hover:text-milk-text hover:bg-white/60'
            }`}
        >
          <Icon className="w-4 h-4" />
          {label}
        </button>
      ))}
    </div>
  )
}

// Tab 1: Calendar + Entry List
function CalendarTab() {
  const { timeRange, selectedDate, searchTerm } = useUIStore()
  const { data: entries, isLoading } = useEntries(timeRange)
  const { data: searchResults } = useSearchEntries(searchTerm)

  const displayEntries = useMemo(() => {
    if (searchTerm.trim()) return searchResults ?? []
    if (!entries) return []
    return entries.filter((e) => e.date === selectedDate)
  }, [searchTerm, searchResults, entries, selectedDate])

  return (
    <PageContainer
      main={<CalendarView />}
      sidebar={
        <GlassCard className="p-5 h-full overflow-y-auto">
          {searchTerm.trim() && (
            <div className="mb-4 px-4 py-2.5 rounded-2xl bg-milk-primary/8
                            text-sm text-milk-primary font-medium tracking-wide">
              搜索 "{searchTerm}" — {displayEntries.length} 条
            </div>
          )}
          {!searchTerm.trim() && (
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-milk-text-secondary tracking-wide">
                {selectedDate} 的记录
              </h3>
              <span className="text-xs text-milk-text-muted bg-milk-bg/60 px-2.5 py-1 rounded-full font-medium">
                {displayEntries.length} 杯
              </span>
            </div>
          )}
          <EntryList entries={displayEntries} isLoading={isLoading} />
        </GlassCard>
      }
    />
  )
}

// Tab 2: Search + Pinned
function ExploreTab() {
  return (
    <PageContainer
      main={
        <GlassCard className="p-6 h-full overflow-y-auto">
          <h3 className="text-sm font-bold text-milk-text tracking-wide mb-4">搜索奶茶</h3>
          <SearchBar />
        </GlassCard>
      }
      sidebar={
        <GlassCard className="p-6 h-full overflow-y-auto">
          <PinnedSection />
        </GlassCard>
      }
    />
  )
}

export function MainLayout() {
  const { activeTab } = useUIStore()

  return (
    <div className="h-screen flex flex-col bg-milk-bg">
      {/* Header - glass */}
      <header className="h-14 flex items-center justify-between px-10 drag-region
                        border-b border-white/30 bg-white/20 backdrop-blur-xl flex-shrink-0">
        <div className="flex items-center gap-3 no-drag">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-milk-primary to-milk-primary-dark
                          flex items-center justify-center shadow-sm">
            <span className="text-base">🧋</span>
          </div>
          <h1 className="text-base font-bold text-milk-text tracking-wide">奶茶记录册</h1>
        </div>
        <span className="text-[10px] text-milk-text-muted bg-white/40 backdrop-blur-sm px-2.5 py-1
                         rounded-full font-medium tracking-wide no-drag">本地存储</span>
      </header>

      {/* Content area */}
      <div className="flex-1 px-10 py-6 overflow-hidden">
        <AnimatePresence mode="wait">
          {activeTab === 'calendar' ? (
            <motion.div
              key="calendar"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              <CalendarTab />
            </motion.div>
          ) : (
            <motion.div
              key="explore"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              <ExploreTab />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Floating Tab Switch */}
      <TabSwitch />

      {/* Modals & overlays */}
      <AddEntryFAB />
      <EntryFormModal />
      <ImageViewer />
      <DeleteConfirmDialog />
      <ToastContainer />
    </div>
  )
}
