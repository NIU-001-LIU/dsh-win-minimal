/**
 * dsh-win-minimal: materializes the `win-minimal` agent preset into the
 * user's agent-presets root (`$DSH_HOME/.agent-presets/win-minimal/`).
 *
 * The preset itself is two declarative files — a fixed one-line persona
 * (complete mode: the whole system prompt is that sentence, no runtime
 * context snapshots), the bare local filesystem + str_replace_editor, and
 * the web_search tool (which follows whatever search provider the host has
 * configured). The bash capability comes from the globally registered
 * `gitbash` tool (dsh-tool-gitbash); the persistent PTY bash of the
 * official minimal preset cannot run on Windows, so this variant stays
 * strictly one-shot.
 *
 * Host-only by design: no client bundle, no hard service injects, and every
 * filesystem step is guarded — this plugin can never fail a profile boot.
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { homedir } from 'node:os';

export const name = 'dsh-win-minimal';
/** No service injects: the materialization only touches the filesystem. */
export const inject = [];

const PRESET_DIR = 'win-minimal';

const CORDIS = `# Windows 极简模式：固定提示词 + 轻工具编码 Agent。
# 持久 bash PTY 在 win32 不可用（subprocess-local 检查器仅支持 linux/darwin），
# shell 能力由全局注册的 gitbash 工具提供（如 dsh-tool-gitbash）。

- id: persona
  name: '@deepseek-ai/dsh-persona'
  config:
    text: You are a helpful software engineer assistant.
    complete: true
    includeRuntimeContext: false

# 本地文件系统遮蔽宿主的沙箱 fs 提供方（仅本 preset 作用域）。
# 编辑器共享该 realm，要求绝对路径。
- id: filesystem
  name: cordis:group
  group: true
  isolate:
    fs: true
  config:
    - id: fs-local
      name: '@deepseek-ai/dsh-fs-local'
      config:
        cwd: !!js process.env.DSH_CWD ?? process.cwd()

    - id: str-replace-editor
      name: '@deepseek-ai/dsh-tool-str-replace-editor'
      config:
        maxOutputChars: 16000

# 联网搜索：走宿主已配置的 web 搜索 provider（官方 DeepSeek 或第三方均可）。
- id: tool-web
  name: '@deepseek-ai/dsh-tool-web'
  config:
    fetch: false
    searchTimeoutMs: 60000

# ── 上下文压缩 ─────────────────────────────────────────────────────────────
# 与标准模式相同的压缩链：自动压缩（接近上限时较早历史压成摘要）+
# /compact 手动压缩 + 工具结果裁剪。tokenMeter 仍在宿主平面（标准模式同款）。
- id: compaction
  name: cordis:group
  group: true
  isolate:
    compaction: true
    toolResultPruner: true
  config:
    - id: compaction-basic
      name: '@deepseek-ai/dsh-compaction-basic'

    - id: command-compact
      name: '@deepseek-ai/dsh-command-compact'

    - id: tool-result-pruner
      name: '@deepseek-ai/dsh-compaction-tool-result-pruner'
      config:
        thresholdChars: 8192
        headChars: 4096
        tailChars: 1024
`;

const META = `name: '极简模式（Windows）'
description: 'Windows 极简编码 Agent：gitbash + str_replace_editor + web_search，固定单句提示词、无运行时上下文、含自动压缩（/compact）。'
`;

function dshHome() {
  return process.env.DSH_HOME ?? join(homedir(), '.dsh');
}

async function materialize(logger) {
  const dir = join(dshHome(), '.agent-presets', PRESET_DIR);
  await mkdir(dir, { recursive: true });
  const cordisPath = join(dir, 'agent.cordis.yml');
  const metaPath = join(dir, 'preset.yml');
  // Idempotent but never clobbers a user's own edits: when the files
  // already exist, leave them alone.
  let hasCordis = true;
  try {
    await readFile(cordisPath);
  } catch (error) {
    if (error?.code !== 'ENOENT') throw error;
    hasCordis = false;
  }
  if (!hasCordis) await writeFile(cordisPath, CORDIS, 'utf8');
  let hasMeta = true;
  try {
    await readFile(metaPath);
  } catch (error) {
    if (error?.code !== 'ENOENT') throw error;
    hasMeta = false;
  }
  if (!hasMeta) await writeFile(metaPath, META, 'utf8');
  logger?.info?.(
    `[dsh-win-minimal] preset available at ${dir}${hasCordis && hasMeta ? '' : ' (files materialized)'}`,
  );
}

export async function apply(ctx) {
  try {
    await materialize(ctx.logger);
  } catch (error) {
    // The preset is a convenience; a write failure must never fail the
    // profile boot. Users can always copy the two files manually.
    ctx.logger?.warn?.(`[dsh-win-minimal] preset materialization failed: ${error?.message ?? String(error)}`);
  }
}
