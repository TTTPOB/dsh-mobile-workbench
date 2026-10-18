# DSH Mobile Workbench 使用与架构

DSH Mobile Workbench 3.2.0 面向 DSH 0.2.1-rc.1。包名为 `dsh-web-mobile`，版本使用 `major.minor.patch`。

## 页面与操作

工作台在 `(max-width: 1023px) and (pointer: coarse)` 条件下启用。

| 页面 | 内容与操作 |
| --- | --- |
| 会话列表 | 创建、选择和管理会话；顶栏唯一更多菜单包含插件、自动任务与原生账户／设置入口。 |
| 会话 | 官方对话与轨迹；两行顶栏提供标题／会话信息、统计、更多操作、view 切换、下游目录和直接父返回；更多菜单展示固定 preset。 |
| 工作区 | 官方文件树、预览与终端；底部会话按钮返回会话页。 |

下游计数包含当前会话的全部子孙，排除自身、父会话和兄弟会话。目录尚未加载或加载失败时显示对应状态；已知叶子显示 `0/0`。

日常编辑器限高并内部滚动，底部共用 50px 控制行：加号、原生权限状态图标、模型及发送／停止。四项触区至少 50px；权限保留官方本地化 accessible name 和原生 picker，模型通过公开 slot 显示短名并使用剩余宽度。展开编辑位于编辑带右上角、附件预览之下，保持 40px 触区与 18px 图标，使用同一个原生编辑器，保留草稿、选区和附件；展开区提供 dialog 语义与焦点范围，Escape 先关闭模型／命令菜单，再收起编辑并返回角标。底部统计 dock 连同占位隐藏，统计从顶栏打开。提问与审批仍由原生组件处理；轨迹和详情分别滚动。

卡片左右与底部内容间距为 8px，底栏水平外缘使用同一间距；宿主原生滚动条可能额外占用右侧空间。输入文字起笔与加号图标中轴、展开角标与发送图标中轴分别对齐。安全区由 frame／底栏单独保留，不通过上移底栏抵消。空态占位文案与编辑器在同格 grid 中参与自然高度，两行提示不会被固定输入高度裁掉。发送色块使用透明内缩边框，不用页面背景伪装卡片背景，明暗主题均保留原生键盘焦点提示。

### 两行顶栏与统计

第一行依次为直接父返回（仅子会话）、最多两行的会话标题／信息入口、可选任务入口、统计圆环与更多操作；第二行只包含对话／轨迹 tab 与下游图标／计数。创建后不可修改的 preset 不混在操作行，在当前会话更多菜单的只读信息区显示「模式：显示名」，会话信息 Modal 共用该显示名解析。名称从公开 agentPresets.list 读取，使用官方 display 工具解析内置翻译，自定义名称原样保留；删除／不可用／无名称时显示可读回退，不把内部 ID 当显示名。根、子、孙会话使用同一结构，标题优先按词换行，长无空格串允许断开，超过两行省略。每个主要动作保留至少 44px 触区。

统计入口显示 contextPressure 的百分比；未加载显示「—」，真实 0 才显示 0%。面板使用上游 MenuSurface，分上下文（已用 token 参考值、窗口与可选估算构成）、会话活动（轮／步、会话平均输出速率、平均首 token 等待、模型／工具用时）和 Token（总计、缓存命中率与四类用量）三组，通过公开 useProjection 订阅。输出速率只使用成对 decodeTokens／decodeMs 样本，不以总耗时除 token；Token 总计累加互斥计费桶，不重复计入 reasoning，缓存命中率只计算输入。它与会话信息 Modal、子智能体目录互斥；外点、Escape 或再次点击关闭后回到触发按钮。底部旧统计文本反解析与 stats-line effect 已移除。

### 手机轨迹详情

轨迹保留上方列表与下方详情的 40:60 分屏；选择其他请求或工具行时不必先关闭详情。详情的原生 tabs 保持完整，Summary 隐藏重复的跳转按钮而保留消息、JSON／Schema 预览、usage 与 timing 内容。两区独立滚动，详情的原生关闭按钮返回纯列表；宿主未为 detail 建 history，因此系统 Back 不承担关闭详情。

