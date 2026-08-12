import { db } from '@/services/db'
import type { CookingEntry, Entry, EntryImage, JobEntry, JobReview, JournalEntry } from '@/types'

const DRINK_CATEGORIES: NonNullable<Entry['drinkCategory']>[] = [
  '奶茶', '咖啡', '果茶', '纯茶', '饮料', '其他',
]
const SWEETNESS_OPTIONS: NonNullable<Entry['sweetness']>[] = ['无糖', '三分糖', '五分糖', '七分糖', '全糖']
const ICE_OPTIONS: NonNullable<Entry['ice']>[] = ['热', '去冰', '少冰', '正常冰']
const TOPPING_OPTIONS: Entry['toppings'][number][] = ['珍珠', '椰果', '奶盖', '芋泥', '布丁', '仙草']
const REPURCHASE_OPTIONS: NonNullable<Entry['repurchase']>[] = ['是', '否']

function getDrinkCategory(value: unknown): Entry['drinkCategory'] {
  return typeof value === 'string' && DRINK_CATEGORIES.includes(value as NonNullable<Entry['drinkCategory']>)
    ? value as Entry['drinkCategory']
    : null
}

function getOption<T extends string>(value: unknown, options: readonly T[]): T | null {
  return typeof value === 'string' && options.includes(value as T) ? value as T : null
}

function getToppings(value: unknown): Entry['toppings'] {
  return Array.isArray(value)
    ? value.filter((item): item is Entry['toppings'][number] => TOPPING_OPTIONS.includes(item))
    : []
}

const JOB_STATUSES: JobEntry['status'][] = ['wishlist', 'applied', 'assessment', 'interview', 'offer', 'rejected']
const COOKING_CATEGORIES: CookingEntry['category'][] = ['素菜', '荤菜', '汤', '甜品']

function getJobStatus(value: unknown): JobEntry['status'] {
  return getOption(value, JOB_STATUSES) ?? 'applied'
}

function getCookingCategory(value: unknown): CookingEntry['category'] {
  return getOption(value, COOKING_CATEGORIES) ?? '素菜'
}

async function migrateLegacyImages(
  entryId: number,
  ownerType: EntryImage['ownerType'],
  values: unknown,
): Promise<number[]> {
  if (!Array.isArray(values)) return []
  const blobs = await Promise.all(values.filter((value): value is string => typeof value === 'string').map(async (dataUrl) => {
    try {
      return await (await fetch(dataUrl)).blob()
    } catch {
      return null
    }
  }))
  const validBlobs = blobs.filter((blob): blob is Blob => blob !== null)
  if (validBlobs.length === 0) return []
  const now = new Date()
  return db.entryImages.bulkAdd(validBlobs.map((blob) => ({
    entryId,
    ownerType,
    blob,
    mimeType: blob.type || 'image/jpeg',
    createdAt: now,
  }) as EntryImage), { allKeys: true }) as Promise<number[]>
}

function getLegacyKey(base: string): string {
  const activeEmail = localStorage.getItem('mt-active-email')
  return activeEmail ? `${base}_${activeEmail}` : base
}

async function readLegacyData(base: string): Promise<unknown | null> {
  const key = getLegacyKey(base)
  const localData = localStorage.getItem(key)
  if (localData) {
    try {
      return JSON.parse(localData)
    } catch {
      return null
    }
  }

  // The standalone prototype eventually moved its localStorage data into this DB.
  if (!('databases' in indexedDB)) return null
  const databases = await indexedDB.databases()
  if (!databases.some((database) => database.name === 'milktea_db')) return null

  return new Promise((resolve) => {
    const request = indexedDB.open('milktea_db')
    request.onerror = () => resolve(null)
    request.onsuccess = () => {
      const legacyDb = request.result
      if (!legacyDb.objectStoreNames.contains('user_data')) {
        legacyDb.close()
        resolve(null)
        return
      }
      const transaction = legacyDb.transaction('user_data', 'readonly')
      const readRequest = transaction.objectStore('user_data').get(key)
      readRequest.onerror = () => resolve(null)
      readRequest.onsuccess = () => {
        const result = readRequest.result as { data?: unknown } | undefined
        legacyDb.close()
        resolve(result?.data ?? null)
      }
    }
  })
}

