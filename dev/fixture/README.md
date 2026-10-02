# 本地界面演示模型

Mobile Audit 为界面验收生成确定性内容，不需要 API Key。它通过 DSH 的正式模型适配器和工具执行链工作。

## 启动

从仓库根目录执行：

```sh
node scripts/demo.mjs --port 54076
```

需要 Node.js 24+、pnpm，以及本机已安装的 DSH 0.1.7-rc.2。脚本创建仓库内的 `.demo-home`，不会使用日用 DSH Home。根据终端输出打开本地 URL，并选择打印出的 workspace 目录。

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

演示模型的 token 数和回答均为测试数据。模型本身不访问外部模型服务；会话、工具结果、子代理和审批仍由 DSH 正常生成。生成文件与演示 Home 均已加入 gitignore。
