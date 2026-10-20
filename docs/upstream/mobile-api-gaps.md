# 移动端公开 API 缺口（Host 0.2.1-rc.1）

本表记录当前移动客户端仍需局部 DOM 适配的位置，供上游设计扩展点时参考。consumer 是本仓库模块；需求是期望的公开契约，不表示 Host 已提供。宿主仍拥有业务状态、编辑器和上传流程。

| Consumer | 需要的公开 API | 当前 workaround |
| --- | --- | --- |
| [host-bridge](<../../src/client/workbench/host-bridge.ts>) 的对话／轨迹 tab | 当前会话 active view 的读取、订阅与 selectView(id)，可发现可用 view | 从公开 slot registry 取 view id，读取原生 data-conversation-tabs 的 aria-selected，点击所属原生 tab；DOM 只补呈现状态 |
| [workbench](<../../src/client/workbench/index.ts>) 的会话列表页 | 左栏 collapsed observable 与显式 setCollapsed；现有 toggleSidebar 是动作而无公开读面 | 读取 frame 的 data-sidebar-collapsed，调用公开 toggleSidebar；局部属性观察刷新导航证据 |
| [host-bridge](<../../src/client/workbench/host-bridge.ts>)／[工作区入口](<../../src/client/components/open-files-panel.ts>) | 右栏 expanded、fullscreen 的订阅和显式 open/close；layout.openRightbar 是布局报告接口，不等于业务展开动作 | 读取 data-sidebar-right-panel/open 标记，点击 data-sidebar-right-expand/toggle 原生控件 |
| [host-bridge](<../../src/client/workbench/host-bridge.ts>) 的子智能体目录 | 目录 open/close、打开来源（键盘／pointer）、首次焦点与关闭返回焦点 API | 点击限定 header 内的原生自身计数触发器；树挂载后聚焦可用 treeitem，关闭走原生树 Escape，再回插件触发器；不复制目录业务状态 |
| [轨迹详情样式](<../../src/client/styles/workbench-trajectory.css.ts>) | Summary 重复跳转按钮与预览内容的稳定 part／渲染选项；detail 是否建返回历史的公开策略 | 仅在手机所属 aside 隐藏 overviewTitle 跳转按钮，保留实际内容和原生 tab；原生关闭按钮退回列表，不增添 detail history |
| [session-menu](<../../src/client/workbench/session-menu.ts>) | 会话 header 更多菜单 item slot，拥有当前 sessionId 与原生关闭动作 | 仅观察实际打开的 header menu wrapper，沿官方日志导出项确认归属，追加并清理插件自己的复制 ID 行 |
| [ComposerFileButton](<../../src/client/components/ComposerFileButton.tsx>) | 当前 composer 打开文件选择器命令与 attachment intake 可用性，复用官方校验／上传 | session-scoped slot 插入按钮，点击同 card 的原生隐藏 input[type=file]；busy／子会话用公开状态禁用 |
| [输入区样式](<../../src/client/styles/workbench-composer.css.ts>) | 权限 trigger 的纯呈现 label slot／紧凑格式（与模型 label slot 对等），菜单全文保持官方 | 紧凑底行仅显示原生权限状态 glyph，完整状态保留在官方 accessible name 与直接打开的原生 picker；不解析或改写 aria／文字，不改走 slash 菜单 |
| [model-menu-anchor](<../../src/client/effects/model-menu-anchor.ts>)／[展开焦点范围](<../../src/client/workbench/composer-focus.ts>) | 展开编辑态 trigger 菜单公开 anchor／边界容器、portal 白名单及 dismiss 优先级 | 用 trigger aria-controls 限定 portal menu，局部改 left 并在退出／dispose 恢复；焦点范围容许上游 menu／listbox portal |
| 原底部统计适配及后续主题消费者 | context meter 的稳定 data-context-meter 标记或渲染 slot | 当前隐藏整段 data-composer-dock，顶部通过公开 useProjection 重绘统计；stats-line effect 已删除，不再按百分比文本识别 meter。未来若需定制原生 meter，仍需稳定扩展点 |
| [会话列表触控](<../../src/client/styles/layout.css.ts>)／[目录样式](<../../src/client/styles/workbench-header.css.ts>) | 行动作／目录 disclosure 的稳定 part 或 data 标记、最小触区 token | 优先 data-row-key、role 和所属区域；少量 class fragment 仅限区域内，视觉图标与触控盒分开 |
| [顶栏样式](<../../src/client/styles/workbench-header.css.ts>) | header actions 槽内宿主 chip（团队、后台任务）的稳定 layout part 或显式排序 token | 在宿主 headerActions 上用 grid 固定两行，插件自有 wrapper 以 display:contents 参与；宿主 chip 按 grid-area 落在第二行。后台任务 wrapper 没有 class，只能按 slot + trigger 内 count 结构定位，宿主改结构时会再次失效 |
| [管理菜单](<../../src/client/workbench/management-menu.ts>)／[管理呈现](<../../src/client/workbench/management.ts>) | settings.launcher 原生菜单 item slot、open observable 与管理 Modal 呈现标记；复杂 footer action 的显式菜单元数据 | 原生账户 anchor 只做手机 CSS 定位，限定其实际 portal 追加自有 panellist 行；设置／插件管理 Modal 由局部挂载观察标记，公开 layout.panelInfo 管理中央页面；复杂 footer 不隐藏、不自动转换 |

## 已可直接使用的契约

- layout.panelInfo／selectPanel：全局 panel 状态和退出动作；panel-back 已使用订阅，不依赖 sidebar aria-current。
- sessions.list 的 retainedBy.mainView／byId／displayTitle／parentId、uiWorkspace.openSession：标题、父关系和导航。
- useProjection 的 sessionStats、tokenUsage、contextPressure、contextBreakdown：顶部统计；可缺省字段保持未加载态。
- conversation.input.model.label／ModelLabelOwner：仅移动端 trigger 缩短显示，菜单保持 catalog 全文。
- inputTriggers.sessionOf(scope).menu／dismiss：查询当前已保留 scope，不为菜单查询 retain 历史会话。
- ui-primitives 的 Modal、MenuSurface、useAnchoredPosition：插件新增弹层的表面、焦点与定位基础。

新增公开契约后，应先替换对应 consumer 的局部适配并补验证，再移除旧观察者／样式；不通过修改生成 bundle 或私有 Host store 获取能力。

## 原生加号动作的选区消费风险

Host 0.2.1-rc.1 的 commandUi.register 支持客户端 action；它不发送消息，但执行前会消费 launcher span。加号使用的 caretSpan 在存在文本选区时返回非折叠范围。输入 `alpha beta gamma`、选中 `alpha` 后从加号打开 File 并取消选择，当前宿主会留下 ` beta gamma`。这不是插件新建动作导致的问题；权限 slash popup 同样基于 launcher span。

移动插件不把权限或展开编辑迁入该路径：权限保留原生直接 picker，展开使用独立角标。公开 controller 虽允许零长度 synthetic hit，未经手机触屏长按选词、File 取消、权限和展开的文字／选区保留验证，不将其视为安全适配。缺口是无需消费草稿／选区的 launcher action，或由 Host 明确区分合成 launcher 与真实 slash token 的消费规则。
