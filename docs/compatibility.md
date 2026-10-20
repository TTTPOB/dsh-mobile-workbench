# rc.1 兼容性与验收参考

DSH Mobile Workbench 3.4.0 支持 DSH 0.2.1-rc.1。`engines.dsh` 与 DSH peers 均限定在 `>=0.2.1-rc.1 <0.3.0`，插件管理器 peer 精确要求 `0.2.1-rc.1-fork1`。没有继续声明旧 Host 兼容性。

## 源码与包验证

开发工具链为 Node.js 24+、pnpm 11.28.5、Cordis 4.0.5、Loader 1.0.6、Schemastery 3.18.5 与 TypeScript ^6.0.3。npm 发布的客户端声明将部分类型依赖放在 devDependencies，消费者不会自动得到它们；本项目显式安装所用声明依赖，并在 CommonJS 客户端编译配置中映射公开 types 子路径，避免旧 Node 模块解析模式把服务或 hooks 退化为 any。

```sh
pnpm install --frozen-lockfile
NODE_OPTIONS=--max-old-space-size=3072 pnpm verify
DSH_HOST_SOURCE=/absolute/path/to/rc1-checkout \
  NODE_OPTIONS=--max-old-space-size=3072 pnpm test:core
NODE_OPTIONS=--max-old-space-size=3072 pnpm build
pnpm pack --pack-destination /absolute/path/to/tarballs
```

`DSH_HOST_SOURCE` 启用只读源码契约检查；未设置时，仅跳过这三项跨仓检查，其余核心测试照常运行。源码存在性检查不代替浏览器布局或实际服务注入验收。fork tarball 的临时安装或 overrides 应放在忽略的 `.validation/` 下，不把本机路径写入提交的 manifest／lockfile。

## 适配点逐项核对

| 适配点 | rc.1 定位与 API | 验证范围 |
| --- | --- | --- |
| 统计栏 | `data-composer-stat="activity"` / `"usage"`；`data-composer-dock` | 独立 pill、普通 span／按钮、compact、context-only、卸载清理的核心回归；源码契约。 |
| 模型菜单 | `conversation.input.model` 中的原生按钮；`aria-controls` → portal id | 不固定 CSS hash；原生 menu／group 子页不变；身份与重定位回归。 |
| 编辑器 | `data-composer-card/input/placeholder/seat`、`data-input-scroll`；原生 `_row`、`_tools`、`_trailing`、`_standardControls` | 类型、源码片段与现有展开／软键盘回归；真实 IME 待验。 |
| 页面与工作区 | `data-shell-overlay`、sidebar collapsed/right-panel/right-open/right-toggle；`data-dockkit-*` | 布局服务 `toggleSidebar`、`selectPanel(null)` 仍存在；导航、层级与独立滚动回归。 |
| 会话顶栏与轨迹 | `data-conversation-tabs`、`data-trajectory-scroll/row-key`、`data-selected`；crumb、switcher、details 的 CSS-module 片段 | parent／view／目录、轨迹选中行和清理回归；保留原生 React 节点。 |
| 会话更多菜单 | session-log-export 的 `_moreButton` 与原生 Menu；locale namespace `session-log-download` | 复制当前会话 ID、失败反馈、键盘开启与卸载回归；官方下载项不替换。 |
| slots | input left/model/permission、session header actions/lineage/utilities、conversation view、shell overlay、sidebar panellist | 所用声明仍存在；贡献通过 `slots.inject` 注册。 |
| ClientContext | Cordis `Context`，renderer 提供 `slots`；session/workspace-controller、locale、layout、connection、modules 的公开声明 | 删除旧 `dsh-client-runtime` 依赖；以 rc.1 npm 声明编译。 |
| 会话与恢复状态 | `sessions.list` 的 mainView retention、`refreshProjections`、`uiSession.sessionStatus`、`connection.state`、`modules.entries.state` | 下游计数、目录补载、认证提示和更新失败提示回归；不访问私有 store。 |
| 官方插件管理器 | F3 `pluginNavigation.openModal(): void`，无参数 | modal 调用与侧栏 ledger 定位回归；包级要求 fork1。 |
| 可选第三方功能 | dshmarket 的 `data-dsh-market-root/irow/cardShots`；实验 agent-team 的 `data-team-action/panel` | 不是官方管理器 DOM；仅相关功能挂载时生效；第三方最终组合仍需验收。 |

所有保留的官方 CSS-module 片段通过 rc.1 源码存在性测试。已删除旧 `_searchInline` 规则，消息流观察排除改用 `data-chat-flow`。全名 CSS hash 不再用于模型菜单定位。

## 最终隔离 Host 的浏览器验收

以下项目需要在最终 dry-run 安装组合的真实客户端上检查，不能仅凭单测打勾。分别覆盖窄屏触屏、平板触屏、窄屏鼠标和宽屏桌面；软键盘另测 Android Chrome 与 iOS Safari／PWA。

1. **手机三页**：会话列表 → 选择／新建会话 → 会话 → 工作区 → 返回；三项导航选中态正确，没有重复侧栏、空白页或双重底部占位；在安全区内可点。
2. **会话与子会话**：叶子为 `0/0`，缺失／失败为 loading／unavailable；目录列全体子孙而非父／兄弟；选择子会话、返回直接父、切换对话／轨迹，以及额外第三方 view 都可用。
3. **编辑器**：短稿、长稿、附件、选区、中英文 IME；普通／展开来回使用同一个输入节点，不丢草稿、不重复附件、不吞 composition；键盘打开／收起和返回不跳焦点、不自动弹起、不挡发送／停止。
4. **统计栏**：分别出现 activity、usage 和只有 context meter；完整／compact 设置切换；两颗 pill 点击仍开各自原生详情，切换不叠加，Escape／外部点击关闭；缓存百分比不能被误认作 context ring。
5. **模型与权限**：菜单在输入框水平居中，不超屏；根菜单 → 模型列表／搜索 → 推理等级 → 返回；滚动、旋转、键盘变化后 portal 仍跟随；选择与原生 pending／错误反馈正常；权限菜单测量框不为零。
6. **提问与审批**：单选、多选、自定义回答、提交／取消、工具审批／拒绝、计划确认；长内容独立滚动，modal 不被导航或工作区挡住；关闭后焦点与页面恢复。
7. **工作区与终端**：文件树、预览、dock tab 与关闭；横竖屏、文档长滚动、终端输出滚动和输入；F3 的一次性 Ctrl／Alt、IME 输入，以及原生终端流控不回退；不从移动插件复制终端逻辑。
8. **设置与插件**：设置导航、关闭按钮、长模型配置；插件入口调用 F3 modal 而不切换主页面，安装／marketplace 子页可返回关闭；若另装 dshmarket，再单独测列表文本、省略和截图横滚。
9. **更多菜单与恢复**：复制当前（含子）会话 ID、剪贴板失败可见、官方日志导出仍在；连接正常无认证提示，断网不误报 401，认证过期仅提示保存后手动刷新；组件更新失败可关闭或手动刷新。
10. **桌面不变性与卸载**：宽屏及任意宽度鼠标保持官方布局，无底部移动导航；从触屏条件切出和卸载后样式、标记、观察者／监听器及插件自有节点被清理，原生 React 节点不搬家。

PWA 图标、安装名称、登录 Cookie、真实系统返回与手机输入法仍需真机确认；本参考不表示这些场景已完成浏览器验收。
