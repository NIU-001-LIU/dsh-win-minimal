## 0.1.1 — 2026-08-20

- README: clarify where the preset appears (new-session preset selector, not settings) and add a self-check for materialized files.

# Changelog

## 0.1.0 — 2026-08-20

- Initial release: `dsh-win-minimal` preset installer.
  - `win-minimal` agent preset (fixed one-line persona in complete mode, no runtime context, no compaction)
  - Tools: gitbash (global) + str_replace_editor + web_search
  - Host-only plugin, zero injects, idempotent materialization that never overwrites user edits
  - `preset/` directory ships the two raw files for manual install
