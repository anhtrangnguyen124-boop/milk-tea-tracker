import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { db } from '@/services/db'
import { deleteEntryImages } from '@/services/entryImages'
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

// Fetch all entries for one specific calendar day, including historical dates.
export function useEntriesByDate(date: string) {
  return useQuery({
    queryKey: ['entries', 'date', date],
    queryFn: async () => db.entries.where('date').equals(date).toArray(),
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
        imageDataUrl: entry.imageDataUrl ?? (entry.images?.[0] ?? null),
        images: entry.images ?? (entry.imageDataUrl ? [entry.imageDataUrl] : []),
        imageIds: entry.imageIds ?? [],
        date: entry.date,
        rating: entry.rating,
        comment: entry.comment,
        price: entry.price ?? null,
        colorTheme: entry.colorTheme ?? null,
        drinkCategory: entry.drinkCategory ?? null,
        sweetness: entry.sweetness ?? null,
        ice: entry.ice ?? null,
        toppings: entry.toppings ?? [],
        repurchase: entry.repurchase ?? null,
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const updates: Record<string, any> = { updatedAt: new Date() }
      if (entry.name !== undefined) updates.name = entry.name
      if (entry.brand !== undefined) updates.brand = entry.brand
      if (entry.imageDataUrl !== undefined) updates.imageDataUrl = entry.imageDataUrl
      if (entry.images !== undefined) updates.images = entry.images
      if (entry.imageIds !== undefined) updates.imageIds = entry.imageIds
      if (entry.date !== undefined) updates.date = entry.date
      if (entry.rating !== undefined) updates.rating = entry.rating
      if (entry.comment !== undefined) updates.comment = entry.comment
      if (entry.price !== undefined) updates.price = entry.price
      if (entry.colorTheme !== undefined) updates.colorTheme = entry.colorTheme
      if (entry.drinkCategory !== undefined) updates.drinkCategory = entry.drinkCategory
      if (entry.sweetness !== undefined) updates.sweetness = entry.sweetness
      if (entry.ice !== undefined) updates.ice = entry.ice
      if (entry.toppings !== undefined) updates.toppings = entry.toppings
      if (entry.repurchase !== undefined) updates.repurchase = entry.repurchase
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
      const entry = await db.entries.get(entryId)
      if (entry?.imageIds?.length) await deleteEntryImages(entry.imageIds)
      await db.entries.delete(entryId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entries'] })
    },
  })
}
