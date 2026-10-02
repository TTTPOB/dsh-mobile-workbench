# dsh-web-mobile

## Mobile Workbench fork 当前约定

- **目标宿主**：DSH 0.1.7-rc.2。宿主半区（`src/index.ts`）仅注册独立 PWA 安装元数据（`/manifest.webmanifest` 及 192/512 图标路由），并为 manifest link 设置 crossorigin="use-credentials"。
- **底部三页面导航**：会话列表、会话、工作区。按钮至少 44px 高，底栏固定；页面切换仅做内容短淡入，reduced-motion 时跳过动画；不动画 frame，不保留双页面。
- **上下文顶栏**：标题仅打开当前会话信息；上下文行依次展示模式、下游智能体计数、对话／轨迹 view 切换、返回直接父会话（仅子会话）。原生节点不得移动。
- **子智能体导航与统计**：下游 active/total 递归统计所有子孙并排除自身/父/兄弟；仅对当前可达且缺少 catalog 的分支使用公开 `refreshProjections` 补载（最多 2 并发），未知或失败不作为叶子 0。
- **输入操作栏与长草稿编辑**：5 按钮同基线排布（加号在左、展开与发送在右）。日常输入限高内部滚动；“展开编辑”扩展同一个原生编辑器，保留草稿、选区与附件，不复制或移动宿主节点。基于 VisualViewport 连续释放导航占位。
- **工作区与原生集成**：包含文件、预览和终端，隐藏右栏整栏收起按钮，保留内部分屏/关闭/返回；底部会话 tab 负责返回。
- **官方能力守护**：模型、权限、附件、发送／停止、提问和审批完全沿用官方处理逻辑。
- **开发与部署约束**：绝不启停、重启或修改日常 Host 与真实 profile；不 push，不发布；改动仅在独立 worktree 中经测试后交付。

## Project

- Single-package, client-only plugin for DSH Web UI. It adapts the UI on **touch-primary devices with a viewport below 1024px** (`MOBILE_QUERY = '(max-width: 1023px) and (pointer: coarse)'`). Mouse-driven windows (`pointer: fine`) stay desktop at every width.
- Package name: `dsh-web-mobile` (patch row id: `dsh-web-mobile`).
- Real entrypoints:
  - `cordis.patch.yml` inserts the single host plugin row.
  - `src/index.ts` is the host half: registers `/manifest.webmanifest` and icon PNG routes.
  - `package.json` exposes `./client` and declares `dsh.client.platform: "web"`; browser half is discovered from `src/client/index.tsx`.
- Layout:

  ```text
  dsh-web-mobile/
  ├─ src/                    ← Source code
  │  ├─ index.ts             ← Host half: metadata and icon routes
  │  └─ client/
  │     ├─ index.tsx         ← Browser half entrypoint
  │     ├─ debug.ts          ← ?mobile-nav-debug=1 diagnostic badge
  │     ├─ components/       ← ComposerFileButton, open-files-panel
  │     ├─ core/             ← reconciler-core, raf-scheduler, css-rules, sessions-compat, layout-compat, icon-compat
  │     ├─ effects/          ← phone-chrome, sidebar-swipe, gesture-guard, subagent-chip-touch,
  │     │                       composer-keyboard-guard, shortcut-modal-keyboard-guard, session-focus-guard,
  │     │                       composer-plus-toggle, workspace-chip-toggle, team-chip-toggle,
  │     │                       model-menu-anchor, installed-list, file-viewer-compat, aionui-compat,
  │     │                       stats-line, preview-fullscreen, overlay-backdrop-fab, panel-exit, session-row-fiber
  │     ├─ styles/           ← base -> layout -> compat -> misc concatenation order, workbench styles
  │     ├─ workbench/        ← Navigation, bottom bar, composer enhancement, child agent counts
  │     └─ i18n/locales.ts
  ├─ lib/                    ← Build output (refreshed via pnpm build)
  ├─ scripts/                ← Build, probe, and verification scripts
  ├─ tests/                  ← Unit and integration tests (node --test)
  └─ docs/                   ← Design specs, audits, maintenance, upstream runbooks
  ```

