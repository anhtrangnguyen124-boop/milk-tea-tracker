# docs/index.html 代码索引

> 自动生成于 2026-08-01 | 总行数约 6300+ | 单文件 HTML/CSS/JS

## 文件骨架

| 区块 | 行号范围 | 说明 |
|------|---------|------|
| `<head>` / `<style>` | 1-933 | 内联 CSS（含 Tailwind CDN） |
| `<script>` Tailwind 配置 | 10-45 | `tailwind.config` 字体/圆角/阴影 |
| 调色盘弹窗 HTML | 934-962 | `#palette-popup` |
| 登录页 HTML | 963-1250 | `#auth-overlay` 含角色动画 |
| 注册成功弹窗 | 1251-1271 | `#reg-success-dialog` |
| `<body>` 顶部 | 1272-1310 | 导航栏、主题切换 |
| 主界面 `<main>` | 1312-1926 | 4 个页面：tracker/journal/job/food |
| 下厨日记面板 | 1928-1954 | `#cooking-panel-overlay` 新建/编辑弹窗 |
| 饮品 Modal | 1960-2050 | `#modal-overlay` |
| 日记 Modal | 2055-2086 | `#journal-modal-overlay` |
| Toast 通知 | 2091 | `#toast` |
| `<script>` 主逻辑块 | 2096-6290 | **全部应用 JS**（单块约 4200 行） |
| ├ 下厨日记 | 2096-2846 | 所有 cooking 函数 |
| ├ 饮品图标/追踪 | 2847-3060 | drinkType 检测 + 图标生成 |
| ├ 调色盘/主题 | 3061-3621 | 取色器 + 主题系统 + 图片压缩 |
| ├ 饮品 CRUD | 3622-4250 | Modal + 日历 + 列表渲染 |
| ├ 日记模块 | 4251-4778 | Journal CRUD + 渲染 |
| ├ 登录/认证 | 4779-5310 | Auth + 角色动画 + 数据迁移 |
| └ 求职/面经 | 5311-6290 | Job + Review 全部逻辑 |

---

## 下厨日记 (Cooking) — 核心模块

### 全局状态变量

| 变量 | 行号 | 类型 | 说明 |
|------|------|------|------|
| `cookingEntries` | 2178 | `array` | 全部记录（从 localStorage 加载） |
| `cookingEditId` | 2179 | `number|null` | null=新建, number=编辑模式 |
| `cookingCategory` | 2180 | `string` | 当前选中分类（默认 `'素菜'`） |
| `cookingPinColor` | 2181 | `string` | 当前探针颜色 hex |
| `cookingNoteColor` | 2182 | `string` | 当前便签颜色 hex（空=随分类） |
| `cookingPhotos` | 2183 | `string[]` | 编辑中的 base64 照片数组 |
| `cookingFilterCategory` | 2421 | `string` | 当前筛选分类（含 `'总览'`） |
| `cookingLayoutMode` | 2447 | `string` | `'wall'` 或 `'flow'` |
| `cookingOverviewGrouped` | 2475 | `boolean` | 总览是否按分类分组 |
| `cookingExpandedId` | 2821 | `number|null` | 当前展开的卡片 ID |
| `cookingActiveWall` | 2482 | `string` | 当前渲染的 wall 容器 |

### 常量

| 常量 | 行号 | 说明 |
|------|------|------|
| `COOKING_CATEGORIES` | 2185-2190 | 4 个分类：素菜/荤菜/汤/甜品 |
| `COOKING_PIN_COLORS` | 2191-2198 | 6 种探针颜色 |
| `COOKING_NOTE_COLORS` | 2199-2208 | 8 种便签背景色 |

### 数据层

| 函数 | 行号 | 说明 |
|------|------|------|
| `loadCooking()` | 2210 | 从 localStorage 读取 `userKey('cooking_v1')`，含旧数据迁移逻辑 |
| `svCooking(arr)` | 2229 | 保存到 localStorage，含 try/catch + QuotaExceededError 检测 |

### 面板控制

