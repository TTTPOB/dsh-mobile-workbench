# DSH Mobile Workbench — local fork

面向 **DSH 0.1.7-rc.2** 的本地移动工作台，版本 `3.0.3-fork7`，未发布。完整使用与设计说明见 [WORKBENCH.md](WORKBENCH.md)。

---

![dsh-web-mobile — 手机上也能好好用 DSH](assets/banner.png)

<p align="center">
  <strong>DSH Web UI 移动端工作台：三页导航，长草稿编辑，原生体验</strong>
</p>

<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-green?style=flat-square" alt="MIT" /></a>
  <a href="https://github.com/topics/dsh-plugin"><img src="https://img.shields.io/badge/topic-dsh--plugin-amber?style=flat-square" alt="dsh-plugin" /></a>
</p>

本项目基于 dsh-web-mobile；上游移动适配曾集成于 [DSHA](https://github.com/qiannianhuanxiang/DSHA)。本地工作台 fork 独立维护。

---

## 核心功能

- **底部三页面导航**：会话列表、会话、工作区，底栏固定，页面切换仅做内容轻量淡入，reduced motion 场景直切。
- **上下文顶栏**：标题仅打开当前会话详情；上下文行展示模式、下游智能体递归统计（排除自身与兄弟）、轨迹/对话切换及父会话返回。
- **统一操作栏与长草稿编辑**：5 按钮同基线排布（加号在左、展开与发送在右），日常输入限高滚动，“展开编辑”扩展同一个原生编辑器，收起保留草稿与选区。
- **输入法与视口适配**：基于 VisualViewport 连续释放导航占位，刘海安全区避让，深/浅色 theme-color 同步，iOS 强制 16px 防缩放。
- **工作区与原生集成**：包含文件、预览和终端，隐藏右栏整栏收起按钮，保留分屏/关闭/返回；底部会话 tab 负责返回。
- **保持桌面布局**：鼠标指针（`pointer: fine`）或非触屏窗口在任何宽度均保持原生桌面布局，移动控件保持隐藏。
- **宿主纯净**：仅注册独立 PWA 安装元数据（`/manifest.webmanifest` 与 PNG 图标），不注入进程级响应压缩补丁或删除会话端点。

---

## 上游历史截图

下列截图记录上游界面，不代表当前三页工作台布局。

| 会话主页 | 目录抽屉 | 设置界面 |
| --- | --- | --- |
| ![移动端会话主页](assets/hero.png) | ![目录抽屉](assets/drawer.png) | ![移动端设置界面](assets/settings.png) |

---

## 验证范围

当前目标为 DSH 0.1.7-rc.2。源码测试和构建不替代手机实测；第三方插件组合需在实际启用后验证。

---

## 构建与开发

```sh
pnpm install                       # 安装依赖
pnpm verify                        # 类型检查 (tsc --noEmit)
pnpm test:core                     # 执行核心测试套件
pnpm build                         # clean-build、tsc 并打包为 lib/client.js
```

源码修改后需运行 `pnpm build` 刷新 `lib/` 产物。

工程约定见 [AGENTS.md](AGENTS.md)；回归探针 `scripts/probes/` 锚点可单跑，兼作宿主升级绊线。

---

## License

[MIT](LICENSE)
