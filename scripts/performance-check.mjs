import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { gzipSync } from 'node:zlib';

// Transfer-size budgets catch accidental eager dependencies and CSS accumulation.
const assets = await readdir('dist/assets');
for (const [label, pattern, limit] of [
  ['client JavaScript', /^index-.*\.js$/, 112 * 1024],
  ['styles', /^index-.*\.css$/, 11 * 1024],
  ['deferred star', /^stellar-webgl-.*\.js$/, 140 * 1024],
]) {
  const files = assets.filter(name => pattern.test(name));
  assert.equal(files.length, 1, `Expected one ${label} bundle`);
  const content = await readFile(`dist/assets/${files[0]}`);
  const bytes = gzipSync(content).length;
  assert.ok(bytes <= limit, `${label}: ${bytes} gzip bytes exceed ${limit}`);
  console.log(`PASS ${label}: ${(bytes / 1024).toFixed(1)} KiB gzip / ${limit / 1024} KiB budget`);
}
