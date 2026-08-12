# 旅行攻略 AI 解析部署

旅行档案仍保存在浏览器本地。只有“AI 结构化解析”会把导入攻略文本发送到后端，再由 OpenAI 返回固定字段。

## 部署到 Vercel

1. 将此项目导入 Vercel。
2. 在项目的 **Settings → Environment Variables** 新增 `OPENAI_API_KEY`。
3. 可选新增 `OPENAI_MODEL`；默认值为 `gpt-4o-mini`。
4. 部署完成后，通过 Vercel 分配的网址打开网页，而不是使用 `file:///.../docs/index.html`。

部署后，网页会自动调用同一站点下的 `/api/parse-travel`。API Key 只存在 Vercel 环境变量，浏览器和仓库都不会获得它。

## 使用方式

在旅行档案中导入 PDF、Word、文本或图片后，先确认导入草稿，点击“AI 结构化解析”。解析结果会显示字段摘要；点击“一键填充所有字段”后才会写入表单。
