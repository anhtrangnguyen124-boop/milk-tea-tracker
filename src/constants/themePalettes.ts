import type { BgTheme, BgThemePalette } from '@/types'

export const PALETTES: Record<BgTheme, BgThemePalette> = {
  warm: {
    body: 'linear-gradient(160deg, #FFF5F0 0%, #FFF0EB 40%, #FDE8E0 100%)',
    dot: '#D4687A',
    '--accent-50': '#FFF5F6',
    '--accent-100': '#FFE8EB',
    '--accent-400': '#E87888',
    '--accent-500': '#D4687A',
    '--accent-600': '#B85263',
    '--accent-700': '#943E4E',
    '--accent-900': '#4A1E28',
    '--glow-color': '#FFB8C4',
    '--shadow-rgb': '212,104,122',
  },
  mint: {
    body: 'linear-gradient(160deg, #F5FBF7 0%, #EDF7F0 40%, #E0F2E8 100%)',
    dot: '#5BA88C',
    '--accent-50': '#F2FAF5',
    '--accent-100': '#DFF2E8',
    '--accent-400': '#78C9A5',
    '--accent-500': '#5BA88C',
    '--accent-600': '#4A9176',
    '--accent-700': '#3A735D',
    '--accent-900': '#1E3A2E',
    '--glow-color': '#A8DFC7',
    '--shadow-rgb': '91,168,140',
  },
  lavender: {
    body: 'linear-gradient(160deg, #F8F6FC 0%, #F2EEFA 40%, #E8E2F7 100%)',
    dot: '#8B7EC8',
    '--accent-50': '#F7F5FC',
    '--accent-100': '#EDE8F8',
    '--accent-400': '#A598DA',
    '--accent-500': '#8B7EC8',
    '--accent-600': '#7568B5',
    '--accent-700': '#5C5090',
    '--accent-900': '#2E2848',
    '--glow-color': '#C4BBE8',
    '--shadow-rgb': '139,126,200',
  },
  sky: {
    body: 'linear-gradient(160deg, #F5F9FB 0%, #EDF5FA 40%, #E0EDF7 100%)',
    dot: '#5B9EC8',
    '--accent-50': '#F2F7FB',
    '--accent-100': '#E0EDF7',
    '--accent-400': '#78B5DA',
    '--accent-500': '#5B9EC8',
    '--accent-600': '#4A86B5',
    '--accent-700': '#3A6B90',
    '--accent-900': '#1E3548',
    '--glow-color': '#A8D3E8',
    '--shadow-rgb': '91,158,200',
  },
  sunshine: {
    body: 'linear-gradient(160deg, #FFFDF5 0%, #FFF9E0 40%, #FFF3C0 100%)',
    dot: '#D4A830',
    '--accent-50': '#FFFDF5',
    '--accent-100': '#FFF9D4',
    '--accent-400': '#E8C845',
    '--accent-500': '#D4A830',
    '--accent-600': '#B8901E',
    '--accent-700': '#8B6E14',
    '--accent-900': '#4A3A08',
    '--glow-color': '#F0E080',
    '--shadow-rgb': '212,168,48',
  },
}

export const THEME_ORDER: BgTheme[] = ['warm', 'mint', 'lavender', 'sky', 'sunshine']

export const THEME_LABELS: Record<BgTheme, string> = {
  warm: '暖橘',
  mint: '薄荷',
  lavender: '薰衣草',
  sky: '天空',
  sunshine: '暖阳',
}

export const DEFAULT_THEME: BgTheme = 'warm'
