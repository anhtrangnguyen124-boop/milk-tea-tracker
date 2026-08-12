import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { db } from '@/services/db'
import type { EntryImage } from '@/types'

const EMPTY_IMAGES: EntryImage[] = []

export function useEntryImageUrls(imageIds: number[]): string[] {
  const imageKey = imageIds.join(',')
  const { data: images = EMPTY_IMAGES } = useQuery({
    queryKey: ['entryImages', imageKey],
    queryFn: async () => (await db.entryImages.bulkGet(imageIds)).filter((image): image is NonNullable<typeof image> => image !== undefined),
    enabled: imageIds.length > 0,
  })
  const [urls, setUrls] = useState<string[]>([])

  useEffect(() => {
    const objectUrls = images.map((image) => URL.createObjectURL(image.blob))
    setUrls(objectUrls)
    return () => objectUrls.forEach((url) => URL.revokeObjectURL(url))
  }, [images])

  return urls
}
