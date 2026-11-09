import { COMMERCIAL_TRANSLATIONS } from "../src/localized-content.mjs";
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
    heading: "Criação de sites para empresas de todo o Brasil",
    titlePattern: /criação de sites/i,
    canonical: "https://tetelestai.tech/criacao-de-sites/",
    shell: "/criacao-de-sites/index.html",
    fixture: "sites page",
    contentPattern: /\b(?:site|sites)\b/i,
  },
  {
    path: "/criacao-de-landing-pages/",
    heading: "Landing page sob medida: R$\u00a0697, no ar em até 2 dias úteis",
    titlePattern: /criação de landing page/i,
    canonical: "https://tetelestai.tech/criacao-de-landing-pages/",
    shell: "/criacao-de-landing-pages/index.html",
    fixture: "landing pages page",
    contentPattern: /landing page/i,
  },
  {
    // Since 08/11/2026 the career front is the mentoria test; Portuguese only, WhatsApp only after the filter.
    path: "/mentoria/",
    heading: "Renda em dólar treinando IA nas horas vagas, sem largar o emprego",
    titlePattern: /mentoria/i,
    canonical: "https://tetelestai.tech/mentoria/",
    shell: "/mentoria/index.html",
    fixture: "mentoria page",
    contentPattern: /sem promessa de ganho/i,
    ptOnly: true,
    filterFirst: true,
  },
  {
    path: "/capacitacao-em-ia/",
    heading: "Capacitação prática em IA para equipes e profissionais",
    titlePattern: /capacitação.*IA/i,
    canonical: "https://tetelestai.tech/capacitacao-em-ia/",
    shell: "/capacitacao-em-ia/index.html",
    fixture: "AI training page",
    contentPattern: /público.*objetivo.*nível/i,
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
  return markup.replace(/<!--[\s\S]*?-->/g, "").replace(/<[^>]*>/g, "").replace(/[ \t\n\r]+/g, " ").trim();
}

