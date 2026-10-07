import assert from "node:assert/strict";
import { access, cp, mkdtemp, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import worker from "../worker/index.js";

const legalRoutes = [
  { path: "/privacidade/", lang: "pt-BR", title: "Privacidade e proteção de dados", alternate: "/en/privacy/" },
  { path: "/en/privacy/", lang: "en", title: "Privacy and data protection", alternate: "/privacidade/" },
  { path: "/termos/", lang: "pt-BR", title: "Termos de Serviço", alternate: "/en/terms/" },
  { path: "/en/terms/", lang: "en", title: "Terms of Service", alternate: "/termos/" },
  { path: "/exclusao-de-dados/", lang: "pt-BR", title: "Solicitar exclusão de dados", alternate: "/en/data-deletion/" },
  { path: "/en/data-deletion/", lang: "en", title: "Request data deletion", alternate: "/exclusao-de-dados/" },
];

const recargaRoutes = [
  { path: "/recarga/suporte/", title: "Suporte — Tetelestai Recarga", sibling: "/recarga/privacidade/" },
  { path: "/recarga/privacidade/", title: "Privacidade — Tetelestai Recarga", sibling: "/recarga/suporte/" },
];

test("serves the Recarga calculator only through its exact GET and HEAD fallback", async () => {
  for (const pathname of ["/recarga", "/recarga/"]) {
    for (const method of ["GET", "HEAD"]) {
      const calls = [];
      const response = await worker.fetch(new Request(`https://example.test${pathname}?source=share`, {
        method, headers: { accept: "text/html" },
      }), { ASSETS: { fetch: async (request) => {
        const url = new URL(request.url);
        calls.push([request.method, url.pathname + url.search]);
        if (url.pathname !== "/recarga/index.html" || url.search) return new Response(null, { status: 404 });
        return new Response(method === "HEAD" ? null : "calculator", { status: 200 });
      } } });
      assert.equal(response.status, 200, `${method} ${pathname}`);
      assert.equal(await response.text(), method === "HEAD" ? "" : "calculator");
      assert.deepEqual(calls, [[method, `${pathname}?source=share`], [method, "/recarga/index.html"]]);
    }
  }
});

test("packages the independent Recarga web release with its own bundled resources", async () => {
  const artifact = new URL("../dist/client/recarga/", import.meta.url);
  const html = await readFile(new URL("index.html", artifact), "utf8");
  assert.match(html, /<html\b[^>]*lang="pt-BR"/);
  assert.match(html, /<title>Tetelestai Recarga — Planejar recarga<\/title>/);
  assert.match(html, /<meta name="robots" content="noindex,nofollow"/);
  assert.match(html, /<link rel="canonical" href="https:\/\/tetelestai\.tech\/recarga\/"/);
  assert.match(html, /<script\b[^>]*src="\/recarga\/_expo\//);
  assert.doesNotMatch(html, /<script\b[^>]*src="\/assets\//);
  const { verifyRecargaWeb } = await import("../scripts/verify-recarga-web.mjs");
  const release = verifyRecargaWeb(artifact);
  assert.equal(release.version, "1.0.5");
  assert.ok(release.files.length > 1);
});

test("rejects a damaged Recarga release before deployment", async () => {
  const { verifyRecargaWeb } = await import("../scripts/verify-recarga-web.mjs");
  const directory = await mkdtemp(path.join(tmpdir(), "recarga-release-test-"));
  try {
    await cp(new URL("../public/recarga/", import.meta.url), directory, { recursive: true });
    const release = verifyRecargaWeb(directory);
    const script = release.files.find((file) => file.path.endsWith(".js"));
    assert.ok(script, "A runnable release must include its JavaScript bundle");
    const scriptFile = path.join(directory, script.path);
    await writeFile(scriptFile, "damaged bundle");
    assert.throws(() => verifyRecargaWeb(directory), /hash mismatch/i);
    await rm(scriptFile);
    assert.throws(() => verifyRecargaWeb(directory), /missing.*release file/i);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test("serves Recarga support and privacy through the exact GET and HEAD fallback", async () => {
  for (const { path, title } of recargaRoutes) {
    for (const pathname of [path, path.slice(0, -1)]) {
      for (const method of ["GET", "HEAD"]) {
        const response = await worker.fetch(new Request(`https://example.test${pathname}?source=store`, {
          method, headers: { accept: "text/html" },
        }), { ASSETS: { fetch: async (request) => {
          const url = new URL(request.url);
          if (url.pathname !== `${path}index.html` || url.search) return new Response(null, { status: 404 });
          return new Response(method === "HEAD" ? null : title, { status: 200 });
        } } });
        assert.equal(response.status, 200, `${method} ${pathname}`);
        assert.equal(await response.text(), method === "HEAD" ? "" : title);
      }
    }
  }
});

test("keeps unsupported Recarga paths and methods outside the route fallback", async () => {
  for (const request of [
    new Request("https://example.test/recarga/"),
    new Request("https://example.test/recarga//", { headers: { accept: "text/html" } }),
    new Request("https://example.test/recarga/missing", { headers: { accept: "text/html" } }),
    new Request("https://example.test/recarga/_expo/missing.js", { headers: { accept: "text/html" } }),
    new Request("https://example.test/en/recarga/", { headers: { accept: "text/html" } }),
    new Request("https://example.test/recarga/", { method: "POST", headers: { accept: "text/html" } }),
    new Request("https://example.test/recarga/", { headers: { accept: "application/json" } }),
    new Request("https://example.test/recarga/suporte/missing", { headers: { accept: "text/html" } }),
    new Request("https://example.test/recarga/privacidade//", { headers: { accept: "text/html" } }),
    new Request("https://example.test/en/recarga/privacy/", { headers: { accept: "text/html" } }),
    new Request("https://example.test/recarga/suporte/", { method: "POST", headers: { accept: "text/html" } }),
    new Request("https://example.test/recarga/privacidade/", { headers: { accept: "application/json" } }),
  ]) {
    const response = await worker.fetch(request, { ASSETS: { fetch: async (value) =>
      new Response(null, { status: new URL(value.url).pathname.endsWith("index.html") ? 200 : 404 }),
    } });
    assert.equal(response.status, 404, `${request.method} ${request.url}`);
  }
});

test("builds readable Recarga pages with correct contacts, sibling links and indexing", async () => {
  const sitemap = await readFile(new URL("../dist/client/sitemap.xml", import.meta.url), "utf8");
  for (const { path, title, sibling } of recargaRoutes) {
    const html = await readFile(new URL(`../dist/client${path}index.html`, import.meta.url), "utf8");
    assert.match(html, /<html lang="pt-BR">/);
    assert.ok(html.includes(`<h1>${title}</h1>`));
    assert.equal((html.match(/<h1>/g) ?? []).length, 1);
    assert.match(html, /<meta name="robots" content="noindex,nofollow"/);
    assert.ok(html.includes(`<link rel="canonical" href="https://tetelestai.tech${path}"`));
    assert.ok(html.includes(`href="${sibling}"`));
    assert.match(html, /href="mailto:contato@tetelestai\.tech"/);
    assert.match(html, /href="https:\/\/wa\.me\/556184711930"/);
    assert.match(html, /\+55 61 98471-1930/);
    assert.doesNotMatch(html, /hreflang="en"/);
    assert.doesNotMatch(sitemap, /recarga/);
    if (path.includes("privacidade")) {
      assert.match(html, /perfis/);
      assert.match(html, /histórico/);
      assert.match(html, /lembrete/i);
    } else {
      assert.match(html, /07:01/);
      assert.match(html, /Copiar horário/);
    }
  }
});

test("serves every legal route with or without a trailing slash for GET and HEAD", async () => {
  for (const { path } of legalRoutes) {
    for (const pathname of [path, path.slice(0, -1)]) {
      for (const method of ["GET", "HEAD"]) {
        const calls = [];
        const response = await worker.fetch(new Request(`https://example.test${pathname}?preview=1`, {
          method, headers: { accept: "text/html" },
        }), {
          ASSETS: { fetch: async (request) => {
            const url = new URL(request.url);
            calls.push([request.method, url.pathname + url.search]);
            return new Response(null, { status: url.pathname === `${path}index.html` ? 200 : 404 });
          } },
        });
        assert.equal(response.status, 200, `${method} ${pathname}`);
        assert.deepEqual(calls, [[method, `${pathname}?preview=1`], [method, `${path}index.html`]]);
      }
    }
  }
});

test("keeps nested, malformed, non-HTML and write requests outside the legal fallback", async () => {
  for (const request of [
    new Request("https://example.test/termos/missing", { headers: { accept: "text/html" } }),
    new Request("https://example.test/en/data-deletion//", { headers: { accept: "text/html" } }),
    new Request("https://example.test/termos/", { headers: { accept: "application/json" } }),
    new Request("https://example.test/exclusao-de-dados/", { method: "POST", headers: { accept: "text/html" } }),
  ]) {
    let calls = 0;
    const response = await worker.fetch(request, { ASSETS: { fetch: async () => {
      calls++;
      return new Response("missing", { status: 404 });
    } } });
    assert.equal(response.status, 404);
    assert.equal(calls, 1);
  }
});

test("legal HTML is readable without JavaScript, localized and excluded from search indexing", async () => {
  const sitemap = await readFile(new URL("../dist/client/sitemap.xml", import.meta.url), "utf8");
  for (const { path, lang, title, alternate } of legalRoutes) {
    const html = await readFile(new URL(`../dist/client${path}index.html`, import.meta.url), "utf8");
    assert.ok(html.includes(`<html lang="${lang}">`));
    assert.ok(html.includes(`<h1>${title}</h1>`));
    assert.equal((html.match(/<h1>/g) ?? []).length, 1);
    assert.match(html, /<meta name="robots" content="noindex,nofollow"/);
    assert.ok(html.includes(`<link rel="canonical" href="https://tetelestai.tech${path}"`));
    assert.ok(html.includes(`href="${alternate}"`));
    assert.match(html, /href="mailto:contato@tetelestai\.tech(?:\?subject=[^"]+)?"/);
    assert.match(html, /href="https:\/\/wa\.me\/556184711930"/);
    assert.match(html, /\+55 61 98471-1930/);
    assert.match(html, /58\.138\.258\/0001-39/);
    assert.match(html, /TETELESTAI Atendimento/);
    assert.doesNotMatch(html, /https:\/\/www\.facebook\.com\//);
    assert.doesNotMatch(sitemap, new RegExp(path));
    const localePrefix = lang === "en" ? "/en/" : "/";
    const localRoutes = legalRoutes.filter((route) => route.lang === lang);
    for (const route of localRoutes) assert.ok(html.includes(`href="${route.path}"`));
    assert.ok(html.includes(`href="${localePrefix}"`));
    if (path.includes("deletion") || path.includes("exclusao")) {
      assert.ok(html.indexOf('class="legal-contact"') < html.indexOf('class="legal-section"'));
      assert.match(html, /href="mailto:contato@tetelestai\.tech\?subject=/);
    }
  }
});

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

test("publishes an opaque WhatsApp share image with complete Open Graph metadata", async () => {
  const homeHtml = await readFile(new URL("../dist/client/index.html", import.meta.url), "utf8");
  const headEnd = homeHtml.indexOf("</head>");

  assert.notEqual(headEnd, -1, "The built homepage must contain a closing head tag");
  const head = homeHtml.slice(0, headEnd);
  assert.ok(Buffer.byteLength(head) < 300_000, "Open Graph metadata must be within the first 300 KB");
  assert.equal((head.match(/property="og:image"/g) ?? []).length, 1);
  assert.match(head, /<meta property="og:image" content="https:\/\/tetelestai\.tech\/assets\/tetelestai-share\.png" \/>/);
  assert.match(head, /<meta property="og:image:secure_url" content="https:\/\/tetelestai\.tech\/assets\/tetelestai-share\.png" \/>/);
  assert.match(head, /<meta property="og:image:type" content="image\/png" \/>/);
  assert.match(head, /<meta property="og:image:width" content="1200" \/>/);
  assert.match(head, /<meta property="og:image:height" content="630" \/>/);
  assert.match(head, /<meta property="og:image:alt" content="Símbolo e nome Tetelestai sobre fundo azul-marinho\." \/>/);

  const shareImage = await readFile(new URL("../dist/client/assets/tetelestai-share.png", import.meta.url));
  assert.deepEqual([...shareImage.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10]);
  assert.equal(shareImage.readUInt32BE(16), 1200);
  assert.equal(shareImage.readUInt32BE(20), 630);
  assert.equal(shareImage[25], 2, "The PNG must be truecolor without an alpha channel");
  assert.ok(shareImage.byteLength < 600_000, "The WhatsApp share image must be under 600 KB");

  const chunkTypes = [];
  for (let offset = 8; offset + 12 <= shareImage.length;) {
    const length = shareImage.readUInt32BE(offset);
    chunkTypes.push(shareImage.toString("ascii", offset + 4, offset + 8));
    offset += length + 12;
  }
  assert.doesNotMatch(chunkTypes.join(","), /tRNS/, "The PNG must not declare transparency");
});

test("publishes the confirmed service and contact content", async () => {
  const assetsDirectory = new URL("../dist/client/assets/", import.meta.url);
  const assetNames = await readdir(assetsDirectory);
  const scriptNames = assetNames.filter((name) => name.endsWith(".js"));
  assert.ok(scriptNames.length > 0);

  const scriptContents = await Promise.all(
    scriptNames.map((name) => readFile(new URL(name, assetsDirectory), "utf8")),
  );
  const productionJavaScript = scriptContents.join("\n");
  const appSource = await readFile(new URL("../src/App.jsx", import.meta.url), "utf8");

  assert.match(productionJavaScript, /https:\/\/wa\.me\/556184711930/);
  assert.doesNotMatch(productionJavaScript, /https:\/\/wa\.me\/5561984711930/);
  assert.doesNotMatch(productionJavaScript, /5561998821206/);
  assert.match(productionJavaScript, /Conversar pelo WhatsApp/);
  assert.match(productionJavaScript, /Chat on WhatsApp/);
  assert.doesNotMatch(productionJavaScript, /["']Conversar com a Tetelestai["']/);
  assert.doesNotMatch(productionJavaScript, /Contact Tetelestai/);
  assert.match(productionJavaScript, /Está consumado!/);
  assert.match(productionJavaScript, /João 19:30/);
  assert.match(productionJavaScript, /It is finished!/);
  assert.match(productionJavaScript, /John 19:30/);
  assert.doesNotMatch(productionJavaScript, /Está consumado! \(João 19:30\)/);
  assert.doesNotMatch(productionJavaScript, /It is finished! \(John 19:30\)/);
  assert.match(productionJavaScript, /Voltar ao topo/);
  assert.match(productionJavaScript, /Back to top/);
  assert.match(productionJavaScript, /Tecnologia com direção\./);
  assert.match(productionJavaScript, /Propósito em cada solução\./);
  assert.match(productionJavaScript, /Technology with direction\./);
  assert.match(productionJavaScript, /Purpose in every solution\./);
  assert.match(productionJavaScript, /Co-Founder & CTO/);
  assert.match(productionJavaScript, /Co-Founder & CEO/);
  assert.match(productionJavaScript, /Co-fundadora e administradora da Tetelestai\. Lidera o negócio, o marketing e o relacionamento com clientes\./);
  assert.match(productionJavaScript, /Co-founder and Tetelestai’s managing partner\. Leads the business, marketing and client relations\./);
  assert.doesNotMatch(productionJavaScript, /Marketing e mídias sociais/);
  assert.doesNotMatch(productionJavaScript, /Marketing and social media/);
  assert.doesNotMatch(productionJavaScript, /Responsável técnico/);
  assert.doesNotMatch(productionJavaScript, /Technical lead/);
  assert.doesNotMatch(productionJavaScript, /Pessoas no centro\./);
  assert.doesNotMatch(productionJavaScript, /People at the center\./);
  assert.doesNotMatch(appSource, /role: "Administradora"/);
  assert.doesNotMatch(appSource, /role: "Administrator"/);
  assert.doesNotMatch(appSource, /"administrator" : "administradora"/);
  assert.match(productionJavaScript, /Automação e soluções digitais/);
  assert.match(productionJavaScript, /Automation and digital solutions/);
  assert.match(productionJavaScript, /design visual sob medida/);
  assert.match(productionJavaScript, /tailored visual design/);
  assert.match(productionJavaScript, /WhatsApp customer service automation/);
  assert.doesNotMatch(productionJavaScript, /design aplicado/);
  assert.doesNotMatch(productionJavaScript, /with applied design/);
  assert.doesNotMatch(productionJavaScript, /customer-service automation/);
  assert.match(productionJavaScript, /Que tipos de soluções digitais a Tetelestai desenvolve\?/);
  assert.match(productionJavaScript, /What types of digital solutions does Tetelestai build\?/);
  assert.doesNotMatch(productionJavaScript, /Treinamento e avaliação de modelos/);
  assert.doesNotMatch(productionJavaScript, /AI model training and evaluation/);
  assert.doesNotMatch(productionJavaScript, /Qual é a diferença entre as duas ofertas de IA\?/);
  assert.doesNotMatch(productionJavaScript, /What is the difference between the two AI offers\?/);
  assert.match(appSource, /id: "solucoes-digitais"/);
  assert.match(appSource, /id: "digital-solutions"/);
  assert.doesNotMatch(appSource, /id: "modelos-ia"/);
  assert.doesNotMatch(appSource, /id: "ai-models"/);
  assert.doesNotMatch(productionJavaScript, /tel:\+5561984711930/);
  assert.doesNotMatch(productionJavaScript, /\(61\) 98471-1930/);
  assert.doesNotMatch(productionJavaScript, /Ligar para a Tetelestai/);
  assert.doesNotMatch(productionJavaScript, /Call Tetelestai/);
  const homeHtml = await readFile(new URL("../dist/client/index.html", import.meta.url), "utf8");
  const backToTopLinks = (homeHtml.match(/<a\b[^>]*>/g) ?? [])
    .filter((tag) => /class="back-to-top"/.test(tag));
  assert.equal(backToTopLinks.length, 6);
  assert.ok(backToTopLinks.every((tag) => /href="#home"/.test(tag) && /aria-label="Voltar ao topo"/.test(tag)));
  assert.match(appSource, /function BackToTop[\s\S]*?href="#home"/);
  assert.match(appSource, /className="button button--primary" href=\{WHATSAPP_LINK\}/);
});
