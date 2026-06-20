import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { db } from '@/services/db'
import type { Entry, NewEntry, UpdateEntry, TimeRange } from '@/types'
import { subDays } from 'date-fns'

function getDateRange(timeRange: TimeRange): { start: string; end: string } {
  const now = new Date()
  const endDate = now.toISOString().split('T')[0]
  let days: number
  switch (timeRange) {
    case '3days': days = 3; break
    case '1week': days = 7; break
    case '2weeks': days = 14; break
    case '1month': days = 30; break
    default: days = 14
  }
  const startDate = subDays(now, days).toISOString().split('T')[0]
  return { start: startDate, end: endDate }
}

// Fetch entries within a time range
export function useEntries(timeRange: TimeRange) {
  const { start, end } = getDateRange(timeRange)

  return useQuery({
    queryKey: ['entries', 'range', timeRange],
    queryFn: async () => {
      return db.entries
        .where('date')
        .between(start, end, true, true)
        .reverse()
        .sortBy('date')
    },
  })
}

// Fetch all entries for a month
export function useMonthEntries(year: number, month: number) {
  const start = `${year}-${String(month + 1).padStart(2, '0')}-01`
  const end = `${year}-${String(month + 1).padStart(2, '0')}-31`

  return useQuery({
    queryKey: ['entries', 'month', year, month],
    queryFn: async () => {
      return db.entries
        .where('date')
        .between(start, end, true, true)
        .toArray()
    },
  })
}

// Fetch pinned entries
export function usePinnedEntries() {
  return useQuery({
    queryKey: ['entries', 'pinned'],
    queryFn: async () => {
      return db.entries.filter(e => e.isPinned === true).reverse().sortBy('date')
    },
  })
}

// Search entries by name
export function useSearchEntries(term: string) {
  return useQuery({
    queryKey: ['entries', 'search', term],
    queryFn: async () => {
      if (!term.trim()) return [] as Entry[]
      const all = await db.entries.orderBy('date').reverse().toArray()
      const t = term.toLowerCase()
      return all.filter((e) =>
        e.name.toLowerCase().includes(t) ||
        (e.brand && e.brand.toLowerCase().includes(t))
      )
    },
    enabled: term.trim().length > 0,
  })
}

// Create a new entry
export function useCreateEntry() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (entry: NewEntry) => {
      const now = new Date()
      const id = await db.entries.add({
        name: entry.name,
        brand: entry.brand,
        imageDataUrl: entry.imageDataUrl,
        date: entry.date,
        rating: entry.rating,
        comment: entry.comment,
        isPinned: false,
        createdAt: now,
        updatedAt: now,
      } as Entry)
      return { ...entry, id } as Entry
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entries'] })
    },
  })
}

// Update an existing entry
export function useUpdateEntry() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (entry: UpdateEntry) => {
      const updates: Record<string, unknown> = { updatedAt: new Date() }
      if (entry.name !== undefined) updates.name = entry.name
      if (entry.brand !== undefined) updates.brand = entry.brand
      if (entry.imageDataUrl !== undefined) updates.imageDataUrl = entry.imageDataUrl
      if (entry.date !== undefined) updates.date = entry.date
      if (entry.rating !== undefined) updates.rating = entry.rating
      if (entry.comment !== undefined) updates.comment = entry.comment
      if (entry.isPinned !== undefined) updates.isPinned = entry.isPinned

      await db.entries.update(entry.id, updates)
      return entry
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entries'] })
    },
  })
}

// Delete an entry
export function useDeleteEntry() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (entryId: number) => {
      await db.entries.delete(entryId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entries'] })
    },
  })
}
