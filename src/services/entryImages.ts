import { db } from '@/services/db'
import type { EntryImage } from '@/types'

export async function saveEntryImages(
  entryId: number,
  blobs: Blob[],
  ownerType: EntryImage['ownerType'] = 'drink',
): Promise<number[]> {
  if (blobs.length === 0) return []

  const now = new Date()
  return db.entryImages.bulkAdd(
    blobs.map((blob) => ({
      entryId,
      ownerType,
      blob,
      mimeType: blob.type || 'image/jpeg',
      createdAt: now,
    }) as EntryImage),
    { allKeys: true },
  ) as Promise<number[]>
}

export async function deleteEntryImages(imageIds: number[]): Promise<void> {
  if (imageIds.length > 0) await db.entryImages.bulkDelete(imageIds)
}
