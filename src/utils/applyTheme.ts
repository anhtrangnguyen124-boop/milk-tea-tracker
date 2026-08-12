import { PALETTES } from '@/constants/themePalettes'
import type { BgTheme } from '@/types'

export function applyTheme(theme: BgTheme): void {
  const p = PALETTES[theme]

  // Apply body background
  document.body.style.background = p.body
  document.body.style.backgroundAttachment = 'fixed'

  // Apply CSS variables to :root
  const root = document.documentElement
  Object.keys(p).forEach((k) => {
    if (k.startsWith('--')) {
      root.style.setProperty(k, p[k as keyof typeof p] as string)
    }
  })
}