| 函数 | 行号 | 说明 |
|------|------|------|
| `openCookingPanel(id, presetCategory)` | 2243 | 打开新建/编辑面板。id 非空时加载已有数据到表单 |
| `closeCookingPanel()` | 2288 | 关闭面板，重置 `cookingEditId` 和 `cookingPhotos` |

### 表单 UI 渲染

| 函数 | 行号 | 说明 |
|------|------|------|
| `renderCookingCategoryPills()` | 2297 | 渲染分类选择 pills |
| `renderCookingPinPills()` | 2306 | 渲染探针颜色圆点 |
| `renderCookingNoteColorPills()` | 2316 | 渲染便签背景色 pills |
| `renderCookingPhotoPreview()` | 2358 | 渲染照片缩略图预览 |
| `handleCookingPhotos(files)` | 2328 | 处理文件选择，异步读取+压缩，push 到 `cookingPhotos` |

### 保存/删除

| 函数 | 行号 | 说明 |
|------|------|------|
| `saveCooking()` | 2368 | 保存/更新记录。含 try/catch + 数据量检查 |
| `deleteCooking()` | 2415 | 从面板中删除记录（需确认） |
| `deleteCookingFromCard(id)` | 2829 | 从卡片上直接删除（需确认） |

### 列表渲染

| 函数 | 行号 | 说明 |
|------|------|------|
| `renderCookingTabs()` | 2428 | 渲染分类标签（含总览按钮） |
| `switchCookingCategory(cat)` | 2479 | 切换筛选分类，重新渲染 |
| `switchCookingLayout(mode)` | 2446 | 切换 'wall'/'flow' 布局 |
| `toggleCookingOverviewMode()` | 2474 | 总览的分组/不分组开关 |
| `renderCookingList()` | 2496 | 核心渲染函数，处理筛选、排序、wall/flow 两种布局。约 300 行 |
| `toggleCookingCard(id)` | 2820 | 展开/收起卡片详情 |

### HTML 关键元素

| 元素 | 行号 | 说明 |
|------|------|------|
| `#cooking-panel-overlay` | 1931 | 下厨日记新建/编辑弹窗 |
| `#cooking-name` | 1937 | 菜名输入 |
| `#cooking-photo-input` | 1938 | 照片文件输入（透明覆盖层） |
| `#cooking-photo-preview` | 1938 | 照片预览区 |
| `#cooking-ingredients` | 1940 | 材料 textarea |
| `#cooking-recipe` | 1941 | 教程 textarea |
| `#cooking-notes` | 1942 | 注意事项 textarea |
| `#cooking-url` | 1943 | 链接 input |
| `#cooking-save-btn` | 1948 | 保存/更新按钮 |
| `#cooking-delete-btn` | 1949 | 删除按钮（编辑模式可见） |
| `#cooking-category-tabs` | 1958 | 分类标签容器（含总览） |
| `#cooking-wall-*` | 1959+ | 各分类的便签墙容器 |
| `#cooking-flow-*` | 1959+ | 各分类的卡片流容器 |

---

## 饮品追踪 (Milk Tea Tracker) — 主模块

### 全局状态

| 变量 | 行号 | 说明 |
|------|------|------|
| `entries` | 2848 | 从 `ld()` 加载的全部饮品记录 |
| `editId` | 2850 | 编辑模式下的记录 ID |
| `pendingImgs` | 2851 | 表单中待上传的图片数组 |
| `modalR` / `modalName` / 等 | 2852+ | Modal 表单状态 |
| `selDate` | 2856 | 日历选中日期 |
| `calY` / `calM` | 2857 | 日历当前年/月 |

### 核心函数

