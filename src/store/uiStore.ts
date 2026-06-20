import { create } from 'zustand'
import type { TimeRange } from '@/types'

export type ActiveTab = 'calendar' | 'explore'

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
  openEntryForm: (entryId?: number) => void
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
  openEntryForm: (entryId) =>
    set({ isEntryFormOpen: true, editingEntryId: entryId ?? null }),
  closeEntryForm: () =>
    set({ isEntryFormOpen: false, editingEntryId: null }),

  searchTerm: '',
  setSearchTerm: (term) => set({ searchTerm: term }),

  viewingImageUrl: null,
  setViewingImageUrl: (url) => set({ viewingImageUrl: url }),

  deletingEntryId: null,
  setDeletingEntryId: (id) => set({ deletingEntryId: id }),
}))
