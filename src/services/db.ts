import Dexie, { type EntityTable } from 'dexie'
import type { Entry } from '@/types'

// Local Dexie database - replaces Supabase
const db = new Dexie('MilkTeaTracker') as Dexie & {
  entries: EntityTable<Entry, 'id'>
}

db.version(1).stores({
  entries: '++id, name, date, rating, isPinned, createdAt',
})

db.version(2).stores({
  entries: '++id, name, brand, date, rating, isPinned, createdAt',
})

export { db }
