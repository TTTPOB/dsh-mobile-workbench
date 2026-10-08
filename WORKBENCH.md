# DSH Mobile Workbench 使用与架构

DSH Mobile Workbench 3.1.0 面向 DSH 0.1.7-rc.2。包名为 `dsh-web-mobile`，版本使用 `major.minor.patch`。

## 页面与操作

工作台在 `(max-width: 1023px) and (pointer: coarse)` 条件下启用。

| 页面 | 内容与操作 |
| --- | --- |
| 会话列表 | 创建、选择和管理会话；底部提供插件与设置入口。 |
| 会话 | 官方对话与轨迹；顶栏提供会话信息、下游智能体目录、view 切换和直接父会话返回。 |
| 工作区 | 官方文件树、预览与终端；底部会话按钮返回会话页。 |

下游计数包含当前会话的全部子孙，排除自身、父会话和兄弟会话。目录尚未加载或加载失败时显示对应状态；已知叶子显示 `0/0`。

日常编辑器限高并内部滚动。“展开编辑”扩大同一个编辑器，保留草稿、选区和附件。模型、权限、发送／停止、提问与审批使用 DSH 的原生处理逻辑。轨迹和详情分别滚动，选择事件时保持选中行可见。

插件入口优先调用宿主公开的 `pluginNavigation.openModal`；宿主未提供该方法时使用原生插件页面。会话更多菜单提供复制当前会话 ID 和官方日志导出。

## 安装

需要 Node.js 24+、pnpm 和 DSH 0.1.7-rc.2。使用交付的 tarball 安装到指定 profile：

```sh
DSH_HOME=/path/to/isolated-home dsh plugin --profile web add \
  https://github.com/TTTPOB/dsh-mobile-workbench/releases/download/v3.1.0/dsh-web-mobile-3.1.0.tgz \
  --config.auto-install-peers=false
```

插件复用 Host 提供的共享依赖。一个 profile 加载一个版本。先在隔离环境验证，再按部署授权更新日用实例；rc.2 的已有 bundle 更新需要受控重启。安装完成后，核对服务器实际提供的客户端资源与浏览器加载结果。发布与日用更新步骤见 [部署指南](docs/deployment.md)。

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

官方服务拥有会话、草稿、附件和业务动作。插件拥有移动控件、编辑展开状态及可见区几何。宿主 React 节点保持在原父节点下；卸载时清理插件创建的节点、标记、监听器和观察者。

下游目录仅补载当前会话可达且缺失的投影基线，通过公开的 `sessions.refreshProjections` 复用宿主缓存，最多两路并发，不打开历史会话。该接口返回注册投影，包含逐轮有界预览，长记录仍有首读成本；切换会话后按当前快照重新确定补载范围，失败与重连恢复由宿主投影状态驱动。

### 软键盘几何

普通编辑态使用同一条 VisualViewport 采样管道：frame 以 `height + offsetTop` 限制可见底边，并受原布局高度上限约束；浏览器负责焦点平移。导航占位按超过键盘判定阈值的实测高度损失连续释放，编辑器预算读取实际 frame 高度和底部占位。维护时应保持这一路几何所有权，避免再叠键盘高度扣减或整页位移。展开编辑和原生 modal 使用各自的布局。

键盘收起若只报告大幅单次高度恢复，且宽度、`offsetTop` 不变，普通编辑态可用主题时长同时过渡 frame 的 `max-height` 和 `padding-bottom`；长草稿预算跟随当前绘制尺寸。连续可见区变化、缩放、重新打开键盘、展开编辑或 modal 接管时即时更新或取消该过渡；减少动态效果及零时长主题禁用它。这是有限视觉回落，不是 IME 动画同步：PWA 与普通网页均不提供 Android 原生键盘动画控制，真实输入法与安装态仍需分别验证。

## 构建与验收

```sh
pnpm verify
pnpm test:core
pnpm build
```

`pnpm build` 清理过期输出，编译 Host／Client 并生成 `lib/client.js`。源码和 `lib/` 一起提交。

修改 SVG 原稿后，安装系统 librsvg 的 `rsvg-convert`（例如 Debian/Ubuntu 的 `librsvg2-bin`），运行 `pnpm build:icons` 重新导出 180/192/512px PNG，再执行核心测试。PNG 随包交付；正常构建与用户运行不需要图像渲染工具。

布局验收覆盖窄屏触屏、平板和鼠标设备；核心场景包括三页导航、子会话往返、展开编辑、模型／权限菜单、轨迹详情、工作区和原生弹层。软键盘可见区可以用 VisualViewport 序列测试，真实输入法、系统返回及 PWA 安装还需手机验证。

## 来源与许可证

项目基于 [mexiaosqwq/dsh-web-mobile](https://github.com/mexiaosqwq/dsh-web-mobile)，保留原作者信息与 MIT 许可证。交互参考 [Remotty](https://github.com/mirkomaselli/remotty) 和 [OpenCode Mobile](https://github.com/dzianisv/opencode-mobile)。