| 函数 | 行号 | 说明 |
|------|------|------|
| `ld()` / `sv(a)` | 3502-3503 | 饮品数据的 localStorage 读写 |
| `openModal()` | 3677 | 打开新品记录 Modal |
| `closeModal()` | 3703 | 关闭 Modal |
| `editEntry(id)` | 3708 | 编辑已有记录 |
| `saveEntry()` | 3744 | 保存（新建/编辑）饮品记录 |
| `delEntry(id)` | 4160 | 删除记录（需确认） |
| `togPin(id)` | 4150 | 切换置顶状态 |
| `handleFiles(files)` | 3575 | 照片文件读取（饮品） |
| `renderCal()` | 3908 | 渲染日历组件 |
| `renderEntries()` | 3969 | 渲染今日饮品列表 |
| `renderStats()` | 3834 | 渲染统计栏 |
| `renderPinned()` | 4108 | 渲染置顶区 |
| `renderAll()` | 3792 | 全部重新渲染 |
| `doSearch()` | 4174 | 搜索过滤 |
| `cardHTML(e)` | 4015 | 生成单条记录卡片 HTML |

### 饮品图标/颜色

| 函数 | 行号 | 说明 |
|------|------|------|
| `detectDrinkType(name, entry)` | 2844 | 根据名称/配料推断饮品类型 |
| `getDrinkIcon(name, entry)` | 2868 | 返回饮品类型对应的图标/颜色配置 |

---

## 日记 (Journal) 模块

### 全局状态

| 变量 | 行号 | 说明 |
|------|------|------|
| `journalEntries` | 4254 | 所有日记记录 |
| `journalEditId` | 4255 | 编辑模式 ID |
| `journalExpandedCards` | 4256 | 展开的卡片 Set |

### 核心函数

| 函数 | 行号 | 说明 |
|------|------|------|
| `ldJournal()` / `svJournal(a)` | 4246-4247 | localStorage 读写 |
| `renderMoodSelector()` | 4273 | 渲染心情选择器 |
| `selectJournalMood(key)` | 4292 | 选择心情 |
| `selectJournalPaper(paper, el)` | 4298 | 选择纸张样式 |
| `openJournalModal()` | 4308 | 打开新建日记面板 |
| `closeJournalModal()` | 4330 | 关闭日记面板 |
| `editJournalEntry(id)` | 4336 | 编辑已有日记 |
| `saveJournalEntry()` | 4359 | 保存日记 |
| `delJournalEntry(id)` | 4390 | 删除日记 |
| `toggleJournalCard(id)` | 4402 | 展开/收起日记卡片 |
| `renderJournal()` | 4443 | 渲染日记列表（按月分组） |

---

## 求职追踪 (Job Tracker) + 面经 (Review) 模块

### 全局状态

| 变量 | 行号 | 说明 |
|------|------|------|
| `jobEntries` | 5324 | 所有求职记录 |
| `jobEditId` | 5326 | 编辑模式 ID |
| `reviewEntries` | 5334 | 所有面经记录 |
| `reviewEditId` | 5336 | 面经编辑 ID |

### 求职核心函数

| 函数 | 行号 | 说明 |
|------|------|------|
| `loadJobs()` / `saveJobs(a)` | 5340-5343 | 求职数据读写 |
| `openJobPanel(id)` | 5369 | 打开求职面板 |
| `closeJobPanel()` | 5422 | 关闭求职面板 |
| `saveJob()` | 5428 | 保存求职记录 |
| `deleteJob()` | 5461 | 从面板删除 |
| `renderJobAll()` | 5651 | 全部渲染 |
| `renderJobOverview()` | 5661 | 概览统计 |
| `renderJobTable()` | 5699 | 表格视图 |
| `renderJobKanban()` | 5800 | 看板视图（含拖拽） |
| `renderJobCharts()` | 5886 | 图表视图 |
| `exportJobTable()` | 5604 | 导出 CSV |
| `batchDeleteJobs()` | 5586 | 批量删除 |

### 面经核心函数

| 函数 | 行号 | 说明 |
|------|------|------|
| `loadReviews()` / `saveReviews(a)` | 5344-5347 | 面经数据读写 |
| `openReviewPanel(id)` | 6114 | 打开面经面板 |
| `saveReview()` | 6163 | 保存面经 |
| `renderReviewList()` | 6080 | 渲染面经列表 |

---

## 调色盘 (Color Palette) 模块

