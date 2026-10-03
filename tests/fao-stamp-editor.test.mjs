import test from 'node:test';
import assert from 'node:assert/strict';
import { createStampCustomization } from '../src/fao-preview/stamp-editor.js';

const keys = { sold: 'fao-preview-stamp-v1', reserved: 'fao-preview-reserved-stamp-v1' };
const custom = { src: 'data:image/webp;base64,AAAA', position: 'bottom-right', size: 'small', width: 600, height: 200 };

// Supply browser boundaries only: the real controller handles draft state,
// normalization, serialization and all decisions about saving.
class Field extends EventTarget {
  value = '';
  checked = false;
  disabled = false;
  open = false;
  textContent = '';
  innerHTML = '';
  files = [];
  attributes = new Map();
  setAttribute(name, value) { this.attributes.set(name, String(value)); }
  showModal() { this.open = true; }
  close() { this.open = false; this.dispatchEvent(new Event('close')); }
}

function fixture(t, saved = {}) {
  const fields = new Map();
  const field = id => {
    if (!fields.has(id)) fields.set(id, new Field());
    return fields.get(id);
  };
  const positions = ['top-left', 'top-right', 'bottom-left', 'bottom-right'].map(value => Object.assign(new Field(), { value }));
  field('stamp-editor').querySelectorAll = () => positions;
  const values = new Map(Object.entries(saved).map(([status, value]) => [keys[status], JSON.stringify(value)]));
  const writes = [], saves = [];
  let failStorage = false, imageResult = null;
  const globals = {
    document: Object.assign(new EventTarget(), {
      getElementById: field,
      createElement(tag) {
        assert.equal(tag, 'canvas');
        return { width: 0, height: 0, getContext: () => ({ drawImage() {} }), toDataURL: () => imageResult.src };
      },
    }),
    localStorage: {
      getItem: key => values.get(key) ?? null,
      setItem(key, value) {
        if (failStorage) throw new Error('Storage is unavailable');
        values.set(key, String(value));
        writes.push(key);
      },
    },
    createImageBitmap: () => imageResult.promise,
  };
  const previous = new Map(Object.keys(globals).map(key => [key, Object.getOwnPropertyDescriptor(globalThis, key)]));
  for (const [key, value] of Object.entries(globals)) Object.defineProperty(globalThis, key, { configurable: true, writable: true, value });
  t.after(() => {
    for (const [key, descriptor] of previous) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else delete globalThis[key];
    }
  });
  createStampCustomization({ getPreviewPhoto: () => 'car.jpg', getPreviewTitle: () => 'Ford', onSave: status => saves.push(status) });
  return {
    field, values, writes, saves,
    open(status) { field(status === 'sold' ? 'open-stamp-editor' : 'open-reserved-stamp-editor').onclick(); },
    size(value) { field('stamp-size').value = value; field('stamp-size').onchange(); },
    position(value) {
      for (const input of positions) input.checked = input.value === value;
      positions.find(input => input.checked).dispatchEvent(new Event('change'));
    },
    selectedPosition() { return positions.find(input => input.checked)?.value; },
    save() { field('stamp-editor-form').onsubmit({ preventDefault() {} }); },
    restore() { field('restore-stamp').onclick(); },
    cancel() { field('cancel-stamp').onclick(); },
    failStorage(value) { failStorage = value; },
    upload({ src = custom.src, width = custom.width, height = custom.height } = {}) {
      let resolve, reject;
      imageResult = { src, promise: new Promise((ok, fail) => { resolve = ok; reject = fail; }) };
      field('stamp-upload').files = [new Blob(['image'], { type: 'image/webp' })];
      const complete = field('stamp-upload').onchange({ target: field('stamp-upload') });
      return {
        finish() { resolve({ width, height, close() {} }); return complete; },
        fail() { reject(new Error('Image could not be decoded')); return complete; },
      };
    },
  };
}