## Docs

当前行为以 [WORKBENCH.md](WORKBENCH.md) 与源码为准；下列上游审计和 pitfalls 包含历史背景，已删除功能不作为当前能力。

- 排查设置/插件市场区布局与弹层 → `docs/debug/settings-market-debug-map.md`
- 排查 composer/输入区 → `docs/debug/composer-tree-recon.md`
- 动手改某块代码前 → `docs/maintenance/pitfalls.md`
- 手势/面板退出行为契约 → `docs/specs/2026-08-27-sidebar-swipe-gestures.md` 与 `docs/audits/2026-08-27-sidebar-swipe-latent-defects.md`
- 侧边栏文件面板共存设计 → `docs/specs/2026-09-17-sidebar-files-coexistence-design.md`
- 宿主升级前检查 → `docs/upstream/upgrade-runbook.md` 与 `docs/upstream/compat-contracts.json`
- 宿主代际兼容历史审计 → `docs/upstream/2026-09-23-dsh-0.1.7-alpha.2-compat-audit.md` 与 `docs/upstream/2026-09-19-dsh-0.1.6-alpha.2-compat-audit.md`
- 会话切换卡顿归因与反馈 → `docs/audits/2026-09-23-session-switch-jank-handover.md` 与 `docs/upstream/host-jank-feedback.md`
- 手机端适配交接 → `docs/audits/2026-09-23-0.1.7-rc.1-adaptation-handover.md` 与 `docs/upstream/2026-09-19-mobile-header-0.1.6-adaptation.md`
- CSS 结构检测与基线 → `docs/audits/2026-09-15-css-surface-audit.md`
- 接手 fork wzxmt-zhc 专项 → `docs/fork-wzxmt-zhc/README.md`

## Commands

```sh
pnpm install                       # install dependencies
pnpm verify                        # type-check host and client halves (tsc --noEmit)
pnpm test:core                     # run core test suite (node --test tests/*.test.ts)
pnpm build                         # clean-build, tsc, and bundle client into lib/client.js
npm run prepack                    # prepack verification (runs build)
```

- Focused unit test: `node --test tests/<file>.test.ts`
- Optional CDP regression probes:
  - `node scripts/cdp-probe.mjs`
  - `node scripts/cdp-swipe-probe.mjs`
  - `node scripts/cdp-swipe-failures.mjs`
  - `node scripts/cdp-zoom-probe.mjs`
  - `node scripts/cdp-compat-contracts.mjs`

## Architecture

- **Host/Client 分离**：浏览器行为均在 `src/client/`；宿主半区（`src/index.ts`）向 webServer 注册安装元数据和图标路由，并通过 tapIndex 为 manifest link 设置 crossorigin="use-credentials"。
- **Client 注入与 Slot**：
  - `src/client/index.tsx` 注入 `['slots', 'layout', 'locale', 'sessions', 'workspaces']`。
  - 注册 `conversation.input.left` → `ComposerFileButton`（常驻添加文件入口，触发宿主自身的 hidden file input）。
- **Reconciler 全树协调**：
  - `src/client/core/reconciler-core.ts` 为零 import 的 DOM 协调内核，管理 dirty-key 路由与 rAF 合并调度。
  - 注册任务：`frame-marker`, `preview-fullscreen-toggle`, `preview-close-sync`, `sheet-rise-replay`, `stats-line`, `overlay-backdrop-fab`, `panel-back-exit`。
- **系统级效果与手势让位**：
  - `phone-chrome.ts`：状态栏、viewport meta 保护（`viewport-fit=cover`）、`theme-color` 同步、iOS 输入框 16px 防缩放标记（`data-mobile-nav-ios`）、抽屉与面板退出动作。
  - `sidebar-swipe.ts` + `gesture-guard.ts`：抽屉边缘滑动状态机与右缘文件面板手势；工作台激活时通过 `takeoverActive` 判定让位。
  - `stats-line.ts`：标记官方状态行上下文环（`data-mobile-nav="stats-ring"`）及预留位，供工作台 composer 样式挂载消费。
  - `installed-list.ts`：针对设置弹窗内插件市场列表文本排版注入行内样式保护。
