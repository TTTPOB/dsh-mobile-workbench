# DSH Mobile Workbench

面向 **DSH 0.1.7-rc.2** 的手机工作台，基于 [mexiaosqwq/dsh-web-mobile](https://github.com/mexiaosqwq/dsh-web-mobile) 本地 fork。版本为 `3.0.3-fork3`，尚未发布到 npm。

## 先运行演示

本机已安装 DSH、pnpm 和 Node.js 24+ 时，在仓库根目录执行：

```sh
node scripts/demo.mjs --port 54076
```

打开终端打印的 URL，选择打印出的 workspace，模型使用 **Mobile Audit**。先发送“整理移动端登录页的改进清单”，再试“演示子智能体”或“演示提问”。演示使用独立 `.demo-home`，不需要模型密钥。按 Ctrl+C 关闭服务；需要清空演示时，可在服务停止后删除该目录。

## 界面功能

- **底部四入口**：对话、轨迹、智能体、文件，按钮具有至少 44px 触控高度。
- **上下文顶栏**：会话列表／返回、标题、后台任务与更多操作各有独立触控区；更多菜单可复制当前会话 ID，包括正在查看的子会话。较长标题可点开查看已保存的完整名称。
- **统一输入操作栏**：五个按钮均为 44px 高、10px 圆角，间距 6px、四边留白 8px；启动未加载模型时也保持加号在左、展开与发送在右。命令菜单内部滚动，权限菜单跟随原生触发器定位。
- **长名称与统计**：模型预览最多两行，点击后显示完整名称；统计栏显示轮次、步数、token 和上下文摘要，完整明细仍由官方面板展示。
- **原生轨迹与工具**：手机端上方保留轨迹、下方显示详情，两区独立滚动；首次打开会让选中事件保持可见。参数、结果与 Schema 沿用原生内容。
- **子智能体导航**：数量固定为“活跃 / 总量”，运行时显示状态点；目录标题与长列表分开布局。子会话左上角可返回父会话，再点“智能体”收起列表。草稿由官方状态保管。
- **文件与抽屉**：文件浏览和预览铺满底部导航上方；左侧抽屉打开时释放底栏占位，不露出一条空白。
- **长草稿编辑**：日常输入限高、内部滚动；“展开编辑”使用同一个编辑器，收起后保留文本。
- **官方交互**：模型、权限、附件、发送／停止、提问和审批继续使用 DSH 的处理逻辑。
- **桌面布局**：只在触屏且宽度小于 1024px 时启用工作台。
- **安装元数据**：standalone manifest 与原创 192/512px PNG 图标；manifest 链接使用 `crossorigin="use-credentials"`，使受认证保护的同源请求携带登录 Cookie。

## 已验证

在隔离 DSH 实例中，从 tarball 安装并通过 Playwright 验证了：轨迹切换、子会话进入／返回、父草稿保留、文件面板开关、提问提交、允许一次审批，以及展开／收起编辑。

fork3 在 320／393px 手机仿真中验证按钮几何，393×520 下用连续 touch 事件验证命令菜单滚动；10 条真实子会话验证了 `1/10 → 0/10`。900px fine-pointer 桌面没有启用移动工作台。详细证据与剩余边界见交付验收记录。

**尚需真机确认**：Android Chrome 的最终 PWA 安装、真实软键盘与系统返回，以及个人插件组合。已验证 manifest 的 Cookie 发送由缺失变为携带，但不能据此保证远端 WebAPK 安装成功；无凭据公网请求仍观测到 Cloudflare 403，来源未进一步归因。当前版本不提供离线会话或 Web Push，未修改 Relay。

## 安装与构建

交付 tarball 可安装到指定 profile，使用 Host 共享依赖：

```sh
DSH_HOME=/path/to/isolated-home dsh plugin --profile web add \
  /path/to/dsh-web-mobile-3.0.3-fork3.tgz --config.auto-install-peers=false
```

一个 profile 只加载一个 `dsh-web-mobile` 版本。先试隔离环境，确认真机体验后再决定是否用于日常环境。

源码构建：

```sh
pnpm install --frozen-lockfile
pnpm verify
pnpm build
node --test tests/workbench-navigation.test.ts tests/workbench-composer.test.ts tests/workbench-presentation.test.ts tests/host-parity.test.ts
```

## 维护结构

- `src/client/workbench/`：导航、宿主桥接和编辑器增强。
- `src/client/styles/workbench*.css.ts`：工作台样式。
- `src/index.ts`：manifest 与图标路由。
- `dev/fixture/`：本地演示模型与交互场景。

界面复用官方会话、轨迹、子代理与工具渲染器；宿主侧只提供安装元数据，不启用上游插件附带的删除会话端点和 HTTP 压缩补丁。DOM 桥接集中在 workbench 目录，方便针对宿主版本适配。

## 设计来源与许可证

沿用上游 MIT 许可证及作者信息。交互参考 [Remotty](https://github.com/mirkomaselli/remotty) 的工具渐进展开、限高输入，以及 [OpenCode Mobile](https://github.com/dzianisv/opencode-mobile) 的移动导航层级；新增界面与图标没有复制这些项目的品牌资产。
