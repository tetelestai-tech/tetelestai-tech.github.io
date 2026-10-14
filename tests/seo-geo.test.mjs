import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { SERVICE_PAGES } from "../src/service-content.mjs";

const origin = "https://tetelestai.tech";
const services = Object.values(SERVICE_PAGES);
const paths = ["/", "/en/", ...services.map(service => service.path)];
const readPage = pathname => readFile(new URL(`../dist/client${pathname}index.html`, import.meta.url), "utf8");
const graphOf = html => {
  const scripts = [...html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)];
  assert.equal(scripts.length, 1, "A commercial page must publish one unambiguous structured-data graph");
  return JSON.parse(scripts[0][1])["@graph"];
};
const textOf = markup => markup.replace(/<[^>]+>/g, "").replace(/\s+/g, " ");
const decode = value => value.replaceAll("&amp;", "&").replaceAll("&quot;", '"').replaceAll("&#x27;", "'");
function meta(html, name) {
  const tags = html.match(/<meta\b[^>]*>/g) ?? [];
  const tag = tags.find(tag => tag.includes(`name="${name}"`) || tag.includes(`property="${name}"`));
  return tag?.match(/content="([^"]*)"/)?.[1];
}

test("the six commercial HTML pages identify the same organization and their own actual content", async () => {
  for (const pathname of paths) {
    const html = await readPage(pathname);
    const graph = graphOf(html);
    const organization = graph.find(node => node["@type"] === "Organization");
    const website = graph.find(node => node["@type"] === "WebSite");
    const page = graph.find(node => node["@type"] === "WebPage");
    const service = services.find(service => service.path === pathname);
    assert.equal(organization["@id"], `${origin}/#organization`);
    assert.equal(organization.legalName, "Tetelestai Soluções em Tecnologia Ltda.");
    assert.equal(organization.logo.url, `${origin}/assets/tetelestai-symbol.png`);
    assert.equal(website.publisher["@id"], organization["@id"]);
    assert.equal(page.url, origin + pathname);
    assert.equal(page.name, decode(html.match(/<title>(.*?)<\/title>/)[1]));
    assert.equal(page.description, decode(meta(html, "description")));
    assert.equal(page.inLanguage, pathname === "/en/" ? "en" : "pt-BR");
    const serviceNodes = graph.filter(node => node["@type"] === "Service");
    assert.equal(serviceNodes.length, service ? 1 : 0);
    if (service) {
      assert.equal(serviceNodes[0].name, service.label);
      assert.equal(serviceNodes[0].description, service.intro);
      assert.ok(textOf(html).includes(serviceNodes[0].description));
      assert.equal(serviceNodes[0].provider["@id"], organization["@id"]);
      assert.equal(page.mainEntity["@id"], serviceNodes[0]["@id"]);
    }
  }
});

test("sharing metadata remains specific to the page and the PT/EN content", async () => {
  for (const pathname of paths) {
    const html = await readPage(pathname);
    const english = pathname === "/en/";
    assert.equal(meta(html, "og:locale"), english ? "en_US" : "pt_BR");
    assert.equal(meta(html, "twitter:card"), "summary_large_image");
    assert.equal(meta(html, "twitter:title"), html.match(/<title>(.*?)<\/title>/)[1]);
    assert.equal(meta(html, "twitter:description"), meta(html, "description"));
    assert.equal(meta(html, "twitter:image"), `${origin}/assets/tetelestai-share.png`);
    assert.equal(meta(html, "twitter:image:alt"), meta(html, "og:image:alt"));
    assert.equal(meta(html, "og:locale:alternate"), pathname === "/" ? "en_US" : english ? "pt_BR" : undefined);
  }
});

test("the homes include proposal and AI training answers while service FAQs remain intact", async () => {
  const pt = await readPage("/");
  const en = await readPage("/en/");
  assert.match(pt, /Como pedir uma proposta para um site ou uma landing page\?/);
  assert.match(pt, /A capacitação em IA tem um programa fixo\?/);
  assert.match(en, /How do I request a proposal for a website or landing page\?/);
  assert.match(en, /Does AI training have a fixed programme\?/);
  for (const html of [pt, en]) assert.equal((html.match(/<details\b/g) ?? []).length, 6);
  for (const service of services) {
    const html = await readPage(service.path);
    const faqSection = html.match(/<section class="faq-section"[^>]*>([\s\S]*?)<\/section>/)?.[1];
    assert.ok(faqSection, service.path);
    assert.equal((faqSection.match(/<details\b/g) ?? []).length, 4);
  }
});

test("commercial structured data does not leak into legal or app support pages", async () => {
  for (const pathname of ["/privacidade/", "/en/privacy/", "/termos/", "/exclusao-de-dados/", "/recarga/suporte/", "/de-role/suporte/"]) {
    const html = await readPage(pathname);
    assert.ok(!html.includes('type="application/ld+json"'), pathname);
    assert.equal(meta(html, "robots"), "noindex,nofollow");
  }
});
