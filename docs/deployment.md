# Deployment and update

本指南用于发布 Mobile Workbench，并更新本机日用 DSH。源码仓库为 [TTTPOB/dsh-mobile-workbench](https://github.com/TTTPOB/dsh-mobile-workbench)，安装包名为 `dsh-web-mobile`。

## 发布

1. 更新 `package.json` 版本及使用指南，执行类型检查、相关测试和 clean build。源码与 `lib/` 同批提交。
2. 用 `pnpm pack` 生成 `dsh-web-mobile-<version>.tgz`。按仓库保护规则推送源码，再创建 `v<version>` tag。
3. 在 GitHub Release 上传安装包，公开说明只写当前功能、兼容范围和实际验证结果，保留来源与 MIT 许可证。

已发布的 tag 和资产保持不可变。需要修订时递增版本，不覆盖原包。当前 3.1.0 的安装来源为：

```text
https://github.com/TTTPOB/dsh-mobile-workbench/releases/download/v3.1.0/dsh-web-mobile-3.1.0.tgz
```

## 日用部署

本机日用入口为 `dsh-web.service`，监听 `127.0.0.1:53083`，消费 `$HOME/.dsh/profiles/web`。更新只替换该 profile 的移动端依赖；保留其他依赖、bundle 顺序、patch、DSH_HOME 和服务启动参数。

部署前确认用户授权，并读取当前服务状态与 profile manifest。为回滚暂存 profile 的 `package.json`、`pnpm-lock.yaml` 和 `pnpm-workspace.yaml`；不复制 sessions、storages 或凭据。

在外部运维进程中执行停服、安装、启动：

```sh
PROFILE="$HOME/.dsh/profiles/web"
VERSION=3.1.0
URL="https://github.com/TTTPOB/dsh-mobile-workbench/releases/download/v$VERSION/dsh-web-mobile-$VERSION.tgz"

systemctl --user stop dsh-web.service
corepack pnpm@11.24.0 --dir "$PROFILE" \
  --config.auto-install-peers=false add "$URL" \
  --prefer-offline --ignore-scripts
systemctl --user start dsh-web.service
```

插件使用 profile 的普通依赖和 Host 共享 peers。`auto-install-peers=false` 保持原有共享模块解析；peer warning 本身不是失败判据。当前包没有需要执行的安装脚本，安装使用 `--ignore-scripts`。

## 从当前 GUI 安排重启

承载当前会话的 Host 不能由当前会话直接停掉。准备完整运维脚本，通过独立 user systemd unit 直接执行；脚本负责停服、安装、启动、自检和失败恢复，并留出时间交付状态入口。

```sh
systemd-run --user --collect --unit=dsh-mobile-update \
  --property=Type=exec \
  /bin/bash /absolute/path/update.sh
```

确认运维单元的 `ControlGroup` 与 `dsh-web.service` 不同。脚本完成后写入结果与日志并退出，单元自动回收。失败时恢复暂存的 profile 元数据，用 pnpm frozen install 恢复依赖并启动原服务，报告实际恢复结果。

## 验收

- **安装**：实际解析的 `dsh-web-mobile/package.json` 为目标版本；其他直接依赖和 profile 组合不变。
- **服务**：`dsh-web.service` 为 active，新进程恢复原端口。
- **服务器资源**：读取公开 `/plugins/events` 中的 graph 后关闭连接，取得移动端 entry URL；确认服务器提供目标客户端内容。rc.2 可能添加 combo 分隔符和 source-map 尾缀，比较时区分包装与可执行代码。
- **页面**：刷新或重新连接后确认实际界面。服务器已发布新包，不等于已有浏览器已应用；尚未检查页面时明确记录这一边界。

已有 bundle 升级按 `restart-required` 处理。不要用安装版本、profile HMR、PWA 横幅或另起服务器代替日用更新验收。

## 清理

成功部署并确认安装来源为 GitHub Release URL 后，删除本地安装 tarball、打包解压目录、临时测试 Home、安装脚本和过渡备份。保留源码、提交、不可变 Release、必要截图和部署结果记录。

删除旧包前检查消费 profile 是否仍使用其 `file:` 路径。有引用时先处理消费者；不直接删除 `node_modules` 或清空 pnpm 全局 store/cache。历史取证文档可以保留，当前安装入口应指向公开 Release。