- **样式承载顺序**：
  - `src/client/styles/index.ts` 严格按照 `base -> layout -> compat -> misc` 顺序拼接。移动端样式严格限定在 `MOBILE_QUERY` 下，桌面端通过 complement 隐藏块保持原生桌面布局。

## Conventions

- 保持 Host/Client 分离，宿主半区保持极简（仅安装元数据与图标路由）。
- 优先使用稳定的 `data-*` 标记与结构选择器，避免依赖动态哈希类名；必要时使用包含式子串匹配（`[class*="..."]`）。
- 副作用生命周期统一纳入 `ctx.effect(() => { ...; return disposer }, label)`，卸载时彻底清理监听器、DOM 节点与观察者。
- 代码注释使用英文；用户文档使用中文。TypeScript 使用单引号、无分号、显式导出返回类型，相对导入带 .ts/.tsx 扩展名。
- 主代理负责决策、验收与交付；实现委派子代理。清理按当前真实需求取舍，不为旧版本兼容保留无用实现，不增加无现实收益的防御或抽象。
- 单个测试与模块间解耦，不依赖已废弃组件。
- 改动源码后必须运行 `pnpm build` 同步刷新 `lib/` 产物。

## Pitfalls

- **59 个坑的索引：名字 = 触发词 = 锚点**。原文在 `docs/maintenance/pitfalls.md` 末尾「2026-09-18 迁入原文」节，锚点 `### <名字>`。动手改某块代码前，先按名字查阅对应条目：

- `手势层`
- `files 手势`
- `抽屉导航 click`
- `抽屉行菜单`
- `backdrop 误吞`
- `composer 行`
- `键盘 guard`
- `断点与设备`
- `探针运行环境`
- `iOS zoom`
- `探针基线`
- `meme 卡`
- `preset 菜单`
- `header 拥挤`
- `header 行高与弹层`
- `files 按钮`
- `哈希子串`
- `工具栏锚定`
- `tooltip`
- `hero 净空`
- `hero 输入框下限`
- `overlay 两信号`
- `tab strip`
- `reconciler`
- `文档漂移`
- `合并冲突`
- `子代理芯片`
- `subagent 两代`
- `irow`
- `市场头`
- `dshmarket`
- `debug badge`
- `反引号`
- `has 下限`
- `lib 纪律`
- `bundle 校验`
- `host ESM`
- `safe-area`
- `Files 面板 safe-area`
- `响应压缩`
- `会话删除`
- `0.1.5 抽屉 z 与遮罩`
- `0.1.5 关态槽位`
- `性能契约`
- `Shiki`
- `包改名边界`
- `字号轴`
- `两个 closer`
- `ghost details`
- `dialog footer 按钮`
- `composer 文件入口`
- `代际门控`
- `谓词复用与豁免`
- `第三方模型条`
- `工作区 chip 再点关闭`
- `全屏侧边栏面板带`
- `搬宿主 React 节点`
- `弹层闪`
- `ContextMeter 挪位`

## Testing & QA

- 门禁自动化命令：`pnpm verify`（类型检查）与 `pnpm test:core`（覆盖 `tests/` 全部测试文件）。`pnpm build` 执行打包与失效产物清理。
- 手机端审查关注项：
  - 窄屏手机（~390px）：底部三页导航、顶栏上下文与直接父返回、全宽输入框与展开编辑、状态栏 safe-area 避让；
  - 平板模式（768–1023px 触屏）：内容限宽居中，不出现错位；
  - 桌面端（≥1024px 或鼠标指针）：保持原生桌面布局，不改变桌面布局。
- 探针与真机调试：
  - `?mobile-nav-debug=1` 可显示视口状态、DOM 标记与错误覆盖层；
  - 涉及安全区探测可参考 `scripts/probes/files-panel-safe-area-probe.mjs`。
