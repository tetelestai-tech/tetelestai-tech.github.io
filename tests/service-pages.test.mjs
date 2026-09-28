import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import test from "node:test";
import worker from "../worker/index.js";
import { createServer } from "vite";
import { createElement } from "react";
import { renderToString } from "react-dom/server";

const servicePages = [
  {
    path: "/criacao-de-sites/",
    heading: "Criação de sites para empresas",
    titlePattern: /criação de sites/i,
    canonical: "https://tetelestai.tech/criacao-de-sites/",
    shell: "/criacao-de-sites/index.html",
    fixture: "sites page",
  },
  {
    path: "/criacao-de-landing-pages/",
    heading: "Criação de landing pages para empresas",
    titlePattern: /criação de landing pages/i,
    canonical: "https://tetelestai.tech/criacao-de-landing-pages/",
    shell: "/criacao-de-landing-pages/index.html",
    fixture: "landing pages page",
  },
];

async function readBuiltHtml(pathname) {
  const file = new URL(`../dist/client${pathname}index.html`, import.meta.url);
  assert.ok(existsSync(file), `The build must emit ${pathname}index.html`);
  return readFile(file, "utf8");
}

function attribute(tag, name) {
  return tag.match(new RegExp(`\\b${name}=["']([^"']*)["']`, "i"))?.[1];
}

function tags(html, name) {
  return html.match(new RegExp(`<${name}\\b[^>]*>`, "gi")) ?? [];
}

function textContent(markup) {
  return markup.replace(/<!--[\s\S]*?-->/g, "").replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}

function metadata(html, name) {
  return tags(html, "meta")
    .filter((tag) => attribute(tag, "name") === name)
    .map((tag) => attribute(tag, "content"));
}

test("explicit index documents render the same page as their known directory routes", async () => {
  const renderer = await createServer({
    appType: "custom",
    server: { middlewareMode: true, hmr: false, ws: false, watch: null },
    optimizeDeps: { noDiscovery: true, include: [] },
  });
  try {
    const { App } = await renderer.ssrLoadModule("/src/App.jsx");
    const render = (pathname) => renderToString(createElement(App, { pathname }));
    for (const pathname of ["/", "/en/", "/criacao-de-sites/", "/criacao-de-landing-pages/", "/privacidade/", "/en/privacy/", "/recarga/suporte/"]) {
      assert.equal(render(`${pathname}index.html`), render(pathname), `${pathname}index.html must preserve its page during hydration`);
    }
    assert.match(render("/unknown-service/index.html"), /Página não encontrada/);
    assert.match(render("/criacao-de-sites/missing/index.html"), /Página não encontrada/);
  } finally {
    await renderer.close();
  }
});

for (const page of servicePages) {
  test(`${page.path} contains its service and WhatsApp contact before JavaScript runs`, async () => {
    const html = await readBuiltHtml(page.path);
    const main = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i)?.[1];
    assert.ok(main, "The initial HTML must contain the service's main content");
    const headings = [...main.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi)]
      .map((match) => textContent(match[1]));
    assert.deepEqual(headings, [page.heading]);
    const paragraphs = [...main.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/gi)]
      .map((match) => textContent(match[1]));
    assert.ok(paragraphs.some((text) => /\b(?:site|sites|landing page|landing pages)\b/i.test(text)),
      "Service copy must be present in the initial HTML, not only in a JavaScript bundle");
    assert.ok(tags(main, "a").some((tag) => attribute(tag, "href") === "https://wa.me/556184711930"),
      "The initial service content must link to the confirmed WhatsApp address");
  });

  test(`${page.path} has its own indexable Portuguese metadata without a false English alternative`, async () => {
    const html = await readBuiltHtml(page.path);
    const home = await readBuiltHtml("/");
    assert.equal(attribute(tags(html, "html")[0] ?? "", "lang"), "pt-BR");
    assert.match(textContent(html.match(/<title>([\s\S]*?)<\/title>/i)?.[1] ?? ""), page.titlePattern);
    assert.deepEqual(metadata(html, "robots"), ["index,follow"]);
    const descriptions = metadata(html, "description");
    assert.equal(descriptions.length, 1);
    assert.ok(descriptions[0]?.trim(), "The service must have a description");
    assert.notEqual(descriptions[0], metadata(home, "description")[0], "The service must not inherit the home description");
    const links = tags(html, "link");
    assert.deepEqual(links.filter((tag) => attribute(tag, "rel") === "canonical")
      .map((tag) => attribute(tag, "href")), [page.canonical]);
    assert.ok(!links.some((tag) => attribute(tag, "rel") === "alternate"
      && /^en(?:-|$)/i.test(attribute(tag, "hreflang") ?? "")),
    "There is no English translation of this service page");
  });

  test(`${page.path} falls back to its own HTML for exact GET and HEAD routes`, async () => {
    // ASSETS is an external hosting binding. Distinct fixtures expose wrong-route fallbacks.
    for (const pathname of [page.path, page.path.slice(0, -1)]) {
      for (const method of ["GET", "HEAD"]) {
        const calls = [];
        const response = await worker.fetch(new Request(`https://example.test${pathname}?source=search`, {
          method, headers: { accept: "text/html" },
        }), { ASSETS: { fetch: async (request) => {
          const url = new URL(request.url);
          calls.push([request.method, url.pathname + url.search]);
          const fixture = servicePages.find((candidate) => candidate.shell === url.pathname);
          if (!fixture || url.search) return new Response(null, { status: 404 });
          return new Response(request.method === "HEAD" ? null : fixture.fixture, {
            status: 200, headers: { "content-type": "text/html" },
          });
        } } });
        assert.equal(response.status, 200, `${method} ${pathname} must resolve`);
        assert.equal(await response.text(), method === "HEAD" ? "" : page.fixture);
        assert.deepEqual(calls, [[method, `${pathname}?source=search`], [method, page.shell]]);
      }
    }
  });
}

