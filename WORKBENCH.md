# DSH Mobile Workbench

基于 [mexiaosqwq/dsh-web-mobile](https://github.com/mexiaosqwq/dsh-web-mobile) 的本地 fork，目标宿主为 **DSH 0.1.7-rc.2**。这是沿用官方能力的移动前端层，不是另起一套会话协议或把官网装进 iframe。

## 产品边界

- 手机有明确的对话、轨迹、智能体、文件入口；原生工具内容和轨迹不被替换成缩水摘要。
- 子智能体仍由 DSH 创建、管理和渲染，保留展开、进入、返回父会话的官方路径。
- 正常聊天时限制草稿高度，让上下文仍可阅读；需要时在同一个编辑器上展开长文编辑，不复制草稿或接管 IME。
- 保留官方模型、权限、发送／停止、附件、提问及审批语义。
- 只对触屏窄视口启用新布局；桌面继续使用官方界面。
- 提供 standalone manifest 与原创 192/512px PNG 图标；不接管动态 API 缓存，不宣称离线运行或 Web Push。

## 设计参考

参考 Remotty 的工具渐进展开、OpenCode Mobile 的移动操作层级与底部操作区；不复制品牌资产。上游插件保留 MIT 许可证和原作者信息。新的 workbench 源码位于 `src/client/workbench/`，与原有适配代码分开，宿主 DOM 桥接集中管理。

## 刻意不做

- 不另建 session store、消息协议、tool renderer 或审批系统。
- 不靠移动宿主 React 节点来重排界面。
- 不使用全局 Service Worker 缓存所有 GET。
- 不随前端安装额外删除会话接口或 HTTP prototype 压缩补丁；官方会话菜单仍然可用。
- 不声称 Playwright 的缩小视口等同于真机软键盘。

## 本地构建

```sh
pnpm install --frozen-lockfile
pnpm verify
pnpm build
```

只安装一个版本的 `dsh-web-mobile`，不要把上游版本和本 fork 同时加载。源码依赖用于构建；交付包安装到隔离 profile 时关闭自动安装 peers，使用 Host 共享服务。正式日用安装需在阅读验收结果后单独进行。

## 验收重点

1. 393×852 与 360×800 下，底部导航可点击，正文没有整页横向溢出。
2. 轨迹能打开、回到对话；子代理列表能展开、进入子会话、返回父会话。
3. 工具、文件预览、模型菜单仍可访问。
4. 长草稿在缩小视口仍留下对话阅读空间；展开／收起后文本不丢。
5. 提问和审批仍由官方界面展示，不能被新导航遮挡。
6. 1440px 桌面和窄桌面非触屏窗口不启用手机布局。

测试结果和限制由最终验收报告记录；真实 Android Edge 软键盘、系统返回与 PWA 安装体验仍需要手机复核。
