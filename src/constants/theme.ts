/**
 * Design Token — JS/TS 侧 Token 映射
 *
 * 与 src/styles/design-tokens.css 保持同步。
 * 所有组件通过本文件引用设计值，禁止直接硬编码颜色/间距/圆角等。
 *
 * 用法:
 *   import { themeTokens } from '@/constants/theme'
 *   el.style.color = themeTokens.colors.primary
 */

export const themeTokens = {
  /* ============================================================
     Colors — Brand
     ============================================================ */
  colors: {
    // 品牌主色
    primary:       'var(--color-milk-primary)'       as string,  // #C86A4B
    primaryLight:  'var(--color-milk-primary-light)' as string,  // #E8B8A2
    primaryDark:   'var(--color-milk-primary-dark)'  as string,  // #A0523A
    accent:        'var(--color-milk-accent)'        as string,  // #E8A838
    pin:           'var(--color-milk-pin)'           as string,  // #D4894A
    danger:        'var(--color-milk-danger)'        as string,  // #D35B4B

    // 品牌色透明度变体
    primaryAlpha50:  'var(--color-milk-primary-50)'  as string,
    primaryAlpha100: 'var(--color-milk-primary-100)' as string,
    primaryAlpha200: 'var(--color-milk-primary-200)' as string,
    primaryAlpha300: 'var(--color-milk-primary-300)' as string,
    accentAlpha50:   'var(--color-milk-accent-50)'   as string,
    accentAlpha100:  'var(--color-milk-accent-100)'  as string,
    accentAlpha200:  'var(--color-milk-accent-200)'  as string,
    dangerAlpha50:   'var(--color-milk-danger-50)'   as string,
    dangerAlpha100:  'var(--color-milk-danger-100)'  as string,

    // 灰度
    gray50:  'var(--color-milk-gray-50)'  as string,
    gray100: 'var(--color-milk-gray-100)' as string,
    gray200: 'var(--color-milk-gray-200)' as string,
    gray300: 'var(--color-milk-gray-300)' as string,
    gray400: 'var(--color-milk-gray-400)' as string,
    gray500: 'var(--color-milk-gray-500)' as string,
    gray600: 'var(--color-milk-gray-600)' as string,
    gray700: 'var(--color-milk-gray-700)' as string,
    gray800: 'var(--color-milk-gray-800)' as string,
    gray900: 'var(--color-milk-gray-900)' as string,

    // 语义色
    bg:             'var(--color-milk-bg)'             as string,
    card:           'var(--color-milk-card)'           as string,
    sidebar:        'var(--color-milk-sidebar)'        as string,
    text:           'var(--color-milk-text)'           as string,
    textSecondary:  'var(--color-milk-text-secondary)' as string,
    textMuted:      'var(--color-milk-text-muted)'     as string,
    border:         'var(--color-milk-border)'         as string,
    divider:        'var(--color-milk-divider)'        as string,

    // 表单
    inputBg:        'var(--color-milk-input-bg)'       as string,
    inputBorder:    'var(--color-milk-input-border)'   as string,
    inputFocus:     'var(--color-milk-input-focus)'    as string,
    placeholder:    'var(--color-milk-placeholder)'    as string,

    // 交互态
    hover:          'var(--color-milk-hover)'          as string,
    active:         'var(--color-milk-active)'         as string,
    disabled:       'var(--color-milk-disabled)'       as string,
  },

  /* ============================================================
     Typography
     ============================================================ */
  typography: {
    fontFamily: {
      display: 'var(--font-milk-display)' as string,
      body:    'var(--font-milk-body)'    as string,
      mono:    'var(--font-milk-mono)'    as string,
    },

    fontSize: {
      xs:     'var(--text-milk-xs)'    as string,
      sm:     'var(--text-milk-sm)'    as string,
      base:   'var(--text-milk-base)'  as string,
      md:     'var(--text-milk-md)'    as string,
      lg:     'var(--text-milk-lg)'    as string,
      xl:     'var(--text-milk-xl)'    as string,
      '2xl': 'var(--text-milk-2xl)'   as string,
      '3xl': 'var(--text-milk-3xl)'   as string,
      '4xl': 'var(--text-milk-4xl)'   as string,
      '5xl': 'var(--text-milk-5xl)'   as string,
    },

    fontWeight: {
      normal:   400 as number,
      medium:   500 as number,
      semibold: 600 as number,
      bold:     700 as number,
    },

    lineHeight: {
      tight:   'var(--leading-milk-tight)'   as string,
      snug:    'var(--leading-milk-snug)'    as string,
      normal:  'var(--leading-milk-normal)'  as string,
      relaxed: 'var(--leading-milk-relaxed)' as string,
      loose:   'var(--leading-milk-loose)'   as string,
    },

    letterSpacing: {
      tight:  '-0.01em',
      normal:  '0.01em',
      wide:    '0.03em',
      display: '0.02em',
    },
  },

  /* ============================================================
     Spacing
     ============================================================ */
  spacing: {
    0:  '0',          // 0px
    1:  '0.25rem',   // 4px
    2:  '0.5rem',    // 8px
    3:  '0.75rem',   // 12px
    4:  '1rem',      // 16px
    5:  '1.25rem',   // 20px
    6:  '1.5rem',    // 24px
    8:  '2rem',      // 32px
    10: '2.5rem',    // 40px
    12: '3rem',      // 48px
    16: '4rem',      // 64px
    20: '5rem',      // 80px

    // 语义间距
    cardPadding:   'var(--spacing-milk-card-padding)'   as string,
    cardGap:       'var(--spacing-milk-card-gap)'       as string,
    sectionGap:    'var(--spacing-milk-section-gap)'    as string,
    pagePadding:   'var(--spacing-milk-page-padding)'   as string,
    modalPadding:  'var(--spacing-milk-modal-padding)'  as string,
  },

  /* ============================================================
     Radii
     ============================================================ */
  radii: {
    xs:     'var(--radius-milk-xs)'    as string,
    sm:     'var(--radius-milk-sm)'    as string,
    md:     'var(--radius-milk-md)'    as string,
    lg:     'var(--radius-milk-lg)'    as string,
    xl:     'var(--radius-milk-xl)'    as string,
    full:   'var(--radius-milk-full)'  as string,

    // 语义圆角
    button: 'var(--radius-milk-button)' as string,
    card:   'var(--radius-milk-card)'   as string,
    modal:  'var(--radius-milk-modal)'  as string,
    input:  'var(--radius-milk-input)'  as string,
    tag:    'var(--radius-milk-tag)'    as string,
    badge:  'var(--radius-milk-badge)'  as string,
  },

  /* ============================================================
     Shadows
     ============================================================ */
  shadows: {
    xs:     'var(--shadow-milk-xs)'          as string,
    sm:     'var(--shadow-milk-sm)'          as string,
    md:     'var(--shadow-milk-md)'          as string,
    lg:     'var(--shadow-milk-lg)'          as string,
    xl:     'var(--shadow-milk-xl)'          as string,

    // 语义阴影
    card:        'var(--shadow-milk-card)'        as string,
    cardHover:   'var(--shadow-milk-card-hover)'  as string,
    button:      'var(--shadow-milk-button)'      as string,
    buttonHover: 'var(--shadow-milk-button-hover)' as string,
    modal:       'var(--shadow-milk-modal)'       as string,
    toast:       'var(--shadow-milk-toast)'       as string,
    float:       'var(--shadow-milk-float)'       as string,
  },

  /* ============================================================
     Z-Index
     ============================================================ */
  zIndex: {
    base:      'var(--z-base)'      as string,
    elevated:  'var(--z-elevated)'  as string,
    dropdown:  'var(--z-dropdown)'  as string,
    sticky:    'var(--z-sticky)'    as string,
    backdrop:  'var(--z-backdrop)'  as string,
    modal:     'var(--z-modal)'     as string,
    popover:   'var(--z-popover)'   as string,
    toast:     'var(--z-toast)'     as string,
    spinner:   'var(--z-spinner)'   as string,
  },

  /* ============================================================
     Animation
     ============================================================ */
  animation: {
    duration: {
      instant: 'var(--duration-instant)' as string,
      fast:    'var(--duration-fast)'    as string,
      normal:  'var(--duration-normal)'  as string,
      slow:    'var(--duration-slow)'    as string,
      glacial: 'var(--duration-glacial)' as string,
    },

    easing: {
      smooth:      'var(--easing-smooth)'      as string,
      bounce:      'var(--easing-bounce)'      as string,
      decelerate:  'var(--easing-decelerate)'  as string,
      accelerate:  'var(--easing-accelerate)'  as string,
    },
  },

  /* ============================================================
     Layout / Misc
     ============================================================ */
  layout: {
    touchTarget:    'var(--touch-target)'            as string,
    containerMax:   'var(--container-max)'           as string,
    calendarCellMinH: 'var(--calendar-cell-min-height)' as string,
    blurGlass:      'var(--blur-glass)'              as string,
  },

  icon: {
    sm:  'var(--icon-sm)'  as string,
    md:  'var(--icon-md)'  as string,
    lg:  'var(--icon-lg)'  as string,
    xl:  'var(--icon-xl)'  as string,
  },

  focusRing: {
    color:  'var(--focus-ring-color)'  as string,
    width:  'var(--focus-ring-width)'  as string,
    offset: 'var(--focus-ring-offset)' as string,
  },
} as const

// --- 向后兼容: 保留原有导出 (现有组件引用的 theme.colors.* 语法) ---
export const theme = {
  colors: {
    primary:      themeTokens.colors.primary,
    primaryLight: themeTokens.colors.primaryLight,
    primaryDark:  themeTokens.colors.primaryDark,
    bg:           themeTokens.colors.bg,
    card:         themeTokens.colors.card,
    sidebar:      themeTokens.colors.sidebar,
    text:         themeTokens.colors.text,
    textSecondary: themeTokens.colors.textSecondary,
    textMuted:    themeTokens.colors.textMuted,
    border:       themeTokens.colors.border,
    accent:       themeTokens.colors.accent,
    danger:       themeTokens.colors.danger,
    pin:          themeTokens.colors.pin,
  },
  radius: {
    sm: '10px',
    md: '16px',
    lg: '24px',
    xl: '32px',
  },
  shadow: {
    xs: '0 2px 8px rgba(51,34,27,0.03)',
    sm: '0 4px 16px rgba(51,34,27,0.04)',
    md: '0 10px 30px rgba(51,34,27,0.04)',
    lg: '0 16px 40px rgba(51,34,27,0.06)',
  },
} as const

export type ThemeTokens = typeof themeTokens
