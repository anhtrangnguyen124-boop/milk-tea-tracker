# 人间小事档案馆

一个用于记录日常饮品、随想、求职与旅行足迹的 macOS 桌面应用。

## 技术栈

- React + TypeScript + Vite
- Electron
- Dexie（本地数据存储）
- Tailwind CSS + Framer Motion

## 本地开发

需要 Node.js 20 或更高版本。

```bash
npm install --cache /tmp/npm-cache
npx tsc --noEmit
npx vite build
```

## 常用命令

```bash
npm run build              # 类型检查并构建 Web 应用
npm run electron:build     # 打包 Electron 应用
npm run electron:build:mac # 构建 macOS 安装包
```

## 项目文档

- [需求说明](docs/requirements.md)
- [技术规范](docs/technical-spec.md)
- [执行计划](docs/execution-plan.md)
- [设计指南](docs/design-guidelines.md)