手机 Trace 隐藏整段 composer seat 并释放底部 clearance，底部三页导航仍可用；回 Chat 保留同一原生编辑器、草稿和附件。外部 view 切换即使发生在展开编辑时，也会解除展开焦点范围与 inert，避免不可见编辑器继续拦截交互。桌面保持官方横向分屏与输入区。

### 系统返回

从会话进入会话列表或工作区最多增加一层 page-history；二者互切只更新这一层。Back 先回会话，下一次才离站；点击底部「会话」也会消费这一层。全局 Automation tasks／Plugins fallback panel 的 panel-back 独立增加一层，通过公开 layout.panelInfo 订阅，使用 selectPanel(null) 退出。panel 返回先恢复其下方的会话列表／工作区，再由下一次 Back 返回会话，避免两层同时退出。会话信息 Modal 不占用全局 panel 返回层。设置和插件管理 Modal 在来源列表上增加一层管理返回；Back／关闭返回同一列表，二级菜单或确认先消费返回。

插件入口优先调用宿主公开的 `pluginNavigation.openModal`；宿主未提供该方法时使用原生插件页面。会话更多菜单提供复制当前会话 ID 和官方日志导出。

### 手机管理入口

会话列表顶栏复用官方账户菜单，登录／登出、反馈、设置及其确认流程仍由原组件处理。公开 sidebar.panellist 贡献按注册顺序追加到同一菜单，插件管理优先调用公开 openModal；复杂 sidebar.footer.action 贡献保留在原位置，避免不可达。所有原生 React 节点保留原挂载位置。

插件、设置与全局自动任务使用同一近全屏预算：左右 8px、顶部安全区后 12px、高度不超过 800px 或可见区减安全区和 24px。管理层隐藏底部三页导航，不将自动任务伪装为会话。返回保存来源列表的滚动和焦点；自动任务的“新建”仍允许官方流程进入新会话。桌面与细指针窗口保持原布局。

## 安装

需要 Node.js 24+、pnpm 11.28.5 和 DSH 0.2.1-rc.1。使用交付的 tarball 安装到指定 profile：

```sh
DSH_HOME=/path/to/isolated-home dsh plugin --profile web add \
  ./dsh-web-mobile-3.2.0.tgz \
  --config.auto-install-peers=false
```

插件复用 Host 提供的共享依赖。一个 profile 加载一个版本。插件入口要求 `@deepseek-ai/dsh-client-ui-plugin-manager@0.2.1-rc.1-fork1` 提供无参数 `openModal(): void`。先在隔离环境验证，再按部署授权更新日用实例。安装完成后，核对服务器实际提供的客户端资源与浏览器加载结果。发布与日用更新步骤见 [部署指南](docs/deployment.md)。

### PWA 图标与实例名称

图标采用深色底、白色几何终端框和薄荷色光标，原稿为 [SVG](assets/workbench.svg)。192/512px PNG 共用该设计：不透明背景填满画布，主体位于中心半径 40% 的 maskable 安全区内，因此同时声明 `any maskable`。Apple 主屏幕使用独立的 180px PNG 与 `apple-touch-icon` 标记；不会替换桌面网页 favicon。

插件 Config 提供每个 Host 实例的安装名称：

| 字段 | 默认值 | 用途 |
| --- | --- | --- |
| `name` | DSH Mobile Workbench | manifest 的完整应用名 |
| `shortName` | DSH Workbench | manifest 的短名与 Apple 主屏幕建议名 |

名称必须为含非空白字符的字符串。修改该实例 profile 的 `cordis.patch.yml`，按插件 id 覆盖 config；工作站例子：

```yaml
- id: dsh-web-mobile
  config:
    name: 'DSH 工作站'
    shortName: '工作站'
```

服务器例子（在服务器自己的 profile 中配置）：

```yaml
- id: dsh-web-mobile
  config:
    name: 'DSH 服务器'
    shortName: '服务器'
```