### 核心函数

| 函数 | 行号 | 说明 |
|------|------|------|
| `hexToRgb(hex)` | 3118 | HEX → RGB |
| `rgbToHsl(r, g, b)` | 3130 | RGB → HSL |
| `hslToHex(h, s, l)` | 3146 | HSL → HEX |
| `generatePalette(hex)` | 3165 | 根据主色生成五色主题 |
| `applyThemePreview(hex)` | 3220 | 预览主题 |
| `applyThemeFromHex(hex)` | 3362 | 应用主题到页面 CSS 变量 |
| `buildBodyGradient(h)` | 3157 | 生成背景渐变 |
| `openPalette()` | 3386 | 打开调色盘 |
| `confirmPalette()` | 3408 | 确认选择 |
| `closePalette(revert)` | 3418 | 关闭（可选回滚） |
| `drawSLPanel()` | 3230 | 绘制饱和度-亮度面板 |
| `setupSLPanel()` | 3287 | 初始化 SL 面板交互 |
| `setupHueSlider()` | 3320 | 初始化色相滑块 |

---

## 登录/认证 模块

### 全局状态

| 变量 | 行号 | 说明 |
|------|------|------|
| `GAPI_CLIENT_ID` | 4756 | Google OAuth Client ID |
| `supabaseClient` | 4759 | Supabase 客户端实例 |

### 核心函数

| 函数 | 行号 | 说明 |
|------|------|------|
| `getActiveUser()` | 4576 | 获取当前登录用户 email |
| `userKey(base)` | 4580 | 拼装用户隔离的 localStorage key |
| `showAuthPanel(mode)` | 4934 | 显示登录/注册面板 |
| `onAuthSuccess(email)` | 5211 | 登录成功后初始化 |
| `migrateOldData(email)` | 5235 | 迁移未隔离数据到用户命名空间 |
| `initCharacters()` | 4583 | 登录页角色动画初始化 |
| `animChars()` | 4644 | 角色动画循环 |

---

## 通用工具函数

| 函数 | 行号 | 说明 |
|------|------|------|
| `compressImage(dataUrl, maxSize, quality, onSuccess, onFallback)` | 3613 | Canvas 压缩图片（1200px, JPEG 0.7） |
| `toast(msg, type)` | 4234 | 轻提示（'info'/'warn'） |
| `esc(s)` | 4232 | HTML 转义 |
| `escWithBr(s)` | 4233 | HTML 转义 + 换行转 `<br>` |
| `fmtDate(d)` | 4231 | 日期格式化 |
| `localDateStr(d)` | 3507 | 日期 → ISO 字符串 |
| `escHtml(s)` | 6261 | 完整 HTML 转义（求职模块用） |
| `escCsv(str)` | 5642 | CSV 字段转义 |
| `hashStr(s)` | 6254 | 字符串哈希 |
| `getTimeAgo(ts)` | 6266 | 时间戳 → "3天前" |

---

## 快速定位指南

| 你要找... | 直接跳到 |
|-----------|---------|
| 下厨日记保存逻辑 | `saveCooking()` 第 2368 行 |
| 下厨日记渲染 | `renderCookingList()` 第 2496 行 |
| 照片上传处理 | `handleCookingPhotos()` 第 2328 行 |
| 图片压缩 | `compressImage()` 第 3613 行 |
| 编辑已有记录 | `openCookingPanel(id)` 第 2243 行 |
| 数据持久化 | `svCooking()` 第 2229 行 / `svJournal()` 第 4247 行 |
| localStorage key 规则 | `userKey()` 第 4580 行 |
| 总览分组/不分组 | `renderCookingList()` 中 2546 行附近 |
| 便签墙 vs 卡片流 | `switchCookingLayout()` 第 2446 行 |
| 饮品记录保存 | `saveEntry()` 第 3744 行 |
| 日历渲染 | `renderCal()` 第 3908 行 |
| 登录流程 | `showAuthPanel()` 第 4934 行 |
| 主题换色 | `applyThemeFromHex()` 第 3362 行 |
