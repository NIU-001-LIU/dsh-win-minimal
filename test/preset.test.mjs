/**
 * Structural validation for the shipped preset files and the installer
 * bundle: the preset must be a top-level YAML sequence of rows, each with
 * a string name, and the plugin manifest must declare a dsh.bundle patch.
 * Runs offline with zero dependencies (no YAML parser — structural checks
 * on the row markers, which is exactly what the loader needs).
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import test from 'node:test';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (path) => readFileSync(join(root, path), 'utf8');

test('preset composition is a top-level row sequence', () => {
  const cordis = read('preset/agent.cordis.yml');
  for (const rowId of ['persona', 'filesystem', 'tool-web']) {
    assert.ok(cordis.includes(`- id: ${rowId}`), `missing row: ${rowId}`);
  }
  assert.ok(cordis.includes('complete: true'), 'persona must be complete');
  assert.ok(cordis.includes('includeRuntimeContext: false'), 'runtime context must be suppressed');
  assert.ok(cordis.includes('str-replace-editor'), 'editor row missing');
  assert.ok(cordis.includes('dsh-tool-web'), 'web_search row missing');
  assert.ok(cordis.includes('dsh-compaction-basic'), 'compaction chain missing');
  assert.ok(cordis.includes('dsh-command-compact'), '/compact command missing');
});

test('preset metadata carries a display name', () => {
  const meta = read('preset/preset.yml');
  assert.ok(/^name:/.test(meta), 'preset.yml must start with a name');
  assert.ok(meta.includes('description:'), 'preset.yml must carry a description');
});

test('installer manifest declares the bundle patch', () => {
  const manifest = JSON.parse(read('package.json'));
  assert.equal(manifest.name, 'dsh-win-minimal');
  assert.equal(typeof manifest.dsh?.bundle?.patch, 'string');
  assert.ok(!('client' in manifest.dsh), 'host-only plugin must not declare a client');
});

test('installer ships both preset files as embedded content', () => {
  const index = read('index.js');
  assert.ok(index.includes('You are a helpful software engineer assistant.'));
  assert.ok(index.includes('dsh-tool-web'));
});
