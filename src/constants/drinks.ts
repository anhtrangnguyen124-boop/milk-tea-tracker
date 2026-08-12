import type { DrinkCategory } from '@/types'

export const DRINK_CATEGORY_OPTIONS: { value: DrinkCategory; label: string; emoji: string }[] = [
  { value: '奶茶', label: '奶茶', emoji: '🧋' },
  { value: '咖啡', label: '咖啡', emoji: '☕️' },
  { value: '果茶', label: '果茶', emoji: '🍑' },
  { value: '纯茶', label: '纯茶', emoji: '🍵' },
  { value: '饮料', label: '饮料', emoji: '🥤' },
  { value: '其他', label: '其他', emoji: '✨' },
]

export const DRINK_CATEGORY_LABELS = Object.fromEntries(
  DRINK_CATEGORY_OPTIONS.map(({ value, label, emoji }) => [value, `${emoji} ${label}`]),
) as Record<DrinkCategory, string>

export const SWEETNESS_OPTIONS = ['无糖', '三分糖', '五分糖', '七分糖', '全糖'] as const
export const ICE_OPTIONS = ['热', '去冰', '少冰', '正常冰'] as const
export const TOPPING_OPTIONS = ['珍珠', '椰果', '奶盖', '芋泥', '布丁', '仙草'] as const
