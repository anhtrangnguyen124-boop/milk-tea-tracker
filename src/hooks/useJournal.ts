import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { db } from '@/services/db'
import type { JournalEntry, NewJournalEntry, UpdateJournalEntry } from '@/types'

// Fetch all journal entries (sorted by createdAt desc)
export function useJournalEntries() {
  return useQuery({
    queryKey: ['journal', 'all'],
    queryFn: async () => {
      return db.journal
        .orderBy('createdAt')
        .reverse()
        .toArray()
    },
  })
}

// Create a new journal entry
export function useCreateJournalEntry() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (entry: NewJournalEntry) => {
      const now = new Date()
      const id = await db.journal.add({
        title: entry.title,
        content: entry.content,
        date: entry.date,
        mood: entry.mood,
        customMood: entry.customMood,
        paper: entry.paper,
        createdAt: now,
        updatedAt: now,
      } as JournalEntry)
      return { ...entry, id } as JournalEntry
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journal'] })
    },
  })
}

// Update an existing journal entry
export function useUpdateJournalEntry() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (entry: UpdateJournalEntry) => {
      const updates: Record<string, unknown> = { updatedAt: new Date() }
      if (entry.title !== undefined) updates.title = entry.title
      if (entry.content !== undefined) updates.content = entry.content
      if (entry.date !== undefined) updates.date = entry.date
      if (entry.mood !== undefined) updates.mood = entry.mood
      if (entry.customMood !== undefined) updates.customMood = entry.customMood
      if (entry.paper !== undefined) updates.paper = entry.paper

      await db.journal.update(entry.id, updates)
      return entry
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journal'] })
    },
  })
}

// Delete a journal entry
export function useDeleteJournalEntry() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (entryId: number) => {
      await db.journal.delete(entryId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journal'] })
    },
  })
}
