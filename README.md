# Quarto Book Template

[![Template License: MIT](https://img.shields.io/badge/template-MIT-green)](./LICENSE-MIT)
[![Content License: CC BY--SA 4.0](https://img.shields.io/badge/content-CC_BY--SA_4.0-lightgrey)](./LICENSE-CC-BY-SA-4.0)

中文：`book/`、`book/assets/` 和根目录 `index.qmd` 默认适用 `CC BY-SA 4.0`；模板代码、配置、工具链与仓库辅助文件默认适用 `MIT`。

English: `book/`, `book/assets/`, and root `index.qmd` default to `CC BY-SA 4.0`; template code, configuration, tooling, and repository support files default to `MIT`.

一个作为 GitHub template canonical source 的 Quarto 电子书模板，内置 HTML + EPUB 构建、Markdown 格式化、初始化脚本与基础 CI。

A canonical GitHub template source for Quarto books, with HTML + EPUB output, Markdown formatting, a bootstrap script, and baseline CI checks.

## Create a New Project

中文：

1. 在 GitHub 上点击 `Use this template` 创建一个新仓库。
2. 将新仓库克隆到本地。
3. 在新仓库根目录执行 `npm run init`。
4. 执行 `npm ci`。
5. 执行 `npm run build`。
6. 开始替换首页、章节和内容资源，进入写作流程。

English:

1. Click `Use this template` on GitHub to create a new repository.
2. Clone the new repository locally.
3. Run `npm run init` at the repository root.
4. Run `npm ci`.
5. Run `npm run build`.
6. Replace the starter landing page, chapters, and content assets, then start writing.

也可以直接用参数模式完成初始化：

```bash
npm run init -- --title "My Book" --author "Your Name" --year 2026 --slug my-book --repo https://github.com/you/my-book --non-interactive
```

## What `npm run init` Updates

- `_quarto.yml` 中的书名、作者、版权、输出文件名和 GitHub 页脚链接
- `book/license.qmd` 中的作者、年份和仓库链接
- `package.json` 中的项目包名和描述，以及 `package-lock.json` 中的根包名
- `index.qmd` 的首页标题
- 根目录 `README.md`，将其替换成当前项目 README
- `.template-init.json`，作为初始化完成的 sentinel

## Starter Content

初始化完成后，至少替换这些默认内容：

- 首页文案：`index.qmd`
- 导读和章节内容：`book/`
- 章节内容：`book/chapters/`
- 封面图片与插图等内容资源：`book/assets/`

After initialization, replace these starter files first:

- Landing page copy in `index.qmd`
- Guide pages and chapter content under `book/`
- Chapter content in `book/chapters/`
- Cover image and other content assets under `book/assets/`

## Environment

- Node.js: `22.x` via `.nvmrc`
- npm: `10.x` via `packageManager`
- Quarto: tested with `1.9.x`

## Project Structure

```text
.
├── .github/workflows/   # CI and GitHub Pages publishing
├── scripts/             # Bootstrap scripts for derived repositories
├── template/            # README and license templates used by init
├── .vscode/             # Workspace recommendations and tasks
├── assets/              # MIT-licensed template assets
├── book/                # CC BY-SA book source files
│   ├── assets/          # CC BY-SA content assets such as cover and illustrations
│   ├── chapters/        # Chapter source files
│   └── license.qmd      # In-book license and usage page
├── index.qmd            # Book home page (kept at root for Quarto)
├── LICENSE-CC-BY-SA-4.0 # Full CC BY-SA 4.0 license text for book content
├── LICENSE-MIT          # Full MIT license text for template/tooling
├── _quarto.yml          # Quarto book configuration
├── package.json         # Template tooling scripts
└── README.md
```

## Common Commands

- `npm run init`: 初始化派生仓库元数据 / initialize derived repository metadata
- `npm ci`: 安装依赖 / install dependencies
- `npm run format`: 格式化 Markdown 和配置文件 / format Markdown and config files
- `npm run format:check`: 检查格式 / verify formatting
- `npm run lint`: 运行 Markdown lint / run Markdown lint
- `npm run build`: 构建 HTML + EPUB / build HTML + EPUB
- `npm run build:html`: 仅构建 HTML / build HTML only
- `npm run build:epub`: 仅构建 EPUB / build EPUB only
- `npm run check`: 运行格式、lint 和构建检查 / run format, lint, and build checks

## VS Code Workflow

中文：

- 打开仓库后，接受项目推荐扩展；推荐列表由 `.vscode/extensions.json` 固定维护。
- `index.qmd` 保持在仓库根目录，其他书稿位于 `book/`。
- `.qmd` 文件默认由 Quarto 扩展按 `Quarto` 语言模式处理，不再强制回退到 `Markdown`。
- 日常预览使用 Quarto 扩展的 Preview 按钮或 `Quarto: Preview` 命令；默认在 VS Code 内部预览，不会保存即渲染。
- 批量检查和构建优先使用 `.vscode/tasks.json` 中的稳定任务名，或继续使用 npm scripts。
- 这个模板把格式化、预览和任务入口都固化在项目里，不依赖用户已有的 VS Code 用户设置。

English:

- Accept the recommended extensions when you open the repository; the list is pinned in `.vscode/extensions.json`.
- Keep `index.qmd` at the repository root, with the rest of the book content under `book/`.
- Keep reusable template assets at root `assets/`, and manuscript-specific assets under `book/assets/`.
- `.qmd` files are handled by the Quarto extension as `Quarto` language files, not forced back to plain `Markdown`.
- Use the Quarto Preview button or the `Quarto: Preview` command for daily previewing; preview opens inside VS Code and render-on-save stays disabled.
- Prefer the stable task names defined in `.vscode/tasks.json` for routine checks and builds, or continue using the npm scripts directly.
- The template intentionally keeps formatting, preview, and task entry points at the project level rather than relying on personal VS Code user settings.

## Publishing

默认发布方式：

- `ci.yml` 会在 Pull Request 和非 `main` 分支的 push 上执行基础检查。
- `publish.yml` 会在 `main` 分支 push 或手动触发时构建并部署 `_book/` 到 GitHub Pages。
- EPUB 下载入口由 Quarto 的 `book.downloads` 自动生成，不需要手写下载链接。

Default publishing flow:

- `ci.yml` runs baseline checks for pull requests and pushes to non-`main` branches.
- `ci.yml` also runs a template smoke test that simulates the `Use template` consumer flow.
- `publish.yml` builds and deploys `_book/` to GitHub Pages on pushes to `main` or via manual dispatch.
- The EPUB download button is generated by Quarto via `book.downloads`, so no hard-coded download link is required.
- `index.qmd` remains at the repository root because Quarto book projects require the home page to be `index.*` at project root.

## License / 授权

中文：

- 这个仓库采用双授权，用作 GitHub template 的 canonical source。
- 书内容与内容资源默认采用 [`CC BY-SA 4.0`](./LICENSE-CC-BY-SA-4.0)，包括根目录 `index.qmd`、`book/` 下的书稿，以及 `book/assets/` 下的封面、插图等资源。
- 模板配置、工具链和仓库辅助文件默认采用 [`MIT`](./LICENSE-MIT)，包括 `_quarto.yml`、`package.json`、`package-lock.json`、`.github/`、`.vscode/`、根目录 `assets/` 和 `README.md`。
- 第三方依赖、Quarto 内置前端资源、生成产物中的 vendored 文件等保留各自原始许可证，不并入上述两类。
- 创建新书后，优先运行 `npm run init`，再替换书稿正文与内容资源。

English:

- This repository uses split licensing and serves as the canonical GitHub template source.
- Book content and content assets default to [`CC BY-SA 4.0`](./LICENSE-CC-BY-SA-4.0), including root `index.qmd`, the manuscript under `book/`, and covers or illustrations under `book/assets/`.
- Template configuration, tooling, and repository support files default to [`MIT`](./LICENSE-MIT), including `_quarto.yml`, `package.json`, `package-lock.json`, `.github/`, `.vscode/`, root `assets/`, and `README.md`.
- Third-party dependencies, Quarto-provided frontend assets, and vendored generated files keep their original upstream licenses.
- After creating a new book, run `npm run init` first, then replace the manuscript content and assets.
