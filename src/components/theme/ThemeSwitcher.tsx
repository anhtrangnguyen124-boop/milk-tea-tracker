import { useUIStore } from '@/store/uiStore'
import { THEME_ORDER, THEME_LABELS, PALETTES } from '@/constants/themePalettes'
import type { BgTheme } from '@/types'

export function ThemeSwitcher() {
  const bgTheme = useUIStore((s) => s.bgTheme)
  const setBgTheme = useUIStore((s) => s.setBgTheme)

  return (
    <div className="flex items-center gap-1.5">
      {THEME_ORDER.map((theme) => {
        const isActive = bgTheme === theme
        const palette = PALETTES[theme]
        return (
          <button
            key={theme}
            title={THEME_LABELS[theme]}
            onClick={() => setBgTheme(theme)}
            className={`w-5 h-5 rounded-full transition-all duration-200
              hover:scale-125 active:scale-90 cursor-pointer
              ${isActive
                ? 'ring-2 ring-offset-1 scale-110'
                : 'ring-1 ring-gray-200/50 hover:ring-gray-300'
              }`}
            style={{
              background: `linear-gradient(135deg, ${palette['--accent-100']}, ${palette['--accent-500']})`,
              ...(isActive ? {
                '--tw-ring-color': palette['--accent-500'] as string,
              } as React.CSSProperties : {}),
            }}
          />
        )
      })}
    </div>
  )
}
