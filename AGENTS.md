# DSH Mobile Workbench 开发约定

## 范围与行为

- 目标 Host 为 DSH 0.1.7-rc.2；包名 `dsh-web-mobile`，使用独立语义化版本号。当前架构与使用说明以 [WORKBENCH.md](WORKBENCH.md) 为准。
- 移动端条件为 `(max-width: 1023px) and (pointer: coarse)`。鼠标设备在任何宽度保持官方桌面布局。
- 底部三页为会话列表、会话、工作区；对话／轨迹是会话页内的 view，子智能体目录是独立弹层。
- 顶栏提供当前会话信息、模式、下游计数、view 切换及直接父返回。下游递归统计所有子孙，排除自身／父／兄弟；缺失或失败不显示为叶子 `0/0`。
- 编辑展开使用同一个原生编辑器，保留草稿、选区、附件与输入法组合状态。模型、权限、发送、提问、审批和工作区业务由官方组件处理。
- 宿主端只提供 manifest 与图标；当前手机布局直接定义三页外壳。

## 实现

- 用 `ctx` 服务和公开订阅获取业务状态；未公开的呈现状态才使用局部 DOM 观察。不要依赖私有 Host store 或复制官方业务状态。
- 优先稳定 `data-*` 和结构选择器。需要 CSS-module 片段时使用 `[class*="..."]`，限定所属区域。
- 不移动或复制宿主 React 节点。只创建、移动和清理插件拥有的节点。
- 副作用纳入 `ctx.effect`，返回 disposer；清理监听器、timer、观察者、DOM 标记与自有节点。保留有实际移动浏览器问题依据的焦点修复。
- TypeScript 使用单引号、无分号、显式导出返回类型；相对导入带 `.ts`／`.tsx`。代码注释为英文，用户文档为中文。

## 开发与验证

```sh
pnpm install --frozen-lockfile
pnpm verify
pnpm test:core
pnpm build
```

- `lib/` 是提交的构建输出，不手工编辑。删除或重命名源码后执行 clean build，确认旧入口与声明文件已清除。
- 布局改动在授权的隔离实例中验证实际构建，检查手机三页、编辑器、菜单／modal、工作区和桌面不变性。截图取稳定完成态。
- 开发时不要启停日用 Host、修改真实 profile 或安装。隔离实例使用独立 DSH_HOME 和端口。push、PR、发布和日用部署分别需要授权。

## Deployment and update

- 发布到 `TTTPOB/dsh-mobile-workbench` 的 GitHub Release；tag 为 `v<version>`，资产为 `dsh-web-mobile-<version>.tgz`。已发布资产不可覆盖；修订递增版本。
- 日用使用 `dsh-web.service`、端口 53083 和 Web profile。授权部署时只替换移动端普通依赖，使用 Release URL、`auto-install-peers=false`，保留其他依赖和 profile 组合。
- 日用停启由独立 user systemd unit 执行完整运维脚本，运维任务与 Host 分属不同 cgroup；脚本完成后自动回收单元。
- 运维任务负责停服、安装、启动、失败恢复和结果反馈。验收包括安装版本、服务恢复、服务器实际客户端与浏览器应用状态；向用户报告已确认的结果。
- 部署成功且 profile 已改用 Release URL 后，清理无引用的本地安装包、解压副本、临时脚本和过渡备份；保留提交、公开 Release 和必要截图；依赖与缓存由包管理器管理。
- 具体命令和重启约束见 [部署与更新指南](docs/deployment.md)。
