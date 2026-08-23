import assert from "node:assert/strict";
import { access, readFile, readdir } from "node:fs/promises";
import test from "node:test";
import worker from "../worker/index.js";

test("serves existing static assets without a fallback", async () => {
  const calls = [];
  const response = await worker.fetch(new Request("https://example.test/assets/app.js"), {
    ASSETS: {
      fetch: async (request) => {
        calls.push(new URL(request.url).pathname);
        return new Response("asset", { status: 200 });
      },
    },
  });

  assert.equal(response.status, 200);
  assert.deepEqual(calls, ["/assets/app.js"]);
});

test("falls back to the localized shell for a known app route", async () => {
  const calls = [];
  const response = await worker.fetch(
    new Request("https://example.test/en/privacy/?source=share", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async (request) => {
          const url = new URL(request.url);
          calls.push(url.pathname + url.search);
          return new Response(url.pathname === "/en/privacy/index.html" ? "app" : "missing", {
            status: url.pathname === "/en/privacy/index.html" ? 200 : 404,
          });
        },
      },
    },
  );

  assert.equal(response.status, 200);
  assert.deepEqual(calls, ["/en/privacy/?source=share", "/en/privacy/index.html"]);
});

test("keeps an unknown HTML route as a 404", async () => {
  const calls = [];
  const response = await worker.fetch(
    new Request("https://example.test/unknown-page", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async (request) => {
          calls.push(new URL(request.url).pathname);
          return new Response("missing", { status: 404 });
        },
      },
    },
  );

  assert.equal(response.status, 404);
  assert.deepEqual(calls, ["/unknown-page"]);
});

test("does not turn missing API or write requests into the app shell", async () => {
  for (const request of [
    new Request("https://example.test/api/missing", { headers: { accept: "application/json" } }),
    new Request("https://example.test/flow", { method: "POST", headers: { accept: "text/html" } }),
  ]) {
    let calls = 0;
    const response = await worker.fetch(request, {
      ASSETS: {
        fetch: async () => {
          calls += 1;
          return new Response("missing", { status: 404 });
        },
      },
    });

    assert.equal(response.status, 404);
    assert.equal(calls, 1);
  }
});

test("emits the files required by Sites packaging", async () => {
  await access(new URL("../dist/client/index.html", import.meta.url));
  await access(new URL("../dist/client/en/index.html", import.meta.url));
  await access(new URL("../dist/client/privacidade/index.html", import.meta.url));
  await access(new URL("../dist/client/en/privacy/index.html", import.meta.url));
  await access(new URL("../dist/server/index.js", import.meta.url));
  await access(new URL("../dist/.openai/hosting.json", import.meta.url));
});

test("publishes only the confirmed WhatsApp contact channel", async () => {
  const assetsDirectory = new URL("../dist/client/assets/", import.meta.url);
  const assetNames = await readdir(assetsDirectory);
  const scriptNames = assetNames.filter((name) => name.endsWith(".js"));
  assert.ok(scriptNames.length > 0);

  const scriptContents = await Promise.all(
    scriptNames.map((name) => readFile(new URL(name, assetsDirectory), "utf8")),
  );
  const productionJavaScript = scriptContents.join("\n");
  const appSource = await readFile(new URL("../src/App.jsx", import.meta.url), "utf8");

  assert.match(productionJavaScript, /https:\/\/wa\.me\/5561998821206/);
  assert.match(productionJavaScript, /Conversar pelo WhatsApp/);
  assert.match(productionJavaScript, /Chat on WhatsApp/);
  assert.doesNotMatch(productionJavaScript, /Conversar com a Tetelestai/);
  assert.doesNotMatch(productionJavaScript, /Contact Tetelestai/);
  assert.match(productionJavaScript, /Está consumado! \(João 19:30\)/);
  assert.match(productionJavaScript, /It is finished! \(John 19:30\)/);
  assert.match(productionJavaScript, /Voltar ao topo/);
  assert.match(productionJavaScript, /Back to top/);
  assert.doesNotMatch(productionJavaScript, /tel:\+5561998821206/);
  assert.doesNotMatch(productionJavaScript, /\(61\) 99882-1206/);
  assert.doesNotMatch(productionJavaScript, /Ligar para a Tetelestai/);
  assert.doesNotMatch(productionJavaScript, /Call Tetelestai/);
  assert.equal(appSource.match(/<BackToTop\b/g)?.length ?? 0, 6);
  assert.match(appSource, /function BackToTop[\s\S]*?href="#home"/);
  assert.match(appSource, /className="button button--primary" href=\{WHATSAPP_LINK\}/);
});