for (const status of ['sold', 'reserved']) {
  test(`${status}: opening saved settings disables Save`, t => {
    const f = fixture(t);
    f.open(status);
    assert.equal(f.field('save-stamp').disabled, true);
    assert.equal(f.field('stamp-editor').open, true);
  });

  test(`${status}: size and position round trips clear the dirty state`, t => {
    const f = fixture(t);
    f.open(status);
    f.size('large');
    assert.equal(f.field('save-stamp').disabled, false);
    f.size('medium');
    assert.equal(f.field('save-stamp').disabled, true);
    f.position('bottom-right');
    assert.equal(f.field('save-stamp').disabled, false);
    f.position('top-left');
    assert.equal(f.field('save-stamp').disabled, true);
  });

  test(`${status}: unchanged submit does not create storage or notify consumers`, t => {
    const f = fixture(t);
    f.open(status);
    f.save();
    assert.deepEqual([...f.values], []);
    assert.deepEqual(f.writes, []);
    assert.deepEqual(f.saves, []);
    assert.equal(f.field('stamp-editor').open, true);
  });

  test(`${status}: restoring saved defaults leaves Save disabled`, t => {
    const f = fixture(t);
    f.open(status);
    f.restore();
    assert.equal(f.field('save-stamp').disabled, true);
    f.size('large');
    f.position('bottom-left');
    f.restore();
    assert.equal(f.field('save-stamp').disabled, true);
    f.save();
    assert.deepEqual(f.writes, []);
  });

  test(`${status}: restoring custom settings saves only that status and clears dirty state`, t => {
    const other = status === 'sold' ? 'reserved' : 'sold';
    const f = fixture(t, { sold: custom, reserved: custom });
    f.open(status);
    f.restore();
    assert.equal(f.field('save-stamp').disabled, false);
    f.save();
    assert.equal(f.field('save-stamp').disabled, true);
    assert.equal(f.field('stamp-editor').open, false);
    assert.deepEqual(f.writes, [keys[status]]);
    assert.deepEqual(f.saves, [status]);
    assert.deepEqual(JSON.parse(f.values.get(keys[other])), custom);
    assert.deepEqual(JSON.parse(f.values.get(keys[status])), {
      src: status === 'sold' ? './assets/sold-stamp-soft-white.png' : './assets/reserved-stamp-soft-white.png',
      position: 'top-left', size: 'medium', width: 1536, height: 1024,
    });
    f.open(status);
    assert.equal(f.field('save-stamp').disabled, true);
    f.open(other);
    assert.equal(f.field('save-stamp').disabled, true);
    assert.equal(f.field('stamp-size').value, 'small');
  });

  test(`${status}: cancel discards unsaved edits before reopening`, t => {
    const f = fixture(t, { [status]: custom });
    f.open(status);
    f.size('large');
    f.position('top-left');
    f.cancel();
    assert.equal(f.field('save-stamp').disabled, true);
    f.open(status);
    assert.equal(f.field('save-stamp').disabled, true);
    assert.equal(f.field('stamp-size').value, 'small');
    assert.equal(f.selectedPosition(), 'bottom-right');
    assert.deepEqual(f.writes, []);
  });

  test(`${status}: failed storage preserves the changed draft for retry`, t => {
    const f = fixture(t);
    f.open(status);
    f.size('large');
    f.failStorage(true);
    f.save();
    assert.equal(f.field('save-stamp').disabled, false);
    assert.equal(f.field('stamp-editor').open, true);
    assert.deepEqual(f.saves, []);
    assert.deepEqual(f.writes, []);
    f.failStorage(false);
    f.save();
    assert.equal(JSON.parse(f.values.get(keys[status])).size, 'large');
    assert.equal(f.field('save-stamp').disabled, true);
    f.open(status);
    assert.equal(f.field('save-stamp').disabled, true);
    assert.equal(f.field('stamp-size').value, 'large');
  });

  test(`${status}: uploading the saved image stays clean after processing`, async t => {
    const f = fixture(t, { [status]: custom });
    f.open(status);
    const upload = f.upload();
    assert.equal(f.field('save-stamp').disabled, true);
    f.save();
    assert.deepEqual(f.writes, []);
    await upload.finish();
    assert.equal(f.field('save-stamp').disabled, true);
    assert.equal(f.field('choose-stamp').disabled, false);
    f.save();
    assert.deepEqual(f.writes, []);
  });

  test(`${status}: a failed upload cannot enable an unchanged draft`, async t => {
    const f = fixture(t);
    f.open(status);
    const upload = f.upload();
    await upload.fail();
    assert.equal(f.field('save-stamp').disabled, true);
    assert.equal(f.field('stamp-editor').open, true);
  });
}

for (const change of [
  { name: 'source', image: { src: 'data:image/webp;base64,BBBB' }, expected: { ...custom, src: 'data:image/webp;base64,BBBB' } },
  { name: 'width', image: { width: 590 }, expected: { ...custom, width: 590 } },
  { name: 'height', image: { height: 190 }, expected: { ...custom, height: 190 } },
]) {
  test(`an upload with a changed ${change.name} enables saving only after processing`, async t => {
    const f = fixture(t, { sold: custom });
    f.open('sold');
    const upload = f.upload(change.image);
    assert.equal(f.field('save-stamp').disabled, true);
    await upload.finish();
    assert.equal(f.field('save-stamp').disabled, false);
    f.save();
    assert.deepEqual(JSON.parse(f.values.get(keys.sold)), change.expected);
    assert.equal(f.field('save-stamp').disabled, true);
  });
}

test('closing an upload prevents its late result from changing another status', async t => {
  const f = fixture(t);
  f.open('sold');
  const upload = f.upload();
  f.cancel();
  f.open('reserved');
  await upload.finish();
  assert.equal(f.field('save-stamp').disabled, true);
  assert.match(f.field('stamp-preview-overlay').innerHTML, /reserved-stamp-soft-white\.png/);
  f.save();
  assert.deepEqual(f.writes, []);
});
