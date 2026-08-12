import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, Search, PenLine, BriefcaseBusiness, Sparkles } from 'lucide-react'
import { useUIStore } from '@/store/uiStore'
import { useEntriesByDate, useSearchEntries } from '@/hooks/useEntries'
import { CalendarView } from '@/components/calendar/CalendarView'
import { EntryList } from '@/components/entries/EntryList'
import { EntryFormModal } from '@/components/entries/EntryFormModal'
import { AddEntryFAB } from './AddEntryFAB'
import { ImageViewer } from '@/components/entries/ImageViewer'
import { DeleteConfirmDialog } from '@/components/entries/DeleteConfirmDialog'
import { SearchBar } from '@/components/search/SearchBar'
import { PinnedSection } from '@/components/pinned/PinnedSection'
import { ThemeSwitcher } from '@/components/theme/ThemeSwitcher'
import { StatsDashboard } from '@/components/stats/StatsDashboard'
import { DailyQuote } from '@/components/stats/DailyQuote'
import { JournalTimeline } from '@/components/journal/JournalTimeline'
import { JournalFormModal } from '@/components/journal/JournalFormModal'
import { ToastContainer } from './ToastContainer'
import { JobStation } from '@/components/jobs/JobStation'

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

// Tab 1: Calendar + Entry List
function CalendarTab() {
  const { selectedDate, searchTerm, openEntryForm } = useUIStore()
  const { data: entries, isLoading } = useEntriesByDate(selectedDate)
  const { data: searchResults } = useSearchEntries(searchTerm)

  const displayEntries = useMemo(() => {
    if (searchTerm.trim()) return searchResults ?? []
    if (!entries) return []
    return entries.filter((e) => e.date === selectedDate)
  }, [searchTerm, searchResults, entries, selectedDate])

  return (
    <PageContainer
      main={
        <div className="space-y-5 h-full overflow-y-auto">
          <CalendarView />
          <StatsDashboard />
        </div>
      }
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
              <div className="flex items-center gap-2">
                <span className="text-xs text-milk-text-muted bg-milk-bg/60 px-2.5 py-1 rounded-full font-medium">
                  {displayEntries.length} 杯
                </span>
                <button
                  type="button"
                  onClick={() => openEntryForm()}
                  className="rounded-xl bg-milk-primary/8 px-2.5 py-1 text-xs font-semibold text-milk-primary
                             transition-colors hover:bg-milk-primary hover:text-white"
                >
                  为这一天补记
                </button>
              </div>
            </div>
          )}
          <EntryList entries={displayEntries} isLoading={isLoading} selectedDate={selectedDate} />
          <div className="mt-4">
            <DailyQuote />
          </div>
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

// Tab 3: Journal
function JournalTab() {
  return (
    <div className="h-full overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-milk-text tracking-wide">随想记录册</h2>
        <button
          onClick={() => useUIStore.getState().openJournalForm()}
          className="flex items-center gap-1.5 px-4 py-2 rounded-2xl
                     bg-milk-primary text-white font-semibold text-sm
                     hover:bg-milk-primary-dark active:scale-[0.98] transition-all
                     shadow-md shadow-milk-primary/10"
        >
          <PenLine className="w-4 h-4" />
          写想法
        </button>
      </div>
      <JournalTimeline />
    </div>
  )
}

export function MainLayout() {
  const { activeTab, setActiveTab } = useUIStore()
  const navigation = [
    { key: 'calendar' as const, label: '饮品记录', icon: Calendar },
    { key: 'journal' as const, label: '随想记录', icon: PenLine },
    { key: 'jobs' as const, label: '投递驿站', icon: BriefcaseBusiness },
    { key: 'explore' as const, label: '收藏与搜索', icon: Search },
  ]

  return (
    <div className="h-screen flex flex-col bg-milk-bg overflow-hidden">
      <header className="flex-shrink-0 border-b border-milk-border/70 bg-white/75 backdrop-blur-xl">
        <div className="h-16 max-w-[1440px] mx-auto px-6 flex items-center justify-between gap-6 drag-region">
          <div className="flex items-center gap-3 min-w-max no-drag">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-[#1E7CC1] to-[#0E5596] text-white flex items-center justify-center shadow-sm">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-wide text-[#124F86]">人间小事档案馆</h1>
              <p className="text-[10px] text-milk-text-muted tracking-wide">把日常认真收藏起来</p>
            </div>
          </div>

          <nav className="flex items-center gap-1 no-drag overflow-x-auto" aria-label="主要功能">
            {navigation.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                type="button"
                onClick={() => setActiveTab(key)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl whitespace-nowrap text-sm font-semibold transition-colors
                  ${activeTab === key
                    ? 'bg-[#E8F3FC] text-[#1671B7]'
                    : 'text-milk-text-secondary hover:bg-milk-bg hover:text-milk-text'}`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2 min-w-max no-drag">
            <span className="hidden sm:inline text-[11px] text-milk-text-muted bg-milk-bg px-2.5 py-1 rounded-full font-medium">本地存储</span>
            <ThemeSwitcher />
          </div>
        </div>
      </header>

      {/* Content area */}
      <main className="flex-1 w-full max-w-[1440px] mx-auto px-6 py-5 overflow-hidden">
        <AnimatePresence mode="wait">
          {activeTab === 'calendar' && (
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
          )}
          {activeTab === 'explore' && (
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
          {activeTab === 'journal' && (
            <motion.div
              key="journal"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              <JournalTab />
            </motion.div>
          )}
          {activeTab === 'jobs' && (
            <motion.div key="jobs" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} transition={{ duration: 0.2 }} className="h-full">
              <JobStation />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Modals & overlays */}
      <AddEntryFAB />
      <EntryFormModal />
      <JournalFormModal />
      <ImageViewer />
      <DeleteConfirmDialog />
      <ToastContainer />
    </div>
  )
}
