---
name: custom-project
description: 自定义框架脚手架（Vue / Svelte 等非内置框架）。内置 React 已自动处理；当用户明确要求使用 Vue、Svelte 等其他框架时使用。
allowed_create_modes:
  - create-desktop
---
# 自定义项目规范

## 脚手架

> **重要**：直接在当前目录（非空）运行脚手架命令会报错。必须先在临时子目录中创建项目，再将文件复制到当前目录。

### 支持的框架

| 框架 | 说明 |
|------|------|
| **Vue** | Vite 官方模板，推荐首选 |
| **Svelte** (SvelteKit) | 轻量级组件框架 |

> **不支持**：Next.js（SSR 运行时依赖）、Angular（沙箱 package.json 冲突）、Astro（需要 Node 22）、Nuxt（SSR 默认模式）。

### 通用创建流程（以 Vite + Vue 为例）

```bash
# 1. 在临时子目录创建项目
npx create-vite@latest vue-temp --template vue-ts --skip-install

# 2. 复制所有文件（含隐藏文件）并清理临时目录
cp -a vue-temp/. . && rm -rf vue-temp
```

其他框架的临时目录创建命令（步骤 2 相同）：

```bash
# Svelte (SvelteKit)
npx sv create svelte-temp --template minimal --types ts --add tailwindcss="plugins:none" --no-install
```

## 沙箱硬约束

| 约束 | 要求 | 原因 |
|------|------|------|
| Dev server 端口 | **3015** + host `0.0.0.0` | 沙箱只暴露此端口用于 Live Preview |
| 构建产物 | `dist/index.html` 为入口 | OSS 部署管线固定读取 |
| 资源路径 | 相对路径（`base: './'`） | CDN 子目录部署兼容 |
| 包管理器 | pnpm | 沙箱预装环境 |

修改 package.json scripts 中的 dev 命令确保端口正确，例如：
- Vite-based (Vue/Svelte): `vite --port 3015 --host 0.0.0.0 --strictPort`

**Vite 项目的 `vite.config.ts` 完整配置：**
```ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  base: './',
  build: { outDir: 'dist' },
  server: { port: 3015, host: '0.0.0.0', strictPort: true },
})
```

构建产物配置示例：
- Vite-based: `build.outDir: 'dist'`, `base: './'`
