export interface Entry {
  id: number
  name: string
  brand: string | null
  imageDataUrl: string | null
  date: string
  rating: number | null
  comment: string | null
  isPinned: boolean
  createdAt: Date
  updatedAt: Date
}

export type TimeRange = '3days' | '1week' | '2weeks' | '1month'

export interface NewEntry {
  name: string
  brand: string | null
  imageDataUrl: string | null
  date: string
  rating: number | null
  comment: string | null
}

export interface UpdateEntry {
  id: number
  name?: string
  brand?: string | null
  imageDataUrl?: string | null
  date?: string
  rating?: number | null
  comment?: string | null
  isPinned?: boolean
}
