import { servicesFor, portfolioFor } from './localized-content.mjs';
import { SERVICE_PAGES } from "./service-content.mjs";

import { PORTFOLIO_PAGES } from "./portfolio-content.mjs";

const ORIGIN = "https://tetelestai.tech";
const ORGANIZATION_ID = `${ORIGIN}/#organization`;
const WEBSITE_ID = `${ORIGIN}/#website`;

export function pageStructuredData({ page, locale, title, description }) {
  const service = servicesFor(locale)[page];
  const portfolioDoc = portfolioFor(locale)[page];
  if (page !== "home" && !service && !portfolioDoc) return null;

  const url = `${ORIGIN}${service?.path ?? portfolioDoc?.path ?? (locale === "en" ? "/en/" : "/")}`;
  const organization = {
    "@type": "Organization",
    "@id": ORGANIZATION_ID,
    name: "Tetelestai",
    legalName: "Tetelestai Soluções em Tecnologia Ltda.",
    url: `${ORIGIN}/`,
    logo: { "@type": "ImageObject", url: `${ORIGIN}/assets/tetelestai-symbol.png` },
  };
  const website = {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    name: "Tetelestai",
    url: `${ORIGIN}/`,
    inLanguage: ["pt-BR", "en"],
    publisher: { "@id": ORGANIZATION_ID },
  };
  const webpage = {
    "@type": "WebPage",
    "@id": `${url}#webpage`,
    url,
    name: title,
    description,
    inLanguage: locale === "en" ? "en" : "pt-BR",
    isPartOf: { "@id": WEBSITE_ID },
    about: { "@id": ORGANIZATION_ID },
  };
  const graph = [organization, website, webpage];
  if (service) {
    const serviceId = `${url}#service`;
    graph.push({
      "@type": "Service",
      "@id": serviceId,
      url,
      name: service.label,
      description: service.intro,
      provider: { "@id": ORGANIZATION_ID },
    });
    webpage.mainEntity = { "@id": serviceId };
  }
  return { "@context": "https://schema.org", "@graph": graph };
}

export function serializeStructuredData(value) {
  return JSON.stringify(value).replaceAll("<", "\\u003c");
}