// WhatsApp entry points may carry a prefilled first message; the number stays the confirmed one.
function isConfirmedWhatsApp(href) {
  if (href === "https://wa.me/556184711930") return true;
  const match = href?.match(/^https:\/\/wa\.me\/556184711930\?text=([^"&]+)$/);
  return Boolean(match && decodeURIComponent(match[1]).trim().length > 10);
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
    for (const pathname of ["/", "/en/", "/criacao-de-sites/", "/criacao-de-landing-pages/", "/mentoria/", "/capacitacao-em-ia/", "/privacidade/", "/en/privacy/", "/recarga/suporte/"]) {
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
    assert.ok(paragraphs.some((text) => page.contentPattern.test(text)),
      "Service copy must be present in the initial HTML, not only in a JavaScript bundle");
    if (page.filterFirst) {
      // The mentoria opens WhatsApp, price and contract only to people who pass the 5-question filter.
      // The footer keeps the general contact channel (also used for data requests); the page body does not.
      assert.ok(!tags(main, "a").some((tag) => /wa\.me/.test(attribute(tag, "href") ?? "")), "No WhatsApp link in the page before the filter");
      assert.ok(!html.includes('class="wa-float"'), "No floating WhatsApp button on the mentoria");
      assert.ok(/<form\b[^>]*class="filtro/.test(main), "The filter form is in the initial HTML");
      assert.doesNotMatch(textContent(main), /3\.297|597|US\$|d[óo]lares\s+\d|\d+\s*mil d[óo]lares/i, "No price or dollar amount in the open part");
      assert.ok(!tags(html, "a").some((tag) => /kiwify/.test(attribute(tag, "href") ?? "")), "Retired Kiwify products are gone");
    } else {
      assert.ok(tags(main, "a").some((tag) => isConfirmedWhatsApp(attribute(tag, "href")?.replaceAll("&amp;", "&"))),
        "The initial service content must link to the confirmed WhatsApp address");
    }
  });

  test(`${page.path} has its own indexable Portuguese metadata with its equivalent English translation`, async () => {
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
    if (page.ptOnly) assert.ok(!links.some(tag => attribute(tag, "hreflang")), "A Portuguese-only page must not claim an English equivalent");
    else assert.ok(links.some(tag => attribute(tag,"hreflang")==="en" && attribute(tag,"href")===`https://tetelestai.tech${COMMERCIAL_TRANSLATIONS.find(p=>p.pt===page.path).en}`), "Each service has its actual English equivalent");
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

test("the Portuguese home exposes all four service links in its initial main content", async () => {
  const html = await readBuiltHtml("/");
  const main = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i)?.[1];
  assert.ok(main, "The Portuguese home must be prerendered");
  const anchors = [...main.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi)];
  for (const page of servicePages) {
    assert.ok(anchors.some((match) => attribute(`<a ${match[1]}>`, "href") === page.path
      && textContent(match[2]).length > 0), `The home must expose a labeled link to ${page.path}`);
  }
});

test("the sitemap lists the homes, service pages and approved portfolio pages exactly once", async () => {
  const sitemap = await readFile(new URL("../dist/client/sitemap.xml", import.meta.url), "utf8");
  const locations = [...sitemap.matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/g)].map((match) => match[1]);
  assert.deepEqual(locations.sort(), [
    "https://tetelestai.tech/",
    "https://tetelestai.tech/en/",
    ...COMMERCIAL_TRANSLATIONS.map(pair=>`https://tetelestai.tech${pair.en}`),
    "https://tetelestai.tech/criacao-de-sites/",
    "https://tetelestai.tech/criacao-de-landing-pages/",
    "https://tetelestai.tech/mentoria/",
    "https://tetelestai.tech/capacitacao-em-ia/",
    "https://tetelestai.tech/projetos/",
    "https://tetelestai.tech/projetos/infinity-car-studio/",
    "https://tetelestai.tech/projetos/bolachinhas-da-vovo-juju/",
    "https://tetelestai.tech/projetos/afeto-nobre/",
    "https://tetelestai.tech/projetos/lalelis/",
    "https://tetelestai.tech/projetos/respeitavel-feijuca/",
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
    "/mentoria//",
    "/capacitacao-em-ia/missing",
    "/en/mentoria/",
    "/carreira-internacional",
    "/en/international-career",
    "/capacitacao-em-ia/missing.js",
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

test("the English home contains its translated content and contact before JavaScript", async () => {
  const html = await readBuiltHtml("/en/");
  const main = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i)?.[1];
  assert.ok(main, "The English home must include initial main content");
  assert.match(textContent(main), /Technology with purpose/);
  assert.match(textContent(main), /Mentoring for developers/);
  assert.ok(tags(main, "a").some(tag => isConfirmedWhatsApp(attribute(tag, "href")?.replaceAll("&amp;", "&"))));
  assert.equal(attribute(tags(html, "html")[0], "lang"), "en");
});

test("home service links remain grouped under the offer they describe", async () => {
  const html = await readBuiltHtml("/");
  const groups = {
    "mentoria": ["/mentoria/"],
    "solucoes-digitais": ["/criacao-de-sites/", "/criacao-de-landing-pages/"],
    "capacitacao-ia": ["/capacitacao-em-ia/"],
  };
  const allPaths = Object.values(groups).flat();
  for (const [id, expected] of Object.entries(groups)) {
    const article = html.match(new RegExp(`<article\\b[^>]*id="${id}"[^>]*>([\\s\\S]*?)</article>`))?.[1];
    assert.ok(article, `Missing offer ${id}`);
    const paths = tags(article, "a").map(tag => attribute(tag, "href")).filter(href => allPaths.includes(href));
    assert.deepEqual(paths.sort(), expected.sort(), `Links for ${id} must not mix offers`);
  }
});

test("digital projects are not presented as proof of career or training services", async () => {
  for (const pathname of ["/mentoria/", "/capacitacao-em-ia/"]) {
    const html = await readBuiltHtml(pathname);
    assert.ok(!html.includes('id="projects"'), `${pathname} must not inherit digital project claims`);
    assert.ok(!html.includes("Outro serviço digital"));
  }
  for (const pathname of ["/criacao-de-sites/", "/criacao-de-landing-pages/"]) {
    assert.ok((await readBuiltHtml(pathname)).includes('id="projects"'));
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

test("key facts grids end with full rows on every page that has them", async () => {
  const renderer = await createServer({
    appType: "custom",
    server: { middlewareMode: true, hmr: false, ws: false, watch: null },
    optimizeDeps: { noDiscovery: true, include: [] },
  });
  try {
    const { App } = await renderer.ssrLoadModule("/src/App.jsx");
    const { factsColumns } = await renderer.ssrLoadModule("/src/ui.jsx");
    assert.deepEqual([6, 8, 9, 12].map(factsColumns), [3, 4, 3, 4]);
    for (const pathname of ["/criacao-de-sites/", "/criacao-de-landing-pages/", "/mentoria/", "/capacitacao-em-ia/", "/en/website-development/", "/projetos/infinity-car-studio/", "/projetos/bolachinhas-da-vovo-juju/", "/projetos/afeto-nobre/", "/projetos/lalelis/", "/en/projects/lalelis/", "/projetos/respeitavel-feijuca/"]) {
      const html = renderToString(createElement(App, { pathname }));
      const grid = html.match(/<dl class="facts"[^>]*style="--facts-cols:(\d+)"[^>]*>([\s\S]*?)<\/dl>/);
      assert.ok(grid, `${pathname} renders a key facts grid with a column count`);
      const cells = grid[2].match(/<dt>/g).length;
      assert.equal(cells % Number(grid[1]), 0, `${pathname}: ${cells} facts in ${grid[1]} columns leave empty cells`);
      assert.equal(cells % 2, 0, `${pathname}: ${cells} facts leave an empty cell in the 2-column layout`);
    }
  } finally {
    await renderer.close();
  }
});

test("the retired career addresses redirect to the mentoria and stay out of the index", async () => {
  for (const pathname of ["/carreira-internacional/", "/en/international-career/"]) {
    const html = await readBuiltHtml(pathname);
    assert.match(html, /<meta http-equiv="refresh" content="0; url=\/mentoria\/" \/>/);
    assert.match(html, /<link rel="canonical" href="https:\/\/tetelestai\.tech\/mentoria\/" \/>/);
    assert.match(html, /<meta name="robots" content="noindex,follow" \/>/);
    assert.match(html, /location\.replace\("\/mentoria\/"/);
    assert.doesNotMatch(html, /Essencial|Kit Word|Acompanhado|kiwify/i);
  }
});

test("the mentoria keeps the guide's fixed texts; prices, numbers and contract go only by e-mail", async () => {
  const content = await import("../src/mentoria-content.mjs");
  const page = content.MENTORIA_PAGE;
  assert.equal(page.semPromessa.texto, "O que eu não prometo: que você vai ser aprovado, que vai ter projeto toda semana, ou que vai ganhar o que eu ganhei. O meu resultado é meu, com 22 anos de experiência e 16 meses de histórico. O seu depende do seu perfil e do seu desempenho nas entrevistas.");
  assert.match(page.semPromessa.comissao, /^Transparência: algumas plataformas pagam a quem indica profissionais\./);
  // Decision of 09/11/2026: vídeo 2, earnings, prices and the contract are e-mailed by the mentoria-filtro
  // function to people who pass; the public repository and the page bundle carry none of them.
  const source = await readFile(new URL("../src/mentoria-content.mjs", import.meta.url), "utf8");
  assert.doesNotMatch(source, /3\.297|R\$ ?597|US\$|61\.944|video2|MENTORIA_CONTRATO/);
  assert.equal(content.MENTORIA_VIDEOS.video2, undefined);
  assert.match(content.MENTORIA_ENVIO.url, /^https:\/\/vjslazmwbbcsfnixvpyf\.supabase\.co\/functions\/v1\/mentoria-filtro$/);
  assert.match(page.filtro.lead, /no seu e-mail o segundo vídeo/);
  assert.match(page.passou.enviado, /\{email\}/);
  // People who do not pass see the feedback and the R$ 397 direcionamento (45 min), never the package.
  assert.equal(page.naoPassou.direcionamento.preco, "R$ 397");
  assert.match(page.naoPassou.direcionamento.texto, /45 minutos/);
  assert.match(page.naoPassou.direcionamento.termos, /CDC art\. 49/);
  // Decision of 09/11/2026: the direcionamento becomes a one-time discount on the package for 7 days (same e-mail).
  assert.match(page.naoPassou.direcionamento.termos, /em até 7 dias depois desta compra, com o mesmo e-mail, os R\$ 397 saem do valor dela, uma vez só/);
  assert.doesNotMatch(page.naoPassou.direcionamento.termos, /não dá desconto/);
  assert.equal(content.MENTORIA_TURMA.vagasTotal, 5);
  assert.equal(content.MENTORIA_WHATSAPP.naoRecebi, "https://wa.me/556184711930?text=Ol%C3%A1%21%20Passei%20no%20filtro%20da%20mentoria%20e%20n%C3%A3o%20recebi%20o%20e-mail.");
  const pass = { experiencia: "3_8", linguagens: "Python", ingles: "com_esforco", situacao: "emprego_fixo", horas: "5_10" };
  assert.equal(content.avaliarFiltro(pass).passou, true);
  for (const [name, value] of [["experiencia", "1_3"], ["linguagens", "  "], ["ingles", "trava"], ["situacao", "desempregado"], ["horas", "menos_5"]]) {
    const result = content.avaliarFiltro({ ...pass, [name]: value });
    assert.equal(result.passou, false, `${name}=${value} must not pass`);
    assert.equal(result.volte.length, 1);
  }
  assert.equal(content.avaliarFiltro({ ...pass, situacao: "autonomo", experiencia: "mais_8", horas: "mais_10", ingles: "tranquilo" }).passou, true);
});

test("no platform names anywhere in the mentoria source or page", async () => {
  const platforms = /mercor|outlier|alignerr|scale ai|remotasks|dataannotation|data annotation|turing|appen|toloka/i;
  const source = await readFile(new URL("../src/mentoria-content.mjs", import.meta.url), "utf8");
  assert.doesNotMatch(source, platforms);
  assert.doesNotMatch(await readBuiltHtml("/mentoria/"), platforms);
});

test("method steps light up on hover without a cyan bar beside the card", async () => {
  const css = await readFile(new URL("../src/site.css", import.meta.url), "utf8");
  assert.doesNotMatch(css, /\.steps\s*>\s*li(?::hover)?::(?:before|after)/, "steps must not draw a side bar");
  assert.match(css, /\.steps > li:hover \.card\{background-color:/, "steps keep the hover tint");
  assert.match(css, /\.card:hover\{transform:translateY\(-4px\)/, "cards keep the hover lift");
});
