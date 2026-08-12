import { create } from 'zustand'
import type { TimeRange, Entry, BgTheme } from '@/types'

export type ActiveTab = 'calendar' | 'explore' | 'journal' | 'jobs'

interface UIState {
  // Active tab
  activeTab: ActiveTab
  setActiveTab: (tab: ActiveTab) => void

  // Selected date on calendar
  selectedDate: string
  setSelectedDate: (date: string) => void

  // Time range filter (kept for internal use but no longer in UI)
  timeRange: TimeRange
  setTimeRange: (range: TimeRange) => void

  // Calendar navigation
  calendarMonth: Date
  setCalendarMonth: (date: Date) => void

  // Entry form modal
  isEntryFormOpen: boolean
  editingEntryId: number | null
  editingEntryData: Entry | null
  openEntryForm: (entryId?: number, entryData?: Entry) => void
  closeEntryForm: () => void

  // Search
  searchTerm: string
  setSearchTerm: (term: string) => void

  // Image viewer modal
  viewingImageUrl: string | null
  setViewingImageUrl: (url: string | null) => void

  // Delete confirmation
  deletingEntryId: number | null
  setDeletingEntryId: (id: number | null) => void

  // Confetti
  confetti: boolean
  setConfetti: (v: boolean) => void

  // Background theme
  bgTheme: BgTheme
  setBgTheme: (theme: BgTheme) => void

  // Journal form modal
  isJournalFormOpen: boolean
  journalEditId: number | null
  openJournalForm: (id?: number) => void
  closeJournalForm: () => void
}

export const useUIStore = create<UIState>((set) => ({
  activeTab: 'calendar',
  setActiveTab: (tab) => set({ activeTab: tab }),

  selectedDate: new Date().toISOString().split('T')[0],
  setSelectedDate: (date) => set({ selectedDate: date }),

  timeRange: '1month',
  setTimeRange: (range) => set({ timeRange: range }),

  calendarMonth: new Date(),
  setCalendarMonth: (date) => set({ calendarMonth: date }),

  isEntryFormOpen: false,
  editingEntryId: null,
  editingEntryData: null,
  openEntryForm: (entryId, entryData) =>
    set({ isEntryFormOpen: true, editingEntryId: entryId ?? null, editingEntryData: entryData ?? null }),
  closeEntryForm: () =>
    set({ isEntryFormOpen: false, editingEntryId: null, editingEntryData: null }),

  searchTerm: '',
  setSearchTerm: (term) => set({ searchTerm: term }),

  viewingImageUrl: null,
  setViewingImageUrl: (url) => set({ viewingImageUrl: url }),

  deletingEntryId: null,
  setDeletingEntryId: (id) => set({ deletingEntryId: id }),

  confetti: false,
  setConfetti: (v) => set({ confetti: v }),

  bgTheme: (typeof window !== 'undefined' && localStorage.getItem('bg_theme') as BgTheme)
    || 'warm',
  setBgTheme: (theme) => {
    localStorage.setItem('bg_theme', theme)
    set({ bgTheme: theme })
  },

  // Journal form modal
  isJournalFormOpen: false,
  journalEditId: null,
  openJournalForm: (id) =>
    set({ isJournalFormOpen: true, journalEditId: id ?? null }),
  closeJournalForm: () =>
    set({ isJournalFormOpen: false, journalEditId: null }),
}))
