# 本地界面演示模型

Mobile Audit 为界面验收生成确定性内容，不需要 API Key。它通过 DSH 的正式模型适配器和工具执行链工作。

## 启动

从仓库根目录执行：

```sh
node scripts/demo.mjs --port 54076
```

需要 Node.js 24+、pnpm、本机已安装的 DSH 0.2.1-rc.1，以及相邻的 `dsh-config` checkout。脚本链接当前仓库的构建输出，创建独立 `.demo-home`；复用 `dsh-config` 的兼容授权逻辑，只为 `shared/dependencies.yaml` 中 `verifiedCompatibility` 已验证的已安装全局 fork 组合写入精确版本豁免，并逐项打印。不修改日用 Host、真实 profile 或全局安装；当前兼容的移动端包和 fixture 不需要豁免。

打开终端的 **Authenticated demo URL**（带 `?token=`），或读取 `.demo-home/url.txt`；重启后 URL 会更新。选择打印的 workspace 目录，新建 Mobile Audit 会话，发送「开始手机界面审计」，等待 `MOBILE_AUDIT_COMPLETE`。

Playwright 使用独立 context：

```js
const context = await browser.newContext({
  viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true,
})
const page = await context.newPage()
await page.goto(url) // Authenticated demo URL from .demo-home/url.txt
```

需要 CDP 时先启动支持远程调试的 Chromium，再用 `chromium.connectOverCDP(endpoint)` 获取 `browser`；应用端口 54076 不是 CDP 端口。已有 `scripts/cdp-probe.mjs` 可用 `DSH_PROBE_URL=http://127.0.0.1:54076/`、`DSH_PROBE_TOKEN`（URL 的 token 参数）、`DSH_PROBE_SESSION_ID`（新建会话 ID）和 `DSH_PROBE_CHROME` 运行；它是额外回归探针，不能替代真实 UI 审查。

结束后 Ctrl-C；后台运行则停止对应 job，或向 `.demo-home/demo.pid` 中的 PID 发 SIGTERM。脚本会同时停止隔离 Host 和可选的 cloudflared，任一子进程退出也会停止另一进程。不得停止 53083 日用进程。

## 最后一步：人类真机验收

agent 完成本机自动化验收后，由 lead 会话启动并持有后台 job：

```sh
node scripts/demo.mjs --port 54076 --tunnel
```

需要 `/usr/local/bin/cloudflared`。脚本先创建 quick tunnel（HTTP/2，继承现有 HTTP(S)_PROXY），拿到随机 `https://*.trycloudflare.com` 后将 hostname 传入 DSH `--trusted-host`。自有反代也可重复传 `--trusted-host phone.example --trusted-host other.example`；只添加明确使用的主机，不关闭 Host／Origin 门禁。

把输出的 **Public demo URL** 发给用户，或读取权限为 0600 的 `.demo-home/public-url.txt`；它保留本机认证 URL 的 path/query，包括 token。URL 是临时凭据，不要外传。用户必测：iOS 键盘弹出／收起、中文 IME 组字中的回车／Escape、刘海安全区、Android 系统返回。浏览器仿真不能替代这些实机检查。

当前 Host 的 `/api/` 拒绝未信任 Host（403）。HTTPS 隧道在 cloudflared 处终止 TLS，本机 HTTP Host 颁发 HttpOnly／SameSite=Strict cookie；Secure 仅由 Host 自身 TLS 决定，不由转发头决定。首次打开公网 token URL 后会 303 到同域干净 URL，用 cookie 继续认证，不需要关闭认证或放宽 SameSite。

验收结束立即 Ctrl-C／停止对应 job，并确认端口释放和 cloudflared 无残留。后台 job 会随发起者回合结束回收，lead 须在用户测完前保持该回合；不能把运行中 job 当作跨回合交付。隧道连不上时检查日志中的代理／连接错误，报告给用户在 Windows 代理侧处理，不改系统网络配置。

## 演示场景

| 发送内容 | 可以检查什么 |
| --- | --- |
| 整理移动端登录页的改进清单 | 日常聊天密度、列表与建议阅读 |
| 开始手机界面审计 | 官方 read 工具、长中文、表格、代码块、轨迹 |
| 演示子智能体 | 创建真实子会话，展开列表、进入子会话、返回父会话 |
| 演示多层子智能体 | A创建固定描述B，B首轮创建只读叶子D；原生两层目录与直接父返回 |
| 演示提问 | 官方单选问题卡、提交答案及确认 |
| 演示审批 | 官方权限审批，批准后仅执行输出固定文字的 printf |

审批场景先把会话访问模式改为“仅可查看”，再发送提示；是否出现审批由 Host 的正常权限策略决定。其他场景使用“工作区内修改”。

模型菜单还提供 **Mobile Audit — Extended Reasoning Preview**，用于检验长名称；它与默认模型一样只在本地运行。

多层测试仅两层不同task marker：新B描述为`MOBILE_AUDIT_NESTED_B · 两层目录父节点`，D为`MOBILE_AUDIT_NESTED_D · 只读叶子`。D只读原固定资料后停止，B等待D后停止，A等待B后停止；不把one-shot会话改为可续聊，也不递归自调用。已有旧子会话可作为C叶子，得到A三下游、新B一个、D/旧子会话零个。完成标记分别为`MOBILE_AUDIT_NESTED_D_COMPLETE`、`MOBILE_AUDIT_NESTED_B_COMPLETE`和`MOBILE_AUDIT_NESTED_ROOT_COMPLETE`。

## 单独构建与测试

```sh
node dev/fixture/build.mjs
node dev/fixture/smoke.mjs
```

构建脚本根据当前目录生成 `dist/index.js` 和 `overlay.yml`，通过 pnpm 全局项目发现 Host 的共享包。移动目录后重新构建即可。若有多个安装，可通过 `MOBILE_AUDIT_RUNTIME` 指定 `@deepseek-ai/dsh` 包目录。

演示模型的 token 数和回答均为测试数据。模型本身不访问外部模型服务；会话、工具结果、子代理和审批仍由 DSH 正常生成。生成文件与演示 Home 均已加入 gitignore。多层演示的overlay仅对正式Host行`subagent.config`设置`maxDepth: 2`，保留实际schema的`maxActiveSubagents`默认；标准preset的delegation工具未显式限制深度，沿公开owner策略使用该值，整套preset不替换。只影响测试overlay，不改产品默认或日用配置。
