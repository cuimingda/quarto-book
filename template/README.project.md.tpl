# {{TITLE}}

[![Content License: CC BY--SA 4.0](https://img.shields.io/badge/content-CC_BY--SA_4.0-lightgrey)](./LICENSE-CC-BY-SA-4.0)

中文：这个仓库是《{{TITLE}}》的 Quarto 书稿项目，作者 {{AUTHOR}}。内容源文件默认采用 `CC BY-SA 4.0`，模板配置、工具链和仓库辅助文件默认采用 `MIT`。

English: This repository contains the Quarto source for "{{TITLE}}" by {{AUTHOR}}. Book content defaults to `CC BY-SA 4.0`, while template configuration, tooling, and repository support files default to `MIT`.

仓库 / Repository: <{{REPO_URL}}>

## Quick Start

- `npm ci`: 安装依赖 / install dependencies
- `npm run build`: 构建 HTML + EPUB / build HTML + EPUB
- `npm run check`: 运行格式、lint 和构建检查 / run format, lint, and build checks
- `quarto preview`: 本地预览 / preview locally

## Environment

- Node.js: `22.x`
- npm: `10.x`
- Quarto: tested with `1.9.x`

## Project Structure

```text
.
├── .github/workflows/   # CI and GitHub Pages publishing
├── .vscode/             # Workspace recommendations and tasks
├── assets/              # MIT-licensed template assets
├── book/                # CC BY-SA book source files
│   ├── assets/          # CC BY-SA content assets such as cover and illustrations
│   ├── chapters/        # Chapter source files
│   └── license.qmd      # In-book license and usage page
├── index.qmd            # Book home page
├── LICENSE-CC-BY-SA-4.0 # Full CC BY-SA 4.0 license text for book content
├── LICENSE-MIT          # Full MIT license text for template/tooling
├── _quarto.yml          # Quarto book configuration
├── package.json         # Project tooling scripts
└── README.md
```

## Publishing

- `ci.yml` 会在 Pull Request 和非 `main` 分支的 push 上执行基础检查。
- `publish.yml` 会在 `main` 分支 push 或手动触发时构建并部署 `_book/` 到 GitHub Pages。
- EPUB 下载入口由 Quarto 的 `book.downloads` 自动生成，不需要手写下载链接。

## License / 授权

- 书内容与内容资源默认采用 [`CC BY-SA 4.0`](./LICENSE-CC-BY-SA-4.0)。
- 模板配置、工具链和仓库辅助文件默认采用 [`MIT`](./LICENSE-MIT)。
- 第三方依赖、Quarto 内置前端资源和 vendored 产物保留各自原始许可证。
