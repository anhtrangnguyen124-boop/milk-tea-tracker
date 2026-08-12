import Dexie, { type EntityTable } from 'dexie'
import type { CookingEntry, Entry, EntryImage, JobEntry, JobReview, JournalEntry } from '@/types'

// Local Dexie database - replaces Supabase
const db = new Dexie('MilkTeaTracker') as Dexie & {
  entries: EntityTable<Entry, 'id'>
  entryImages: EntityTable<EntryImage, 'id'>
  journal: EntityTable<JournalEntry, 'id'>
  jobs: EntityTable<JobEntry, 'id'>
  jobReviews: EntityTable<JobReview, 'id'>
  cooking: EntityTable<CookingEntry, 'id'>
}

db.version(1).stores({
  entries: '++id, name, date, rating, isPinned, createdAt',
})

db.version(2).stores({
  entries: '++id, name, brand, date, rating, isPinned, createdAt',
})

db.version(3).stores({
  entries: '++id, name, brand, date, rating, isPinned, createdAt, price, colorTheme',
  journal: '++id, date, mood, createdAt',
  auth: 'email',
})

db.version(4).stores({
  entries: '++id, name, brand, date, rating, isPinned, createdAt, price, colorTheme, drinkCategory',
  journal: '++id, date, mood, createdAt',
  auth: 'email',
}).upgrade((tx) => tx.table('entries').toCollection().modify((entry: Entry) => {
  if (entry.drinkCategory === undefined) entry.drinkCategory = null
}))

db.version(5).stores({
  entries: '++id, name, brand, date, rating, isPinned, createdAt, price, colorTheme, drinkCategory',
  journal: '++id, date, mood, createdAt',
  auth: 'email',
}).upgrade((tx) => tx.table('entries').toCollection().modify((entry: Entry) => {
  if (entry.sweetness === undefined) entry.sweetness = null
  if (entry.ice === undefined) entry.ice = null
  if (entry.toppings === undefined) entry.toppings = []
  if (entry.repurchase === undefined) entry.repurchase = null
}))

// Local-first application: remove the unused local account store.
db.version(6).stores({
  entries: '++id, name, brand, date, rating, isPinned, createdAt, price, colorTheme, drinkCategory',
  journal: '++id, date, mood, createdAt',
  auth: null,
})

db.version(7).stores({
  entries: '++id, name, brand, date, rating, isPinned, createdAt, price, colorTheme, drinkCategory',
  entryImages: '++id, entryId, createdAt',
  journal: '++id, date, mood, createdAt',
}).upgrade((tx) => tx.table('entries').toCollection().modify((entry: Entry) => {
  if (entry.imageIds === undefined) entry.imageIds = []
}))

db.version(8).stores({
  entries: '++id, name, brand, date, rating, isPinned, createdAt, price, colorTheme, drinkCategory',
  entryImages: '++id, entryId, ownerType, createdAt',
  journal: '++id, date, mood, createdAt',
  jobs: '++id, company, position, date, status, channel, industry, deadline, createdAt',
  jobReviews: '++id, jobId, date, round, createdAt',
  cooking: '++id, name, date, category, createdAt',
}).upgrade((tx) => tx.table('entryImages').toCollection().modify((image: EntryImage) => {
  if (image.ownerType === undefined) image.ownerType = 'drink'
}))

export { db }