// Migrate from old localStorage keys to Dexie IndexedDB
export async function migrateFromLocalStorage(): Promise<{
  entries: number
  journal: number
  jobs: number
  reviews: number
  cooking: number
}> {
  const result = { entries: 0, journal: 0, jobs: 0, reviews: 0, cooking: 0 }

  // Each module migrates independently so existing React data never blocks an
  // import of a still-unmigrated legacy module.
  const entryCount = await db.entries.count()
  const journalCount = await db.journal.count()
  const jobCount = await db.jobs.count()
  const reviewCount = await db.jobReviews.count()
  const cookingCount = await db.cooking.count()

  try {
    // Migrate entries from the standalone prototype's browser storage.
    const legacyEntries = await readLegacyData('milktea_v10')
    if (entryCount === 0 && legacyEntries) {
      const parsed = legacyEntries
      if (Array.isArray(parsed) && parsed.length > 0) {
        const entries: Entry[] = parsed.map((e: Record<string, unknown>) => ({
          id: e.id as number,
          name: e.name as string,
          brand: (e.brand as string) ?? null,
          imageDataUrl: (e.imageDataUrl as string) ?? (Array.isArray(e.images) && e.images.length > 0 ? e.images[0] : null),
          images: (Array.isArray(e.images) ? e.images : (e.imageDataUrl ? [e.imageDataUrl] : [])) as string[],
          imageIds: [],
          date: e.date as string,
          rating: (e.rating as number) ?? null,
          comment: (e.comment as string) ?? null,
          price: (e.price as number) ?? null,
          colorTheme: (e.colorTheme as Entry['colorTheme']) ?? (e.theme as Entry['colorTheme']) ?? null,
          drinkCategory: getDrinkCategory(e.drinkCategory ?? e.drinkType),
          sweetness: getOption(e.sweetness, SWEETNESS_OPTIONS),
          ice: getOption(e.ice, ICE_OPTIONS),
          toppings: getToppings(e.toppings),
          repurchase: getOption(e.repurchase, REPURCHASE_OPTIONS),
          isPinned: (e.isPinned as boolean) ?? false,
          createdAt: new Date((e.createdAt as number) ?? Date.now()),
          updatedAt: new Date((e.updatedAt as number) ?? Date.now()),
        }))
        await db.entries.bulkAdd(entries)
        result.entries = entries.length
      }
    }

    // Migrate journal entries from the standalone prototype's browser storage.
    const legacyJournal = await readLegacyData('journal_v1')
    if (journalCount === 0 && legacyJournal) {
      const parsed = legacyJournal
      if (Array.isArray(parsed) && parsed.length > 0) {
        const journals: JournalEntry[] = parsed.map((e: Record<string, unknown>) => ({
          id: e.id as number,
          title: (e.title as string) ?? null,
          content: e.content as string,
          date: e.date as string,
          mood: (e.mood as JournalEntry['mood']) ?? 'happy',
          customMood: (e.customMood as string) ?? null,
          paper: (e.paper as JournalEntry['paper']) ?? 'grid',
          createdAt: new Date((e.createdAt as number) ?? Date.now()),
          updatedAt: new Date((e.updatedAt as number) ?? Date.now()),
        }))
        await db.journal.bulkAdd(journals)
        result.journal = journals.length
      }
    }

    const legacyJobs = await readLegacyData('job_v1')
    if (jobCount === 0 && Array.isArray(legacyJobs) && legacyJobs.length > 0) {
      const jobs: JobEntry[] = legacyJobs.map((job: Record<string, unknown>) => ({
        id: job.id as number,
        company: (job.company as string) ?? '',
        position: (job.position as string) ?? '',
        date: (job.date as string) ?? new Date().toISOString().slice(0, 10),
        status: getJobStatus(job.status),
        channel: (job.channel as string) ?? '',
        industry: (job.industry as string) ?? '',
        jdContent: (job.jdContent as string) ?? '',
        jdImageIds: [],
        applyUrl: (job.applyUrl as string) ?? '',
        salary: (job.salary as string) ?? '',
        deadline: (job.deadline as string) || null,
        notes: (job.notes as string) ?? '',
        createdAt: new Date((job.createdAt as number) ?? Date.now()),
        updatedAt: new Date((job.updatedAt as number) ?? Date.now()),
      }))
      await db.jobs.bulkAdd(jobs)
      await Promise.all(jobs.map(async (job, index) => {
        const imageIds = await migrateLegacyImages(job.id, 'job', legacyJobs[index].jdImages)
        if (imageIds.length > 0) await db.jobs.update(job.id, { jdImageIds: imageIds })
      }))
      result.jobs = jobs.length
    }

    const legacyReviews = await readLegacyData('job_review_v1')
    if (reviewCount === 0 && Array.isArray(legacyReviews) && legacyReviews.length > 0) {
      const rounds: JobReview['round'][] = ['一面', '二面', '三面', 'HR面', '群面', '其他']
      const reviews: JobReview[] = legacyReviews.map((review: Record<string, unknown>) => ({
        id: review.id as number,
        jobId: review.jobId as number,
        round: getOption(review.round, rounds) ?? '一面',
        date: (review.date as string) ?? new Date().toISOString().slice(0, 10),
        rating: (review.rating as number) ?? 0,
        numericScore: (review.numericScore as number) ?? null,
        questions: (review.questions as string) ?? '',
        summary: (review.summary as string) ?? '',
        createdAt: new Date((review.createdAt as number) ?? Date.now()),
        updatedAt: new Date((review.updatedAt as number) ?? Date.now()),
      }))
      await db.jobReviews.bulkAdd(reviews)
      result.reviews = reviews.length
    }

    const legacyCooking = await readLegacyData('cooking_v1')
    if (cookingCount === 0 && Array.isArray(legacyCooking) && legacyCooking.length > 0) {
      const cookingEntries: CookingEntry[] = legacyCooking.map((item: Record<string, unknown>) => ({
        id: item.id as number,
        name: (item.name as string) ?? '',
        date: (item.date as string) ?? new Date().toISOString().slice(0, 10),
        category: getCookingCategory(item.category ?? item.cuisine),
        pinColor: (item.pinColor as string) ?? '#E85D75',
        noteColor: (item.noteColor as string) || null,
        photoIds: [],
        recipe: (item.recipe as string) ?? '',
        tutorialUrl: (item.tutorialUrl as string) ?? '',
        ingredients: (item.ingredients as string) ?? '',
        notes: (item.notes as string) ?? '',
        createdAt: new Date((item.createdAt as number) ?? Date.now()),
        updatedAt: new Date((item.updatedAt as number) ?? Date.now()),
      }))
      await db.cooking.bulkAdd(cookingEntries)
      await Promise.all(cookingEntries.map(async (item, index) => {
        const photoIds = await migrateLegacyImages(item.id, 'cooking', legacyCooking[index].photos)
        if (photoIds.length > 0) await db.cooking.update(item.id, { photoIds })
      }))
      result.cooking = cookingEntries.length
    }

    // Keep old localStorage data as backup (don't delete)
    console.log('[Migration] Completed:', result)
  } catch (err) {
    console.error('[Migration] Failed:', err)
  }

  return result
}
