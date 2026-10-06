# DSH Mobile Workbench

面向 **DSH 0.1.7-rc.2** 的手机工作台。当前版本 **3.1.0**，使用独立的语义化版本号，安装包名为 `dsh-web-mobile`。

## 使用方式

工作台在宽度小于 1024px 的触屏设备上启用。底部导航提供会话列表、会话和工作区；会话页内可切换对话与轨迹，打开当前会话的下游智能体目录，并返回直接父会话。

- 日常输入限高滚动；展开编辑使用同一个编辑器，保留草稿、选区和附件。
- 工作区提供官方文件、预览和终端；轨迹与工具详情使用官方渲染器。
- 模型、权限、发送、提问和审批由 DSH 处理。
- 输入区适配软键盘可见区和屏幕安全区；鼠标设备保持官方桌面布局。

安装、演示、架构与兼容范围见 [工作台指南](WORKBENCH.md)。

## 安装

从 [GitHub Release](https://github.com/TTTPOB/dsh-mobile-workbench/releases/tag/v3.1.0) 安装：

```sh
dsh plugin --profile web add \
  https://github.com/TTTPOB/dsh-mobile-workbench/releases/download/v3.1.0/dsh-web-mobile-3.1.0.tgz \
  --config.auto-install-peers=false
```

更新已运行的实例后，按正常服务方式重启并刷新页面。

## 开发

需要 Node.js 24+ 和 pnpm。

```sh
pnpm install --frozen-lockfile
pnpm verify
pnpm test:core
pnpm build
```

构建输出位于 `lib/`。源码与构建输出一并提交；开发约定见 [AGENTS.md](AGENTS.md)。

## 来源与许可证

项目基于 [mexiaosqwq/dsh-web-mobile](https://github.com/mexiaosqwq/dsh-web-mobile)，保留原作者信息和 [MIT 许可证](LICENSE)。移动工作台使用独立版本号维护。