test("the Portuguese home exposes both service links in its initial main content", async () => {
  const html = await readBuiltHtml("/");
  const main = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i)?.[1];
  assert.ok(main, "The Portuguese home must be prerendered");
  const anchors = [...main.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi)];
  for (const page of servicePages) {
    assert.ok(anchors.some((match) => attribute(`<a ${match[1]}>`, "href") === page.path
      && textContent(match[2]).length > 0), `The home must expose a labeled link to ${page.path}`);
  }
});

test("the sitemap lists the two homes and the two service pages exactly once", async () => {
  const sitemap = await readFile(new URL("../dist/client/sitemap.xml", import.meta.url), "utf8");
  const locations = [...sitemap.matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/g)].map((match) => match[1]);
  assert.deepEqual(locations.sort(), [
    "https://tetelestai.tech/",
    "https://tetelestai.tech/en/",
    "https://tetelestai.tech/criacao-de-sites/",
    "https://tetelestai.tech/criacao-de-landing-pages/",
  ].sort());
});

test("unknown, malformed and asset paths never enter the service route fallback", async () => {
  for (const pathname of [
    "/unknown-service/",
    "/criacao-de-sites//",
    "/criacao-de-landing-pages//",
    "/criacao-de-sites/missing",
    "/criacao-de-landing-pages/missing",
    "/en/criacao-de-sites/",
    "/en/criacao-de-landing-pages/",
    "/criacao-de-sites/missing.js",
    "/criacao-de-landing-pages/missing.css",
    "/assets/missing.js",
  ]) {
    let calls = 0;
    const missing = new Response("missing", { status: 404 });
    const response = await worker.fetch(new Request(`https://example.test${pathname}`, {
      headers: { accept: "text/html" },
    }), { ASSETS: { fetch: async () => ++calls === 1 ? missing : new Response("unexpected fallback") } });
    assert.strictEqual(response, missing, pathname);
    assert.equal(calls, 1, `${pathname} must not issue a fallback request`);
  }
});

test("service paths preserve missing responses for unsupported methods and non-HTML requests", async () => {
  for (const page of servicePages) {
    for (const init of [
      ...["POST", "PUT", "PATCH", "DELETE", "OPTIONS"].map((method) => ({ method, headers: { accept: "text/html" } })),
      { method: "GET", headers: { accept: "application/json" } },
      { method: "GET", headers: { accept: "*/*" } },
      { method: "GET" },
      { method: "HEAD", headers: { accept: "application/json" } },
    ]) {
      let calls = 0;
      const missing = new Response(init.method === "HEAD" ? null : "missing", { status: 404 });
      const response = await worker.fetch(new Request(`https://example.test${page.path}`, init), {
        ASSETS: { fetch: async () => ++calls === 1 ? missing : new Response("unexpected fallback") },
      });
      assert.strictEqual(response, missing, `${init.method} ${page.path}`);
      assert.equal(calls, 1, "A disallowed request must not issue a fallback request");
    }
  }
});

test("service routing preserves asset responses that are not 404", async () => {
  for (const status of [200, 500]) {
    let calls = 0;
    const original = new Response("original asset response", { status });
    const response = await worker.fetch(new Request("https://example.test/criacao-de-sites/", {
      headers: { accept: "text/html" },
    }), { ASSETS: { fetch: async () => ++calls === 1 ? original : new Response("unexpected fallback") } });
    assert.strictEqual(response, original);
    assert.equal(calls, 1);
  }
});
