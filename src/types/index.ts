// ── Entry Types ──────────────────────────────────────────

export type ColorTheme = 'orange' | 'peach' | 'matcha' | 'taro' | 'sea'
export type DrinkCategory = '奶茶' | '咖啡' | '果茶' | '纯茶' | '饮料' | '其他'
export type Sweetness = '无糖' | '三分糖' | '五分糖' | '七分糖' | '全糖'
export type IceLevel = '热' | '去冰' | '少冰' | '正常冰'
export type Topping = '珍珠' | '椰果' | '奶盖' | '芋泥' | '布丁' | '仙草'
export type Repurchase = '是' | '否'

export interface Entry {
  id: number
  name: string
  brand: string | null
  imageDataUrl: string | null   // @deprecated — migrated to images[] in Phase 2
  images: string[]              // multi-image support (Phase 2)
  imageIds: number[]            // Blob images stored in the entryImages table
  date: string
  rating: number | null
  comment: string | null
  price: number | null
  colorTheme: ColorTheme | null
  drinkCategory: DrinkCategory | null
  sweetness: Sweetness | null
  ice: IceLevel | null
  toppings: Topping[]
  repurchase: Repurchase | null
  isPinned: boolean
  createdAt: Date
  updatedAt: Date
}

export type TimeRange = '3days' | '1week' | '2weeks' | '1month'

export interface NewEntry {
  name: string
  brand: string | null
  imageDataUrl?: string | null   // @deprecated
  images?: string[]              // Phase 2
  imageIds?: number[]
  date: string
  rating: number | null
  comment: string | null
  price?: number | null
  colorTheme?: ColorTheme | null
  drinkCategory?: DrinkCategory | null
  sweetness?: Sweetness | null
  ice?: IceLevel | null
  toppings?: Topping[]
  repurchase?: Repurchase | null
}

export interface UpdateEntry {
  id: number
  name?: string
  brand?: string | null
  imageDataUrl?: string | null   // @deprecated
  images?: string[]              // Phase 2
  imageIds?: number[]
  date?: string
  rating?: number | null
  comment?: string | null
  price?: number | null
  colorTheme?: ColorTheme | null
  drinkCategory?: DrinkCategory | null
  sweetness?: Sweetness | null
  ice?: IceLevel | null
  toppings?: Topping[]
  repurchase?: Repurchase | null
  isPinned?: boolean
}

export interface EntryImage {
  id: number
  entryId: number
  ownerType: 'drink' | 'job' | 'cooking'
  blob: Blob
  mimeType: string
  createdAt: Date
}

// ── Job Tracker Types ───────────────────────────────────

export type JobStatus = 'wishlist' | 'applied' | 'assessment' | 'interview' | 'offer' | 'rejected'
export type InterviewRound = '一面' | '二面' | '三面' | 'HR面' | '群面' | '其他'

export interface JobEntry {
  id: number
  company: string
  position: string
  date: string
  status: JobStatus
  channel: string
  industry: string
  jdContent: string
  jdImageIds: number[]
  applyUrl: string
  salary: string
  deadline: string | null
  notes: string
  createdAt: Date
  updatedAt: Date
}

export interface JobReview {
  id: number
  jobId: number
  round: InterviewRound
  date: string
  rating: number
  numericScore: number | null
  questions: string
  summary: string
  createdAt: Date
  updatedAt: Date
}

// ── Cooking Types ───────────────────────────────────────

export type CookingCategory = '素菜' | '荤菜' | '汤' | '甜品'

export interface CookingEntry {
  id: number
  name: string
  date: string
  category: CookingCategory
  pinColor: string
  noteColor: string | null
  photoIds: number[]
  recipe: string
  tutorialUrl: string
  ingredients: string
  notes: string
  createdAt: Date
  updatedAt: Date
}

// ── Journal Types ────────────────────────────────────────

export type JournalMood = 'happy' | 'sad' | 'anxious' | 'peaceful' | 'excited'
  | 'grateful' | 'inspired' | 'thoughtful' | 'custom'

export type PaperTexture = 'grid' | 'lined' | 'dot' | 'blank'

export interface JournalEntry {
  id: number
  title: string | null
  content: string
  date: string
  mood: JournalMood
  customMood: string | null
  paper: PaperTexture
  createdAt: Date
  updatedAt: Date
}

export interface NewJournalEntry {
  title: string | null
  content: string
  date: string
  mood: JournalMood
  customMood: string | null
  paper: PaperTexture
}

export interface UpdateJournalEntry {
  id: number
  title?: string | null
  content?: string
  date?: string
  mood?: JournalMood
  customMood?: string | null
  paper?: PaperTexture
}

// ── Theme Types ──────────────────────────────────────────

export type BgTheme = 'warm' | 'mint' | 'lavender' | 'sky' | 'sunshine'

export interface BgThemePalette {
  body: string
  dot: string
  '--accent-50': string
  '--accent-100': string
  '--accent-400': string
  '--accent-500': string
  '--accent-600': string
  '--accent-700': string
  '--accent-900': string
  '--glow-color': string
  '--shadow-rgb': string
}

// ── Mood / Quote ─────────────────────────────────────────

export interface MoodPreset {
  key: JournalMood
  emoji: string
  label: string
}

export interface DrinkQuote {
  text: string
  emoji: string
}
