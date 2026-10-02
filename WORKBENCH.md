# DSH Mobile Workbench

面向 **DSH 0.1.7-rc.2** 的手机工作台，基于 [mexiaosqwq/dsh-web-mobile](https://github.com/mexiaosqwq/dsh-web-mobile) 本地 fork。版本为 `3.0.3-fork7`，尚未发布到 npm。

## 先运行演示

本机已安装 DSH、pnpm 和 Node.js 24+ 时，在仓库根目录执行：

```sh
node scripts/demo.mjs --port 54076
```

打开终端打印的 URL，选择打印出的 workspace，模型使用 **Mobile Audit**。先发送“整理移动端登录页的改进清单”，再试“演示子智能体”或“演示提问”。演示使用独立 `.demo-home`，不需要模型密钥。按 Ctrl+C 关闭服务；需要清空演示时，可在服务停止后删除该目录。

## 界面功能

- **底部三页面**：会话列表、会话、工作区，按钮至少44px高。会话页保留原生当前对话／轨迹view；三个页面只做内容短淡入，底栏固定，减少动态效果时直接切换。
- **上下文顶栏**：标题只打开当前会话信息；上下文行依次为模式、下游智能体计数、对话／轨迹view切换、返回直接父会话。父返回只在子会话显示，窄屏可换行；后台任务和更多保持独立触控区，更多可复制当前会话ID。
- **统一输入操作栏**：五个按钮均为 44px 高、10px 圆角，间距 6px、四边留白 8px；启动未加载模型时也保持加号在左、展开与发送在右。命令菜单内部滚动，权限菜单跟随原生触发器定位。
- **长名称与统计**：模型预览最多两行，点击后显示完整名称；统计栏显示轮次、步数、token 和上下文摘要，完整明细仍由官方面板展示。
- **原生轨迹与工具**：手机端上方保留轨迹、下方显示详情，两区独立滚动；首次打开会让选中事件保持可见。参数、结果与 Schema 沿用原生内容。
- **子智能体导航**：群组只打开当前agent自己的原生下游目录，不使用父级兄弟选择器。活跃／总量递归包含所有子孙、排除自身／父／兄弟；未知或失败不假报精确数，已知叶子显示0/0并禁用目录。草稿继续由官方保管。
- **会话列表与工作区**：原生列表全宽铺满底栏上方，插件／设置底部并排。配套官方插件管理包提供openModal时，插件在当前页面上打开原生modal，关闭回原处；缺公共方法则保留原生页行为。工作区包含文件、预览和终端，只隐藏整个右栏收起按钮，内部分屏／关闭／返回保留；底部会话tab负责返回。导出仅官方更多菜单。
- **长草稿编辑**：日常输入限高、内部滚动；“展开编辑”使用同一个编辑器，收起后保留文本。
- **键盘可见区**：导航占位连续释放，正常输入区与预算共用可见区几何。大幅单次收起、且浏览器未同时平移时采用主题短过渡；连续几何、浏览器平移、缩放和减少动态效果场景让位，不承诺原生输入法曲线同步。
- **更新失败恢复**：公开组件同步失败时提供可关闭的“重新加载”入口；正常热应用不打断页面，不冒称服务器已有新版。
- **官方交互**：模型、权限、附件、发送／停止、提问和审批继续使用 DSH 的处理逻辑。
- **桌面布局**：只在触屏且宽度小于 1024px 时启用工作台。
- **安装元数据**：standalone manifest 与原创 192/512px PNG 图标；manifest 链接使用 `crossorigin="use-credentials"`，使受认证保护的同源请求携带登录 Cookie。

## 已验证

在隔离 DSH 实例中，从 tarball 安装并通过 Playwright 验证了：轨迹切换、子会话进入／返回、父草稿保留、文件面板开关、提问提交、允许一次审批，以及展开／收起编辑。

fork3 在 320／393px 手机仿真中验证按钮几何，393×520 下用连续 touch 事件验证命令菜单滚动；10 条真实子会话验证了 `1/10 → 0/10`。900px fine-pointer 桌面没有启用移动工作台。详细证据与剩余边界见交付验收记录。

fork4 的会话列表、统一信息面板、父会话返回、复制对勾与底部并排入口已通过隔离浏览器验证；但当时日用服务器仍发布 fork3 客户端，证明安装新包与 Host 路由更新不能替代实际 graph/bundle 验收。

fork5 的键盘几何采用可控 VisualViewport 序列与真实桌面 DOM 做单因素对照，验证消除自身占位阶跃，不冒充 Android/iOS 原生输入法实测。新增的恢复条仅使用公开组件同步失败状态，提供手动重新加载；它不是精确版本提示，也不是 Service Worker 更新机制。

**尚需真机确认**：Android Chrome 的最终 PWA 安装、真实软键盘与系统返回，以及个人插件组合。已验证 manifest 的 Cookie 发送由缺失变为携带，但不能据此保证远端 WebAPK 安装成功；历史公网预检曾观测到 Cloudflare 403；前轮受控部署已确认匿名401及实际登录HTML，不代表WebAPK全流程验收。当前版本不提供离线会话或 Web Push，未修改 Relay。

fork7 的三页／独立入口／下游统计／原生modal适配已完成源码聚焦测试与类型检查；主代理已完成统一构建及核心测试，新的组合GUI与真机验收待执行，不沿用旧版UI证据。公开refreshProjections首读不含聊天records/messages，但含全部registered projections及全turn的有界摘要；仅对当前可达缺catalog最多2并发，复用owner cache／恢复基线，不另读历史或实现重连管线。插件modal需配套官方ui-plugin-manager fork1公共openModal，mobile不重建管理页。

## 安装与构建

交付 tarball 可安装到指定 profile，使用 Host 共享依赖：

```sh
DSH_HOME=/path/to/isolated-home dsh plugin --profile web add \
  /path/to/dsh-web-mobile-3.0.3-fork7.tgz --config.auto-install-peers=false
```

一个 profile 只加载一个 `dsh-web-mobile` 版本。先试隔离环境，再按授权部署。目标 rc.2 对已有 bundle 升级返回 `restart-required`；需要受控进程切换后，检查 `/plugins/events` 广告的实际脚本匹配目标产物，再确认页面，不能只凭包版本或 manifest 宣称热升级成功。

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

界面复用官方会话、轨迹、子代理与工具渲染器；宿主侧只提供安装元数据与静态图标路由，已移除上游旧版删除会话端点与 HTTP 压缩补丁。DOM 桥接集中在 workbench 目录，方便针对宿主版本适配。

## 设计来源与许可证

沿用上游 MIT 许可证及作者信息。交互参考 [Remotty](https://github.com/mirkomaselli/remotty) 的工具渐进展开、限高输入，以及 [OpenCode Mobile](https://github.com/dzianisv/opencode-mobile) 的移动导航层级；新增界面与图标没有复制这些项目的品牌资产。
