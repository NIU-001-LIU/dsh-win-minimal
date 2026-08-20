# dsh-win-minimal

**Windows 极简模式**：给 DeepSeek Harness 装一个 `win-minimal` agent preset——固定单句提示词、无运行时上下文、无上下文压缩的轻量编码会话。

## 为什么存在

官方 minimal preset 的持久 bash 依赖 PTY 进程检查，win32 上不可用，因此 DSH Desktop 在 Windows 上隐藏了整个 minimal。本 preset 是它的 Windows 等价物：

- **persona**：`You are a helpful software engineer assistant.` + `complete: true`——整个 system prompt 只有这一句，前缀最短且完全固定（KV cache 友好）
- **无运行时上下文快照、无上下文压缩**
- **工具**：`gitbash`（全局注册的 Git for Windows bash，一次一命令）+ `str_replace_editor` + `web_search`（跟随宿主已配置的搜索 provider）

## 安装

```sh
dsh plugin --profile web add dsh-win-minimal
```

（或把本包登记进 profile 的 bundles。）插件会把 preset 文件物化到：

```
$DSH_HOME/.agent-presets/win-minimal/agent.cordis.yml
$DSH_HOME/.agent-presets/win-minimal/preset.yml
```

重启 DSH，新建会话时在 preset 选择器里选「极简模式（Windows）」即可。

> 前提：bash 能力依赖全局 gitbash 工具（如 `dsh-tool-gitbash`）。

## 手动安装（不装插件也可以）

把本仓库 `preset/` 下的两个文件复制到 `$DSH_HOME/.agent-presets/win-minimal/` 即可——preset 本身就是数据文件。

## 自定义

- 改 persona：编辑 `agent.cordis.yml` 里 persona 行的 `text`
- 加/减工具：直接增删组装行（新会话立即生效）
- 删除：删掉 `$DSH_HOME/.agent-presets/win-minimal/` 目录

## 设计取舍

| 项 | 说明 |
|---|---|
| bash 非持久 | Windows 无法跑官方 minimal 的持久 PTY；用一次性 gitbash 等价替代 |
| 文件已存在时不覆盖 | 插件物化是幂等的，且绝不覆盖你手工改过的文件 |
| host-only、零注入 | 无客户端 bundle、无硬服务依赖，写文件失败只告警，不可能拖垮启动 |
| WSL | 配合 `dsh-wsl-workspace` 会自动生成 `wsl-win-minimal` 变体 |

## License

MIT
