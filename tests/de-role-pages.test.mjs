import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import worker from "../worker/index.js";
import { measurementPath } from "../src/analytics.mjs";

test("De Rolê support has an exact GET/HEAD fallback without opening unknown paths", async () => {
  for (const pathname of ["/de-role/suporte", "/de-role/suporte/"]) {
    for (const method of ["GET", "HEAD"]) {
      const calls = [];
      const response = await worker.fetch(new Request(`https://example.test${pathname}?source=store`, {
        method, headers: { accept: "text/html" },
      }), { ASSETS: { fetch: async request => {
        const url = new URL(request.url);
        calls.push(url.pathname + url.search);
        return url.pathname === "/de-role/suporte/index.html" && !url.search
          ? new Response(method === "HEAD" ? null : "De Rolê support", { status: 200 })
          : new Response(null, { status: 404 });
      } } });
      assert.equal(response.status, 200);
      assert.deepEqual(calls, [`${pathname}?source=store`, "/de-role/suporte/index.html"]);
    }
  }
  const response = await worker.fetch(new Request("https://example.test/de-role/unknown/", {
    headers: { accept: "text/html" },
  }), { ASSETS: { fetch: async () => new Response(null, { status: 404 }) } });
  assert.equal(response.status, 404);
});

test("De Rolê support is public static content with contact, privacy and no Analytics eligibility", async () => {
  const html = await readFile(new URL("../dist/client/de-role/suporte/index.html", import.meta.url), "utf8");
  assert.match(html, /Suporte do De Rolê/);
  assert.match(html, /mailto:contato@tetelestai\.tech/);
  assert.match(html, /href="\/privacidade\/"/);
  assert.match(html, /540/);
  assert.match(html, /720/);
  assert.match(html, /<meta name="robots" content="noindex,nofollow"/);
  assert.match(html, /<link rel="canonical" href="https:\/\/tetelestai\.tech\/de-role\/suporte\/"/);
  assert.equal(measurementPath("/de-role/suporte/"), null);
  assert.equal(measurementPath("/de-role/suporte"), null);
});

test("De Rolê privacy supplement is in both legal pages without changing their routing or Analytics eligibility", async () => {
  for (const [pathname, heading] of [["privacidade", "Aplicativo De Rolê"], ["en/privacy", "De Rolê app"]]) {
    const html = await readFile(new URL(`../dist/client/${pathname}/index.html`, import.meta.url), "utf8");
    assert.ok(html.includes(heading));
    assert.match(html, /2026-10-09/);
    assert.match(html, /contato@tetelestai\.tech/);
    assert.match(html, /noindex,nofollow/);
  }
  assert.equal(measurementPath("/privacidade/"), null);
  assert.equal(measurementPath("/en/privacy/"), null);
});
