# AutoI18n for Next.js – 桌面版

AutoI18n Desktop 是一款基于 **Electron + Vue 3 + Vite** 打造的跨平台桌面应用，可帮助开发者在本地对 **Next.js** 项目进行一键国际化处理：

* 识别 `app/` 或 `pages/` 目录结构并自动适配
* 扫描源码提取文案，支持 **Next-Intl** 及 JSON 语料
* 内置多种翻译引擎，可离线/在线翻译
* 智能保持品牌词与专有名词不被翻译
* 生成/更新各语言 JSON 文件，支持增量合并
* 可选开启静态渲染 (Static Rendering) 与多语言路由跳转


---

## 目录结构

```text
packages/
  main/      # Electron 主进程
  preload/   # 预加载脚本，桥接 Node 与渲染进程
  renderer/  # Vue 3 渲染进程（TailwindCSS 样式）
  tests/     # 各包 Vitest 单元测试
buildResources/  # 应用图标、NSIS/DMG 资源
scripts/         # 辅助脚本（自动更新 Electron vendor 等）
release-notes_*.md  # 更新日志（中英）
```

---

## 环境要求

* Node.js ≥ **18**（建议使用 LTS 版本）
* pnpm / npm / yarn 二选一（本文示例使用 **npm**）
* Windows / macOS / Linux 均可构建

---

## 快速开始

```bash
# 1. 克隆仓库
$ git clone https://github.com/kamjin3086/autoi18n-desktop.git
$ cd autoi18n-desktop

# 2. 安装依赖
$ npm install

# 3. 开启开发模式（支持 HMR）
$ npm run watch

#   ‣ 渲染进程使用 Vite dev server，代码热更新
#   ‣ 主进程/预加载脚本变更将自动重启 Electron

# 4. 运行测试
$ npm test            # 依次运行 main / preload / renderer 单元测试

# 5. 代码检查 & 格式化
$ npm run lint        # ESLint 检查
$ npm run format      # Prettier 格式化
```

---

## 生产构建与发布

```bash
# 构建三端产物（主进程 / 预加载 / 渲染进程）
$ npm run build

# 仅打包为可执行目录（无安装包）
$ npm run compile

# 构建安装包（Windows: NSIS  |  macOS: DMG  |  Linux: deb）
$ npm run dist
```

生成的安装文件位于 `dist/` 目录，默认发布源配置在 `electron-builder.yml#publish.url`，可自行修改。

---

## 常用脚本一览

| 脚本             | 说明 |
|------------------|------|
| `watch`          | 开发模式，带热更新 |
| `build`          | 打包 renderer / preload / main 三个包 |
| `compile`        | 执行 `build` 并输出可执行目录 |
| `dist`           | 生成平台安装包 |
| `test`           | 运行 Vitest 单元 + 端到端测试 |
| `typecheck`      | TypeScript / Vue TS 类型检查 |
| `lint`           | ESLint 静态检查 |
| `format`         | Prettier 代码格式化 |

---

## 配置

1. **环境变量** – 在根目录创建 `.env` 或 `.env.local`，常用字段：
   * `AUTOI18N_TRANSLATOR`  指定默认翻译服务
   * `AUTOI18N_PROXY`       代理地址，如需翻译时走代理
2. **翻译引擎** – 目前内置示例，仅供二开：
   * OpenAI
   * DeepL
   * 自建 HTTP 服务（在 `packages/preload/src/httpserver/` 中）
3. **品牌词** – 可在 UI 中设置，也支持在命令行参数 `--brandWords` 传入。

更多进阶功能请参考应用内「关于」页面或查看源码注释。

---

## 贡献指南

欢迎任何形式的贡献！在提交 PR 前请确保：

1. 使用 `npm run lint && npm run typecheck` 保持代码风格统一，无类型报错。
2. 补充或更新相应测试用例，确保 `npm test` 全部通过。
3. 若引入新依赖，请说明用途并保持依赖轻量。

> 遇到问题或想提出新功能，可通过 GitHub Issue 反馈。

---

## License

AutoI18n Desktop 遵循 **MIT** 开源许可证，详情见 [LICENSE](./LICENSE)。
