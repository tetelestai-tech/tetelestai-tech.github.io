import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { packageRecargaWeb } from '../scripts/export-recarga-web.mjs';
import { verifyRecargaWeb } from '../scripts/verify-recarga-web.mjs';

function fixture(t, prefix = '/recarga') {
  const root = mkdtempSync(path.join(tmpdir(), 'recarga-export-test-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const source = path.join(root, 'export');
  const destination = path.join(root, 'release');
  mkdirSync(path.join(source, '_expo/static/js/web'), { recursive: true });
  mkdirSync(path.join(source, 'assets'), { recursive: true });
  writeFileSync(path.join(source, 'index.html'), `<html lang="en"><head><title>App</title><link rel="icon" href="${prefix}/favicon.ico" /></head><body><script src="${prefix}/_expo/static/js/web/app.js"></script></body></html>`);
  writeFileSync(path.join(source, '_expo/static/js/web/app.js'), 'window.appLoaded = true;');
  writeFileSync(path.join(source, 'favicon.ico'), 'icon');
  writeFileSync(path.join(source, 'assets/font.ttf'), 'font');
  writeFileSync(path.join(source, 'metadata.json'), '{"build":"internal"}');
  return { source, destination };
}

test('packages browser resources with Portuguese metadata and verifiable hashes', t => {
  const { source, destination } = fixture(t);
  packageRecargaWeb({ source, destination, version: '1.0.5' });
  const release = verifyRecargaWeb(destination);
  assert.equal(release.version, '1.0.5');
  assert.deepEqual(release.files.map(file => file.path), ['_expo/static/js/web/app.js', 'assets/font.ttf', 'favicon.ico', 'index.html']);
  assert.match(readFileSync(path.join(destination, 'index.html'), 'utf8'), /Ative o JavaScript/);
  writeFileSync(path.join(destination, 'assets/font.ttf'), 'damaged');
  assert.throws(() => verifyRecargaWeb(destination), /hash mismatch/);
});

test('rejects root-relative assets without altering an existing release', t => {
  const { source, destination } = fixture(t, '');
  mkdirSync(destination);
  writeFileSync(path.join(destination, 'existing.txt'), 'preserve');
  assert.throws(() => packageRecargaWeb({ source, destination, version: '1.0.5' }), /base path/);
  assert.equal(readFileSync(path.join(destination, 'existing.txt'), 'utf8'), 'preserve');
});

test('rejects source maps and unexpected export files before publication', t => {
  const { source, destination } = fixture(t);
  writeFileSync(path.join(source, '_expo/static/js/web/app.js.map'), '{}');
  assert.throws(() => packageRecargaWeb({ source, destination, version: '1.0.5' }), /Unexpected export file/);
});

test('does not replace files outside a previously validated release', t => {
  const { source, destination } = fixture(t);
  packageRecargaWeb({ source, destination, version: '1.0.5' });
  writeFileSync(path.join(destination, 'keep.txt'), 'preserve');
  assert.throws(() => packageRecargaWeb({ source, destination, version: '1.0.5' }), /Unmanaged release file/);
  assert.equal(readFileSync(path.join(destination, 'keep.txt'), 'utf8'), 'preserve');
});