按实例的正常配置加载流程应用后，刷新网页并检查 `/manifest.webmanifest` 的名称，再执行浏览器的“安装应用”或“添加到主屏幕”。这些字段提供安装建议名称；是否允许安装时编辑、显示完整名还是短名、何时更新已安装应用，由浏览器和操作系统决定。已有安装可能保留旧名或旧图标，必要时移除旧安装，再从对应实例 URL 重新安装。

应用标识、启动 URL 和 scope 固定为 `/`。工作站与服务器应使用不同 origin（域名／端口）；更改名称不会在同一 origin 下创建第二个独立应用，也不提供同源多路径实例安装。同源 manifest 请求保持携带登录 Cookie。PWA 安装还受浏览器、认证和代理环境影响；当前版本不提供离线会话或 Web Push。

### 连接失败后的认证提示

手机连接进入 `connecting` / `disconnected` 后，插件通过公开 `connection.state.getSnapshot/subscribe` 探测认证；正常 `connected` 和首次连接尚无结果时不探测。rc.1 提供此公开接口；若自定义 Host 缺失它，插件会在控制台说明并仅禁用认证提示，其余移动功能不受影响。

探测请求为同源 `GET /api`，携带同源凭据、禁用缓存且不跟随重定向。Host 的 `/api` 先认证再分派路径，因此通过认证后的 404 不表示登录过期。请求最多等待 10 秒，一次仅一个请求；未确定过期时每次完成后等待 15 秒再探测，不依赖重复的 `connecting` 通知。恢复连接、退出手机媒体条件或卸载会取消探测。

401 或明确指向 `/cdn-cgi/access/login` 的可读重定向表示认证过期。Config 的 `cloudflareAccess` 默认为 `true`，面向本项目的 Cloudflare Access 部署：它声明 `/api` 受 Access 保护且重定向为登录挑战，因此浏览器隐藏目标的 `opaqueredirect` 也算过期。非 Access 部署、API 存在其他重定向或无法保证这个条件时设为 `false`：

```yaml
- id: dsh-web-mobile
  config:
    name: 'DSH 工作站'
    shortName: '工作站'
    cloudflareAccess: false
```

403、5xx、网络错误和普通 HTML 均不触发提示。确认过期后显示当前语言的系统弹窗，要求先保存或复制未发送内容、另行保存附件，再手动刷新重新登录。插件不自动刷新或导航，不停止核心重试，不管理草稿或附件，也不提供离线界面。同一次连续断线只提示一次；成功恢复连接后才允许下次提示。

## 本地演示

在已安装 DSH 的机器上，从仓库根目录执行：

```sh
pnpm install --frozen-lockfile
pnpm build
node scripts/demo.mjs --port 54076
```

打开输出的 URL，选择输出的 workspace，模型选择 **Mobile Audit**。发送“整理移动端登录页的改进清单”，或使用“演示子智能体”“演示提问”查看交互。演示使用独立 `.demo-home`，无需模型密钥；Ctrl+C 停止服务，服务停止后可以删除 `.demo-home`。

## 架构

工作台复用官方界面，通过客户端插槽增加导航和操作控件，通过有限的 DOM 适配调整原生组件的移动端呈现。

- **宿主端**：`src/index.ts` 注册每实例 manifest、图标路由及公开 `tapIndex` 安装元数据（manifest 凭据属性与 Apple 图标／建议名称）。
- **客户端入口**：`src/client/index.tsx` 安装样式、移动端效果和插槽。
- **导航与宿主适配**：`src/client/workbench/` 订阅官方会话、状态和插槽；原生服务或按钮执行页面切换，DOM 观察补充未公开的界面状态。
- **浏览器适配**：`src/client/effects/` 处理视口、安全区、焦点、会话列表触控和原生菜单定位。
- **布局**：`src/client/styles/` 定义手机页面、输入区、工作区及弹层样式。

官方服务拥有会话、草稿、附件和业务动作。插件拥有移动控件、编辑展开状态及可见区几何。标题／父关系读取公开 sessions.list，会话导航使用 uiWorkspace.openSession；统计读取投影。插件新增的信息弹窗与统计浮层仅使用上游 Modal／MenuSurface 及锚定工具，避免另建原生 dialog、遮罩或菜单状态；展开编辑因必须保留原生编辑器节点而在原 card 上设置焦点范围。宿主 React 节点保持在原父节点下；卸载时清理插件创建的节点、标记、监听器和观察者。

