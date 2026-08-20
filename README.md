# dsh-win-minimal

<div align="center">

**让 Windows 上的 DeepSeek Harness 也有真正的极简模式。**

一句话 persona · 零运行时上下文 · 三工具 · 自动压缩 · 固定最短前缀

[![npm](https://img.shields.io/npm/v/dsh-win-minimal)](https://www.npmjs.com/package/dsh-win-minimal)
[![license](https://img.shields.io/badge/license-MIT-22c55e)](LICENSE)
[![platform](https://img.shields.io/badge/platform-Windows-0078d4)]()
[![topic](https://img.shields.io/badge/topic-dsh--plugin-blue)]()
[![dshfind](https://dshfind.com/api/badge/jueburenshu123/dsh-win-minimal?lang=zh)](https://dshfind.com/zh/plugins/jueburenshu123/dsh-win-minimal)

</div>

---

## 它是什么

一个 **agent preset**：装上后，新建会话时多出一个「极简模式（Windows）」选项。

```text
┌─────────────────────────────────────────────┐
│  整个 system prompt：                        │
│                                             │
│  You are a helpful software engineer        │
│  assistant.                                 │
│                                             │
│  （就这一句，没有别的）                        │
└─────────────────────────────────────────────┘
```

工具只有三个：

| 工具 | 能力 |
|---|---|
| `gitbash` | 全局注册的 Git for Windows bash（一次一命令） |
| `str_replace_editor` | 文件编辑 |
| `web_search` | 联网搜索（跟随宿主已配置的搜索 provider） |

## 为什么需要它

DSH 官方自带 minimal preset，但它依赖**持久 bash 终端**——其就绪检测需要 PTY 进程检查，**Windows 上不可用**。因此 DSH Desktop 在 Windows 上干脆把 minimal 整个隐藏了。

本 preset 是官方 minimal 的 Windows 等价物：

| | 官方 minimal | dsh-win-minimal |
|---|---|---|
| persona | 一句固定提示词 + complete | ✅ 相同 |
| 运行时上下文 | 关闭 | ✅ 相同 |
| 上下文压缩 | 无 | ✅ 有（自动压缩 + /compact） |
| 文件编辑 | str_replace_editor | ✅ 相同 |
| shell | 持久 bash（PTY） | 一次性 gitbash（Windows 无解，等价替代） |

因为 prompt 前缀**完全固定且最短**，长会话的 KV cache 命中率最高——这是官方 minimal 的设计意图，本 preset 在 Windows 上把它还给你。

## 快速开始

### 方式一：插件安装

```sh
# CLI / web profile
dsh plugin --profile web add dsh-win-minimal

# DSH Desktop
dsh plugin --profile desktop add dsh-win-minimal
```

（`--profile` 换成你实际使用的 profile 名即可。）

### 安装后在哪看到它 ⚠️

**不在「插件」设置里**（它不是一个 UI 插件）。它在两处：

1. **新建会话**时的 preset 下拉选择器（聊天输入框上方）——每次会话选它用
2. **设置 → Agent（智能体）→ Agent Preset 面板**——预设列表里能看到并可设为默认值

自查文件是否物化成功：

```sh
ls "$DSH_HOME/.agent-presets/win-minimal/"                  # Linux / macOS
dir "%USERPROFILE%\.dsh\.agent-presets\win-minimal"          # Windows（未设 DSH_HOME 时）
```

文件在而两处都没有 → 完全重启 DSH 再看。仍无则提 issue，附上目录清单。

插件会把 preset 文件物化到 `$DSH_HOME/.agent-presets/win-minimal/`。

### 方式二：手动安装（不装插件也行）

preset 就是两个数据文件。把本仓库 `preset/` 目录复制过去即可：

```
$DSH_HOME/.agent-presets/win-minimal/agent.cordis.yml
$DSH_HOME/.agent-presets/win-minimal/preset.yml
```

## 自定义

preset 是声明式组装，改完新会话立即生效：

- **改 persona**：编辑 `agent.cordis.yml` 里 persona 行的 `text`
- **加减工具**：直接增删组装行（比如去掉 `tool-web` 或加回 todo）
- **删掉**：删除 `win-minimal/` 目录
- **WSL**：配合 `dsh-wsl-workspace` 自动生成 `wsl-win-minimal` 变体

## 设计取舍

- **bash 非持久**：Windows 跑不了官方 minimal 的持久 PTY，用一次性 gitbash 等价替代（前提：装有 `dsh-tool-gitbash` 等全局 gitbash 工具）
- **幂等物化**：插件只写一次，**绝不覆盖**你手工改过的文件
- **零风险安装**：host-only、无客户端 bundle、零硬注入——写文件失败只告警，不可能拖垮启动

## License

[MIT](LICENSE)

## 开发

```sh
npm test          # 结构校验（preset 文件 + 安装器，零依赖）
node --check index.js
```
