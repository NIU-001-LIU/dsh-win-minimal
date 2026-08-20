# dsh-win-minimal

<div align="center">

**A real minimal mode for DeepSeek Harness on Windows.**

One-line persona · zero runtime context · three tools · shortest fixed prefix

[![npm](https://img.shields.io/npm/v/dsh-win-minimal)](https://www.npmjs.com/package/dsh-win-minimal)
[![license](https://img.shields.io/badge/license-MIT-22c55e)](LICENSE)
[![platform](https://img.shields.io/badge/platform-Windows-0078d4)]()
[![topic](https://img.shields.io/badge/topic-dsh--plugin-blue)]()

</div>

---

## What it is

An **agent preset**. After installation, new sessions offer a「Minimal (Windows)」choice whose entire system prompt is:

```text
You are a helpful software engineer assistant.
```

Three tools only:

| Tool | What it does |
|---|---|
| `gitbash` | Git for Windows bash, globally registered (one shot per command) |
| `str_replace_editor` | File editing |
| `web_search` | Web search via the host's configured search provider |

## Why

The shipped minimal preset relies on a **persistent bash PTY** whose readiness detection needs PTY process inspection — unsupported on win32. DSH Desktop therefore hides minimal on Windows entirely.

This preset is its Windows equivalent: same fixed persona + complete mode, same no-runtime-context / no-compaction, same str_replace_editor — with the persistent bash swapped for one-shot gitbash (the platform's only honest equivalent). Because the prompt prefix is as short and as stable as it gets, KV-cache reuse across a long session is maximized.

## Quick start

```sh
# CLI / web profile
dsh plugin --profile web add dsh-win-minimal

# DSH Desktop
dsh plugin --profile desktop add dsh-win-minimal
```

(Replace `--profile` with the profile you actually use.)

Restart DSH, create a session, pick **Minimal (Windows)**. The plugin materializes the preset under `$DSH_HOME/.agent-presets/win-minimal/`.

### Manual install

Copy the two files in `preset/` to `$DSH_HOME/.agent-presets/win-minimal/`. That is the whole preset.

## Customization

Presets are declarative: edit `agent.cordis.yml` (persona text, tool rows), new sessions pick changes up immediately. Delete the directory to remove. With `dsh-wsl-workspace` installed, a `wsl-win-minimal` variant is generated automatically.

## Design notes

- bash is one-shot, not persistent (the persistent PTY cannot run on Windows)
- materialization is idempotent and never overwrites user-edited files
- host-only, zero injects — a write failure can never break a profile boot

## License

[MIT](LICENSE)
