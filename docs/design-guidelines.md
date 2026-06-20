# 🎨 奶茶记录册 - 设计规范

## 色彩系统

| Token | 色值 | 用途 |
|-------|------|------|
| `--color-milk-bg` | #F5FBF6 | 页面背景（极浅绿） |
| `--color-milk-primary` | #66BB6A | 主色（按钮、强调） |
| `--color-milk-primary-light` | #A5D6A7 | 浅主色（hover、辅助） |
| `--color-milk-primary-dark` | #43A047 | 深主色（标题、激活态） |
| `--color-milk-card` | #FFFFFF | 卡片背景 |
| `--color-milk-sidebar` | #EEF9EF | 侧边栏背景 |
| `--color-milk-text` | #2E3B2F | 主文字 |
| `--color-milk-text-secondary` | #6B7B6C | 次要文字 |
| `--color-milk-text-muted` | #9AAA9B | 提示文字 |
| `--color-milk-border` | #C8E6C9 | 边框 |
| `--color-milk-accent` | #FFB74D | 强调色（星级评分） |
| `--color-milk-danger` | #EF5350 | 危险操作（删除） |
| `--color-milk-pin` | #FFA726 | 置顶标记 |

## 圆角规范

| 尺寸 | 值 | 适用场景 |
|------|-----|---------|
| sm | 8px | 小元素 |
| md | 12px | 卡片、输入框 |
| lg | 16px | 大卡片、弹窗 |
| xl | 24px | 最大圆角 |

## 阴影规范

| 级别 | 值 | 适用场景 |
|------|-----|---------|
| sm | 0 1px 3px rgba(0,0,0,0.08) | 轻微浮起 |
| md | 0 4px 12px rgba(0,0,0,0.10) | 卡片 |
| lg | 0 8px 24px rgba(0,0,0,0.12) | 弹窗 |

## 字体

- 系统默认中文字体栈: `-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans SC', sans-serif`
- 字号: Tailwind 默认缩放（text-sm, text-base, text-lg, text-xl, text-2xl, text-3xl）

## 动画规范

| 动画 | 用途 | 实现 |
|------|------|------|
| bounce-in | 新元素入场 | `scale(0.8) → scale(1.05) → scale(1)` 0.4s |
| slide-up | 弹窗入场 | `translateY(20px) → translateY(0)` 0.3s |
| pin-pulse | 置顶标记 | `scale(1) → scale(1.15)` 循环 2s |
| star-glow | 五星好评 | `drop-shadow` 光晕呼吸 1.5s |
| sparkle | 新建成功 | `scale(0) rotate(0) → scale(1.5) rotate(180deg)` 0.6s |

## 组件风格

- **按钮**: 圆角 12px，hover 轻微变深，active 缩放至 0.98
- **输入框**: 圆角 12px，聚焦时 2px 主色光环，placeholder 使用 muted 色
- **卡片**: 白色背景，md 阴影，md 圆角，hover 上浮 2px
- **弹窗**: 居中遮罩，白色卡片，slide-up 动画入场

## 图标

- 使用 lucide-react 图标库
- 尺寸: 16px (小) / 20px (中) / 24px (大)
- 颜色跟随文字色

## 空状态

- 显示对应场景的大号 emoji
- 简短友好提示文字
- 必要时提供操作引导按钮
