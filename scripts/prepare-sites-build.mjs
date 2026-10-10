#!/usr/bin/env node
import { copyFileSync, cpSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { createServer } from "vite";
import { LEGAL_CONTENT, LEGAL_PATHS } from "../src/legal-content.mjs";
import { RECARGA_PAGES } from "../src/recarga-content.mjs";
import { DE_ROLE_PAGES } from "../src/de-role-content.mjs";
import { SERVICE_PAGES } from "../src/service-content.mjs";
import { fileURLToPath } from "node:url";
import { verifyRecargaWeb } from "./verify-recarga-web.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(root, "dist");
const index = path.join(dist, "client", "index.html");
const worker = path.join(root, "worker", "index.js");
const hosting = path.join(root, ".openai", "hosting.json");

for (const file of [index, worker, hosting]) {
  if (!existsSync(file)) throw new Error("Missing Sites build input: " + file);
}

verifyRecargaWeb(path.join(root, "public", "recarga"));
verifyRecargaWeb(path.join(dist, "client", "recarga"));

const routeShells = [
  ...Object.values(DE_ROLE_PAGES).map(page => ({
    output: `${page.path.slice(1)}index.html`,
    pathname: page.path,
    lang: "pt-BR",
    title: page.metaTitle,
    description: page.metaDescription,
    canonical: `https://tetelestai.tech${page.path}`,
    robots: "noindex,nofollow",
  })),
  ...Object.values(SERVICE_PAGES).map((page) => ({
    output: `${page.path.slice(1)}index.html`,
    pathname: page.path,
    lang: "pt-BR",
    title: page.metaTitle,
    description: page.metaDescription,
    canonical: `https://tetelestai.tech${page.path}`,
    robots: "index,follow",
  })),
  ...Object.values(RECARGA_PAGES).map((page) => ({
    output: `${page.path.slice(1)}index.html`,
    pathname: page.path,
    lang: "pt-BR",
    title: page.metaTitle,
    description: page.metaDescription,
    canonical: `https://tetelestai.tech${page.path}`,
    robots: "noindex,nofollow",
  })),
  {
    output: "index.html",
    pathname: "/",
    lang: "pt-BR",
    title: "Tetelestai | Carreira internacional, soluções digitais e IA",
    description: "Consultoria para carreiras internacionais em tecnologia, automação e soluções digitais para negócios e capacitação prática em inteligência artificial.",
    canonical: "https://tetelestai.tech/",
    alternatePt: "https://tetelestai.tech/",
    alternateEn: "https://tetelestai.tech/en/",
    robots: "index,follow",
  },
  {
    output: "en/index.html",
    pathname: "/en/",
    lang: "en",
    title: "Tetelestai | International careers, digital solutions and AI",
    description: "International career consulting for technology professionals, business automation and digital solutions, and practical artificial intelligence training.",
    canonical: "https://tetelestai.tech/en/",
    alternatePt: "https://tetelestai.tech/",
    alternateEn: "https://tetelestai.tech/en/",
    robots: "index,follow",
  },
  ...Object.entries(LEGAL_PATHS).flatMap(([page, paths]) =>
    Object.entries(paths).map(([locale, pathname]) => ({
      output: `${pathname.slice(1)}index.html`,
      pathname,
      lang: locale === "pt" ? "pt-BR" : "en",
      title: LEGAL_CONTENT[locale][page].metaTitle,
      description: LEGAL_CONTENT[locale][page].metaDescription,
      canonical: `https://tetelestai.tech${pathname}`,
      alternatePt: `https://tetelestai.tech${paths.pt}`,
      alternateEn: `https://tetelestai.tech${paths.en}`,
      robots: "noindex,nofollow",
    })),
  ),
];

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function replaceMeta(html, attribute, name, content) {
  const pattern = new RegExp(`<meta ${attribute}="${name}" content="[^"]*" \\/>`);
  return html.replace(pattern, `<meta ${attribute}="${name}" content="${escapeHtml(content)}" />`);
}

function buildRouteShell(baseHtml, route) {
  let html = baseHtml
    .replace(/<html lang="[^"]+">/, `<html lang="${route.lang}">`)
    .replace(/<title>.*?<\/title>/, `<title>${escapeHtml(route.title)}</title>`)
    .replace(/<link rel="canonical" href="[^"]+" \/>/, `<link rel="canonical" href="${route.canonical}" />`);

  html = replaceMeta(html, "name", "description", route.description);
  html = replaceMeta(html, "name", "robots", route.robots);
  html = replaceMeta(html, "property", "og:title", route.title);
  html = replaceMeta(html, "property", "og:description", route.description);
  html = replaceMeta(html, "property", "og:url", route.canonical);

  html = route.alternatePt ? html.replace(
    /<link rel="alternate" hreflang="pt-BR" href="[^"]+" \/>\s*<link rel="alternate" hreflang="en" href="[^"]+" \/>\s*<link rel="alternate" hreflang="x-default" href="[^"]+" \/>/,
    `<link rel="alternate" hreflang="pt-BR" href="${route.alternatePt}" />\n    <link rel="alternate" hreflang="en" href="${route.alternateEn}" />\n    <link rel="alternate" hreflang="x-default" href="${route.alternatePt}" />`,
  ) : html.replace(/\s*<link rel="alternate" hreflang="[^"]+" href="[^"]+" \/>/g, "");

  return html;
}

const baseHtml = readFileSync(index, "utf8");
// Render page content into static HTML so it is accessible without JavaScript.
// The browser hydrates the same React components, avoiding duplicate copy.
const renderer = await createServer({
  root,
  appType: "custom",
  server: { middlewareMode: true, hmr: false, ws: false, watch: null, warmup: { clientFiles: [] } },
  optimizeDeps: { noDiscovery: true, include: [] },
});
try {
  const { App } = await renderer.ssrLoadModule("/src/App.jsx");
  for (const route of routeShells) {
    const output = path.join(dist, "client", route.output);
    let html = buildRouteShell(baseHtml, route);
    if (route.pathname) {
      const markup = renderToString(createElement(App, { pathname: route.pathname }));
      if (!html.includes('<div id="root"></div>')) throw new Error("Missing app root for prerender");
      html = html.replace('<div id="root"></div>', `<div id="root">${markup}</div>`);
    }
    mkdirSync(path.dirname(output), { recursive: true });
    writeFileSync(output, html);
  }
} finally {
  await renderer.close();
}

mkdirSync(path.join(dist, "server"), { recursive: true });
mkdirSync(path.join(dist, ".openai"), { recursive: true });
copyFileSync(worker, path.join(dist, "server", "index.js"));
copyFileSync(hosting, path.join(dist, ".openai", "hosting.json"));

// Isolated, noindex FAO presentation preview. No institutional Analytics code.
cpSync(path.join(root, "src", "fao-preview"), path.join(dist, "client", "sites", "faoclassicos"), { recursive: true });

console.log("Prepared Sites build: localized route shells, dist/server/index.js and dist/.openai/hosting.json");
