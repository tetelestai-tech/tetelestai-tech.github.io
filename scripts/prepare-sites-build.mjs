#!/usr/bin/env node
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(root, "dist");
const index = path.join(dist, "client", "index.html");
const worker = path.join(root, "worker", "index.js");
const hosting = path.join(root, ".openai", "hosting.json");

for (const file of [index, worker, hosting]) {
  if (!existsSync(file)) throw new Error("Missing Sites build input: " + file);
}

const routeShells = [
  {
    output: "index.html",
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
    lang: "en",
    title: "Tetelestai | International careers, digital solutions and AI",
    description: "International career consulting for technology professionals, business automation and digital solutions, and practical artificial intelligence training.",
    canonical: "https://tetelestai.tech/en/",
    alternatePt: "https://tetelestai.tech/",
    alternateEn: "https://tetelestai.tech/en/",
    robots: "index,follow",
  },
  {
    output: "privacidade/index.html",
    lang: "pt-BR",
    title: "Privacidade | Tetelestai",
    description: "Como o site Tetelestai trata dados pessoais e informações técnicas.",
    canonical: "https://tetelestai.tech/privacidade/",
    alternatePt: "https://tetelestai.tech/privacidade/",
    alternateEn: "https://tetelestai.tech/en/privacy/",
    robots: "noindex,nofollow",
  },
  {
    output: "en/privacy/index.html",
    lang: "en",
    title: "Privacy | Tetelestai",
    description: "How the Tetelestai website handles personal data and technical information.",
    canonical: "https://tetelestai.tech/en/privacy/",
    alternatePt: "https://tetelestai.tech/privacidade/",
    alternateEn: "https://tetelestai.tech/en/privacy/",
    robots: "noindex,nofollow",
  },
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

  html = html.replace(
    /<link rel="alternate" hreflang="pt-BR" href="[^"]+" \/>\s*<link rel="alternate" hreflang="en" href="[^"]+" \/>\s*<link rel="alternate" hreflang="x-default" href="[^"]+" \/>/,
    `<link rel="alternate" hreflang="pt-BR" href="${route.alternatePt}" />\n    <link rel="alternate" hreflang="en" href="${route.alternateEn}" />\n    <link rel="alternate" hreflang="x-default" href="${route.alternatePt}" />`,
  );

  return html;
}

const baseHtml = readFileSync(index, "utf8");
for (const route of routeShells) {
  const output = path.join(dist, "client", route.output);
  mkdirSync(path.dirname(output), { recursive: true });
  writeFileSync(output, buildRouteShell(baseHtml, route));
}

mkdirSync(path.join(dist, "server"), { recursive: true });
mkdirSync(path.join(dist, ".openai"), { recursive: true });
copyFileSync(worker, path.join(dist, "server", "index.js"));
copyFileSync(hosting, path.join(dist, ".openai", "hosting.json"));

console.log("Prepared Sites build: localized route shells, dist/server/index.js and dist/.openai/hosting.json");
