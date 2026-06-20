# CLAUDE.md - 奶茶记录册 (Milk Tea Tracker)

## 项目概述

一款 macOS 桌面奶茶记录应用。Electron + React + Supabase 技术栈。

## 工作指引

### 每次开发前
1. 阅读 `docs/execution-plan.md` 了解当前进度和下一步任务
2. 阅读 `dev-logs/` 中最新的开发日志，了解上次完成和未完成的事项
3. 确认 `.env` 文件中 Supabase 配置正确

### 每次开发后
1. 在 `dev-logs/` 中创建或更新当日日志（命名格式: `YYYY-MM-DD.md`）
2. 更新 `docs/execution-plan.md` 中的步骤完成状态
3. 运行 `npx tsc --noEmit` 确保零 TypeScript 错误
4. 运行 `npx vite build` 确保构建成功
5. **不要运行 `npm run dev`** — Electron 应用无法在终端环境中启动 GUI 窗口

### 开发原则
- **小步推进**：每次只完成一个 Step 中的一项任务
- **先编译后提交**：每步完成必须通过 TypeScript 编译
- **组件隔离**：每个组件独立文件，单一职责
- **先数据后 UI**：先确保 Hook/Supabase 数据层工作，再写 UI

## 标准文件路径

| 文件 | 路径 | 说明 |
|------|------|------|
| 产品需求 | `docs/requirements.md` | 功能和用户需求定义 |
| 技术规范 | `docs/technical-spec.md` | 技术栈、数据库、架构 |
| 设计规范 | `docs/design-guidelines.md` | 色彩、圆角、动画、组件风格 |
| 执行计划 | `docs/execution-plan.md` | 分步执行计划和验证标准 |
| 开发日志 | `dev-logs/YYYY-MM-DD.md` | 每日开发记录 |
| 数据库迁移 | `supabase/migrations/` | SQL 迁移脚本 |

## 技术栈速查

```
前端: React 19 + TypeScript + Tailwind CSS 4 + Framer Motion
状态: TanStack Query (服务端) + Zustand (UI)
后端: Supabase (Auth + PostgreSQL + Storage)
桌面: Electron 34 + Vite 8 + electron-builder
图标: lucide-react
日期: date-fns
上传: react-dropzone + browser-image-compression
```

## 项目结构

```
src/
├── components/
│   ├── auth/          # AuthGate, LoginForm, RegisterForm
│   ├── calendar/      # CalendarView, DayCell
│   ├── entries/       # EntryFormModal, EntryCard, EntryList, StarRating
│   ├── layout/        # MainLayout, Header, Sidebar
│   ├── pinned/        # PinnedSection, PinnedEntryCard
│   └── search/        # SearchBar
├── hooks/             # useAuth, useEntries, useImageUpload
├── services/          # supabase.ts (Supabase client)
├── store/             # uiStore.ts (Zustand)
├── types/             # TypeScript interfaces
├── constants/         # theme.ts (色彩/圆角/阴影)
└── styles/            # globals.css (Tailwind + 动画)
```

## 关键命令

```bash
npx tsc --noEmit           # TypeScript 类型检查
npx vite build             # 生产构建 (前端 + Electron)
npm install --cache /tmp/npm-cache <pkg>  # 安装依赖（使用备用缓存）
```

## 注意事项

- npm 全局缓存有权限问题，安装依赖时总是使用 `--cache /tmp/npm-cache`
- `.env` 包含 Supabase 密钥，已加入 `.gitignore`
- 应用需要 Supabase 后端运行，不能离线工作
- Electron 窗口配置为 `titleBarStyle: 'hiddenInset'`（macOS 原生 traffic light 按钮）
