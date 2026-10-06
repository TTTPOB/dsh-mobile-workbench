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
  /path/to/dsh-web-mobile-3.1.0.tgz --config.auto-install-peers=false
```

插件复用 Host 提供的共享依赖。一个 profile 加载一个版本。先在隔离环境验证，再按部署授权更新日用实例；rc.2 的已有 bundle 更新需要受控重启。安装完成后，核对服务器实际提供的客户端资源与浏览器加载结果。

manifest 与 192/512px PNG 图标支持 standalone 安装元数据，同源 manifest 请求携带登录 Cookie。PWA 安装还受浏览器、认证和代理环境影响。当前版本不提供离线会话或 Web Push。

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

- **宿主端**：`src/index.ts` 注册 manifest、图标路由及 manifest link 的凭据属性。
- **客户端入口**：`src/client/index.tsx` 安装样式、移动端效果和插槽。
- **导航与宿主适配**：`src/client/workbench/` 订阅官方会话、状态和插槽；原生服务或按钮执行页面切换，DOM 观察补充未公开的界面状态。
- **浏览器适配**：`src/client/effects/` 处理视口、安全区、焦点、会话列表触控和原生菜单定位。
- **布局**：`src/client/styles/` 定义手机页面、输入区、工作区及弹层样式。

官方服务拥有会话、草稿、附件和业务动作。插件拥有移动控件、编辑展开状态及可见区几何。宿主 React 节点保持在原父节点下；卸载时清理插件创建的节点、标记、监听器和观察者。

## 构建与验收

```sh
pnpm verify
pnpm test:core
pnpm build
```

`pnpm build` 清理过期输出，编译 Host／Client 并生成 `lib/client.js`。源码和 `lib/` 一起提交。

布局验收覆盖窄屏触屏、平板和鼠标设备；核心场景包括三页导航、子会话往返、展开编辑、模型／权限菜单、轨迹详情、工作区和原生弹层。软键盘可见区可以用 VisualViewport 序列测试，真实输入法、系统返回及 PWA 安装还需手机验证。各版本交付记录列出实际执行的检查。

## 来源与许可证

项目基于 [mexiaosqwq/dsh-web-mobile](https://github.com/mexiaosqwq/dsh-web-mobile)，保留原作者信息与 MIT 许可证。交互参考 [Remotty](https://github.com/mirkomaselli/remotty) 和 [OpenCode Mobile](https://github.com/dzianisv/opencode-mobile)。