下游目录仅补载当前会话可达且缺失的投影基线，通过公开的 `sessions.refreshProjections` 复用宿主缓存，最多两路并发，不打开历史会话。该接口返回注册投影，包含逐轮有界预览，长记录仍有首读成本；切换会话后按当前快照重新确定补载范围，失败与重连恢复由宿主投影状态驱动。

### 软键盘几何

普通编辑态使用同一条 VisualViewport 采样管道：frame 以 `height + offsetTop` 限制可见底边，并受原布局高度上限约束；浏览器负责焦点平移。导航占位按超过键盘判定阈值的实测高度损失连续释放，编辑器预算读取实际 frame 高度和底部占位。维护时应保持这一路几何所有权，避免再叠键盘高度扣减或整页位移。展开编辑和原生 modal 使用各自的布局。

键盘收起若只报告大幅单次高度恢复，且宽度、`offsetTop` 不变，普通编辑态可用主题时长同时过渡 frame 的 `max-height` 和 `padding-bottom`；长草稿预算跟随当前绘制尺寸。连续可见区变化、缩放、重新打开键盘、展开编辑或 modal 接管时即时更新或取消该过渡；减少动态效果及零时长主题禁用它。这是有限视觉回落，不是 IME 动画同步：PWA 与普通网页均不提供 Android 原生键盘动画控制，真实输入法与安装态仍需分别验证。

## rc.1 宿主适配

客户端使用 Cordis `Context` 和各服务包的公开声明，不依赖已删除的 `dsh-client-runtime`。顶部统计直接读取 sessionStats、tokenUsage、contextPressure 与可选 contextBreakdown；不从底部 pill 文案反解析数据，也不按「数字%」查找 context meter。模型短名使用 conversation.input.model.label slot；加号菜单通过 inputTriggers.sessionOf 当前保留会话 scope 的 menu／dismiss 控制。模型菜单仍通过 conversation.input.model 触发器的 aria-controls 绑定 portal，不固定 CSS-module hash。未公开的呈现 API 及局部 DOM workaround 记录在[上游移动 API 缺口](<docs/upstream/mobile-api-gaps.md>)。

第三方 dshmarket 的 `data-dsh-market-root`、`irow` 和 `cardShots` 样式是可选兼容层，不是 rc.1 官方插件管理器的 DOM。官方管理器由 F3 fork 的原生 modal 处理；不能用这些第三方选择器的存在来确认官方管理器验收通过。

## 构建与验收

```sh
pnpm verify
pnpm test:core
pnpm build
```

`pnpm build` 清理过期输出，编译 Host／Client 并生成 `lib/client.js`。源码和 `lib/` 一起提交。

修改 SVG 原稿后，安装系统 librsvg 的 `rsvg-convert`（例如 Debian/Ubuntu 的 `librsvg2-bin`），运行 `pnpm build:icons` 重新导出 180/192/512px PNG，再执行核心测试。PNG 随包交付；正常构建与用户运行不需要图像渲染工具。

布局验收覆盖窄屏触屏、平板和鼠标设备；逐项检查点见[兼容性与验收参考](docs/compatibility.md)。核心场景包括三页导航、子会话往返、展开编辑、模型／权限菜单、轨迹详情、工作区和原生弹层。软键盘可见区可以用 VisualViewport 序列测试；测试最后一步是人类真机验收，包括触屏长按选词后直接打开权限／展开编辑、中文 IME 组字、键盘弹出／收起、刘海安全区、系统返回及 PWA。Headless DOM 选区与触摸点击回归不代表 Android／iOS 原生选词手柄通过。

## 来源与许可证

项目基于 [mexiaosqwq/dsh-web-mobile](https://github.com/mexiaosqwq/dsh-web-mobile)，保留原作者信息与 MIT 许可证。交互参考 [Remotty](https://github.com/mirkomaselli/remotty) 和 [OpenCode Mobile](https://github.com/dzianisv/opencode-mobile)。
