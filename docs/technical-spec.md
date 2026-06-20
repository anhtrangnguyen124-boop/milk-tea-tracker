# 🛠 奶茶记录册 - 技术规范

## 技术栈

| 层级 | 技术 | 版本 | 用途 |
|------|------|------|------|
| 桌面框架 | Electron | 34.x | macOS 桌面应用壳 |
| 构建工具 | Vite | 8.x | 前端构建与 HMR |
| UI 框架 | React | 19.x | 用户界面 |
| 类型系统 | TypeScript | 5.x | 类型安全 |
| 样式方案 | Tailwind CSS | 4.x | 原子化 CSS |
| 服务端状态 | TanStack Query | 5.x | 数据获取、缓存、同步 |
| 客户端状态 | Zustand | 5.x | UI 状态管理 |
| 后端服务 | Supabase | - | 认证、数据库、存储 |
| 日期处理 | date-fns | 4.x | 日期计算与格式化 |
| 图标库 | lucide-react | 1.x | SVG 图标 |
| 动画 | framer-motion | 12.x | 声明式动画 |
| 拖拽上传 | react-dropzone | 15.x | 拖拽图片上传 |
| 图片压缩 | browser-image-compression | - | 客户端图片压缩 |
| 打包工具 | electron-builder | 25.x | macOS .dmg 打包 |

## 数据库设计

### 表: `entries`

```sql
CREATE TABLE entries (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  image_url  TEXT,
  date       DATE NOT NULL,
  rating     SMALLINT CHECK (rating >= 1 AND rating <= 5),
  comment    TEXT,
  is_pinned  BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### 索引

- `idx_entries_user_date` — (user_id, date DESC) — 主查询
- `idx_entries_user_pinned` — (user_id, date DESC) WHERE is_pinned — 置顶查询
- `idx_entries_name_trgm` — GIN on name (trigram) — 模糊搜索

### 安全策略 (RLS)

所有 entries 表操作均通过 RLS 策略限制为 `auth.uid() = user_id`，应用层无需额外鉴权。

## 图片存储

- 桶名: `entry-images`（公开读取）
- 路径: `{entry_id}.{ext}`
- 限制: 最大 5MB, JPG/PNG/WebP/HEIC
- 上传前客户端压缩: 最长边 1200px, JPEG quality 0.85

## 项目结构约定

```
src/
├── components/     # UI 组件（按功能域分组）
│   ├── auth/       # 认证相关
│   ├── calendar/   # 日历相关
│   ├── entries/    # 奶茶记录相关
│   ├── layout/     # 布局相关
│   ├── pinned/     # 置顶相关
│   └── search/     # 搜索相关
├── hooks/          # 自定义 Hook（数据层）
├── services/       # 外部服务客户端
├── store/          # Zustand 状态
├── types/          # TypeScript 类型
├── constants/      # 常量（主题等）
└── styles/         # 全局样式
```

## 数据流

```
User Action → Component → Hook (TanStack Query) → Supabase Client → Supabase Cloud
                    ↕
              Zustand Store (UI State only)
```

- 服务端数据（entries）→ TanStack Query 管理
- UI 状态（选中日期、弹窗开关等）→ Zustand 管理

## 环境变量

| 变量 | 说明 | 示例 |
|------|------|------|
| VITE_SUPABASE_URL | Supabase 项目 URL | https://xxx.supabase.co |
| VITE_SUPABASE_ANON_KEY | Supabase 匿名密钥 | eyJhbGci... |
