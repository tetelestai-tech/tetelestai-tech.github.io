import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";

const asset = name => new URL(`../dist/client/assets/${name}`, import.meta.url);

function webpSize(bytes) {
  assert.equal(bytes.subarray(0, 4).toString(), "RIFF");
  assert.equal(bytes.subarray(8, 12).toString(), "WEBP");
  for (let offset = 12; offset + 8 < bytes.length;) {
    const type = bytes.subarray(offset, offset + 4).toString();
    const length = bytes.readUInt32LE(offset + 4);
    if (type === "VP8L") {
      assert.equal(bytes[offset + 8], 0x2f, "The image must be losslessly encoded");
      const size = bytes.readUInt32LE(offset + 9);
      return [1 + (size & 0x3fff), 1 + ((size >>> 14) & 0x3fff)];
    }
    offset += 8 + length + (length % 2);
  }
  assert.fail("Missing lossless image data");
}

test("the release provides proportional lossless symbol variants for the actual display sizes", async () => {
  for (const [width, maximum] of [[144, 20000], [320, 45000], [640, 120000]]) {
    const bytes = await readFile(asset(`tetelestai-symbol-${width}.webp`));
    assert.deepEqual(webpSize(bytes), [width, width]);
    assert.ok(bytes.length < maximum, `The ${width}px variant must reduce transfer size`);
  }
});

test("the circuit derivative preserves its native dimensions and reduces transfer size", async () => {
  const bytes = await readFile(asset("circuit-network.webp"));
  assert.deepEqual(webpSize(bytes), [1672, 941]);
  assert.ok(bytes.length < 300000);
});

test("the favicon is a small PNG instead of loading the full protected symbol", async () => {
  const bytes = await readFile(asset("tetelestai-favicon.png"));
  assert.deepEqual([bytes.readUInt32BE(16), bytes.readUInt32BE(20)], [64, 64]);
  assert.ok(bytes.length < 20000);
  const html = await readFile(new URL("../dist/client/index.html", import.meta.url), "utf8");
  assert.match(html, /<link[^>]+rel="icon"[^>]+href="\/assets\/tetelestai-favicon\.png"/);
});

test("the initial home uses responsive WebP sources without preloading their PNG fallbacks", async () => {
  const html = await readFile(new URL("../dist/client/index.html", import.meta.url), "utf8");
  assert.ok(/<picture[^>]*>[\s\S]*?<source[^>]+type="image\/webp"/.test(html), "The HTML must offer WebP picture sources");
  assert.match(html, /tetelestai-symbol-144\.webp/);
  assert.match(html, /tetelestai-symbol-640\.webp/);
  const preloads = html.match(/<link\b[^>]+rel="preload"[^>]*>/g) ?? [];
  assert.ok(!preloads.some(tag => /tetelestai-symbol\.png|circuit-network\.png/.test(tag)),
    "The server must not force redundant downloads of the image fallbacks");
});

test("image optimization retains the exact protected originals", async () => {
  const expected = {
    "tetelestai-symbol.png": "2d9c7c3c12403aa55de0b8092cb78c7898615d084e0fd7bfedcb922dd7c063fd",
    "circuit-network.png": "c3ecb4a6b71115df91bb0b6bc793a53d16ab167faaddcb582093cf73b14a769d",
    "tetelestai-share.png": "4ad291462b2a3af07c0300dd6ac786978bd7fa3535392539779b72ec0d8bf508",
  };
  for (const [name, hash] of Object.entries(expected)) {
    assert.equal(createHash("sha256").update(await readFile(asset(name))).digest("hex"), hash);
  }
});
