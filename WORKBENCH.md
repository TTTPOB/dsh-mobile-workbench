# DSH Mobile Workbench

面向 **DSH 0.1.7-rc.2** 的手机工作台，基于 [mexiaosqwq/dsh-web-mobile](https://github.com/mexiaosqwq/dsh-web-mobile) 本地 fork。版本为 `3.0.3-fork1`，尚未发布到 npm。

## 先运行演示

本机已安装 DSH、pnpm 和 Node.js 24+ 时，在仓库根目录执行：

```sh
node scripts/demo.mjs --port 54076
```

打开终端打印的 URL，选择打印出的 workspace，模型使用 **Mobile Audit**。发送“开始手机界面审计”“演示子智能体”或“演示提问”即可体验。演示使用独立 `.demo-home`，不需要模型密钥。按 Ctrl+C 关闭服务；需要清空演示时，可在服务停止后删除该目录。

## 界面功能

- **底部四入口**：对话、轨迹、智能体、文件，按钮具有至少 44px 触控高度。
- **原生轨迹与工具**：保留 DSH 的事件轨迹、工具展开与完整结果。
- **子智能体导航**：展开官方列表、进入子会话，通过顶部父会话入口返回；草稿由官方会话状态保管。
- **长草稿编辑**：日常输入限高、内部滚动；“展开编辑”使用同一个编辑器，收起后保留文本。
- **官方交互**：模型、权限、附件、发送／停止、提问和审批继续使用 DSH 的处理逻辑。
- **桌面布局**：只在触屏且宽度小于 1024px 时启用工作台。
- **安装元数据**：standalone manifest 与原创 192/512px PNG 图标。

## 已验证

在隔离 DSH 实例中，从 tarball 安装并通过 Playwright 验证了：轨迹切换、子会话进入／返回、父草稿保留、文件面板开关、提问提交、允许一次审批，以及展开／收起编辑。

393×520 缩小视口下，长输入卡约 207px 高，对话区仍有约 210px 可用高度；360px 宽度没有整页横向溢出。1440px 与 900px 非触屏窗口没有出现工作台导航或编辑按钮。

**尚需真机确认**：Android Edge 的软键盘、系统返回、PWA 安装，以及与个人插件组合的长期使用。当前版本不提供离线会话或 Web Push。

## 安装与构建

交付 tarball 可安装到指定 profile，使用 Host 共享依赖：

```sh
DSH_HOME=/path/to/isolated-home dsh plugin --profile web add \
  /path/to/dsh-web-mobile-3.0.3-fork1.tgz --config.auto-install-peers=false
```

一个 profile 只加载一个 `dsh-web-mobile` 版本。先试隔离环境，确认真机体验后再决定是否用于日常环境。

源码构建：

```sh
pnpm install --frozen-lockfile
pnpm verify
pnpm build
node --test tests/workbench-navigation.test.ts tests/workbench-composer.test.ts tests/host-parity.test.ts
```

## 维护结构

- `src/client/workbench/`：导航、宿主桥接和编辑器增强。
- `src/client/styles/workbench*.css.ts`：工作台样式。
- `src/index.ts`：manifest 与图标路由。
- `dev/fixture/`：本地演示模型与交互场景。

界面复用官方会话、轨迹、子代理与工具渲染器；宿主侧只提供安装元数据，不启用上游插件附带的删除会话端点和 HTTP 压缩补丁。DOM 桥接集中在一个模块，方便针对宿主版本适配。

## 设计来源与许可证

沿用上游 MIT 许可证及作者信息。交互参考 [Remotty](https://github.com/mirkomaselli/remotty) 的工具渐进展开、限高输入，以及 [OpenCode Mobile](https://github.com/dzianisv/opencode-mobile) 的移动导航层级；新增界面与图标没有复制这些项目的品牌资产。
