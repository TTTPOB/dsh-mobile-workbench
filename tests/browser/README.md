# 本机浏览器测试

## 启动与运行

在当前 worktree 根目录开两个终端；所有本地命令限制 Node 堆内存：

```sh
export NODE_OPTIONS=--max-old-space-size=4096
pnpm install --frozen-lockfile
pnpm exec playwright install chromium
pnpm build
node scripts/demo.mjs --port 54077
```

另一个终端：

```sh
export NODE_OPTIONS=--max-old-space-size=4096
pnpm test:browser:types
pnpm test:browser                                 # 390×844, isMobile + hasTouch
pnpm exec playwright test --project=mobile-320     # 320×700 touch
pnpm exec playwright test --project=desktop-1440   # 1440×900 mouse
pnpm exec playwright test                         # all three, one worker
```

默认读取当前 worktree 的 `.demo-home/url.txt`；认证 URL 每次重启会更新。也可以显式设置 `DSH_BROWSER_URL`（含 token 的 URL）。只允许 localhost 隔离实例，并拒绝日用端口 53083；测试不会自动启动服务器。CI 保持原有检查，不运行浏览器测试。

每个 worktree 都从自己的脚本位置定位根目录，链接自身的构建输出，使用自己的 `.demo-home`。并行 demo 分别指定不同端口，例如 54077 和 54078。兼容目录从祖先位置寻找相邻 `dsh-config`，不依赖 worktree 的固定深度。结束后 Ctrl-C，或停止自己启动的后台 job。

## Fixture helper

[demo.ts](<demo.ts>) 导出 `openDemo(page)`、`fixtureSession(page, options)` 和 `waitForAudit(page)`。它通过原生 UI 选择工作区／会话、发送「开始手机界面审计」，等待最终 assistant 文本中的 `MOBILE_AUDIT_COMPLETE` 及空闲发送按钮，不使用固定 sleep。

- 默认复用列表中已有的审计会话；没有时新建，并使用本 worktree 的 fixture 工作区。
- `{ reuse: false }` 强制新建；`{ sessionId }` 或 `DSH_BROWSER_SESSION_ID` 复用指定会话（它应已运行审计并完成）。
- 连接另一个 worktree 时，用 `DSH_BROWSER_WORKSPACE` 或 `{ workspace }` 指定该实例打印的 fixture workspace 绝对路径。
- 浏览器语言固定为英文以稳定官方 UI 选择器；审计提示及回复仍为中文。
- 失败截图、trace 放在已忽略的 `test-results/`；可用 `pnpm exec playwright show-trace <trace.zip>` 查看。

[导航冒烟](<navigation.spec.ts>) 在触屏 project 中检查会话列表 → 会话 → 工作区 → 会话的选中态及原生内容可见；桌面 project 检查原生侧栏／编辑器可见，且没有手机导航。

## Host API 基线

开发依赖精确固定为 0.2.1-rc.1：ui-layout、ui-primitives、ui-workspace、ui-input-trigger、ui-model-selection、ui-conversation、ui-chat、session-stats、token-meter。插件管理器保留项目已有的 0.2.1-rc.1-fork1。

原始锁文件没有解析到旧版；workspace、input-trigger、model-selection、chat 和两个 projection 提供包此前没有直接开发依赖。本次补齐，保证后续 worktree 可直接解析这些公开类型，而不是偶然依赖全局 Host 的包。

[类型探针](<host-api.types.ts>) 由 `pnpm test:browser:types` 编译：

| 提供包 | 已确认的公开 API |
| --- | --- |
| ui-layout/client | `ILayout.panelInfo`、`selectPanel` |
| ui-primitives | `Modal`、`MenuSurface`、`useAnchoredPosition` |
| ui-model-selection/client | `conversation.input.model.label` slot、`ModelLabelOwner` |
| ui-input-trigger/client | `sessionOf` 返回 controller，其 `menu` 可订阅，`dismiss` 可调用 |
| session-stats/client | `SessionProjectionMap.sessionStats` |
| token-meter/client | `SessionProjectionMap.tokenUsage`、`contextPressure` |

projection 读取应保留未加载状态：contextPressure 的 pressureTokens、projectedTokens 和 contextWindow 均可缺省。开发包的未安装 Host-only peer 警告不等于这些浏览器 API 缺失；运行时业务仍由隔离 Host 提供。
