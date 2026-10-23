import { servicesFor, portfolioFor } from './localized-content.mjs';
import { HOME, UI } from './home-content.mjs';
import { APPS, CLIENT_PROJECTS } from './portfolio-content.mjs';
import { APP_STORE_LINKS, DE_ROLE_APP_STORE } from './app-store-links.mjs';
import { CHECKOUT_ESSENCIAL, INSTAGRAM_URL, ORIGIN, WHATSAPP_LINK } from './contact.mjs';

const ORGANIZATION_ID = `${ORIGIN}/#organization`;
const WEBSITE_ID = `${ORIGIN}/#website`;
const AREA_SERVED = [{ "@type": "Country", name: "Brasil" }];

// Only facts that are visible on the site: no ratings, opening hours, street address or results.
function organizationNode(locale) {
  return {
    "@type": "Organization",
    "@id": ORGANIZATION_ID,
    name: "Tetelestai",
    alternateName: "Tetelestai Tech",
    legalName: "Tetelestai Soluções em Tecnologia Ltda.",
    taxID: "58.138.258/0001-39",
    url: `${ORIGIN}/`,
    logo: { "@type": "ImageObject", url: `${ORIGIN}/assets/tetelestai-symbol.png` },
    image: `${ORIGIN}/assets/tetelestai-share.png`,
    slogan: UI[locale].footer.tagline,
    description: HOME[locale].metaDescription,
    address: { "@type": "PostalAddress", addressLocality: "Brasília", addressRegion: "DF", addressCountry: "BR" },
    areaServed: AREA_SERVED,
    founder: [
      { "@type": "Person", name: "Carlos Viegas", jobTitle: locale === "en" ? "Co-founder and CTO" : "Cofundador e CTO" },
      { "@type": "Person", name: "Gabriela Rosa", jobTitle: locale === "en" ? "Co-founder and CEO" : "Cofundadora e CEO" },
    ],
    contactPoint: { "@type": "ContactPoint", contactType: "sales", url: WHATSAPP_LINK, availableLanguage: ["pt-BR", "en"] },
    sameAs: [INSTAGRAM_URL],
  };
}

const faqNode = (url, faqs) => ({
  "@type": "FAQPage",
  "@id": `${url}#faq`,
  mainEntity: faqs.map(item => ({ "@type": "Question", name: item.q, acceptedAnswer: { "@type": "Answer", text: item.a } })),
});

function breadcrumbNode(url, locale, trail) {
  return {
    "@type": "BreadcrumbList",
    "@id": `${url}#breadcrumb`,
    itemListElement: trail.map(([name, path], index) => ({ "@type": "ListItem", position: index + 1, name, item: `${ORIGIN}${path}` })),
  };
}

export function pageStructuredData({ page, locale, title, description }) {
  const service = servicesFor(locale)[page];
  const portfolio = portfolioFor(locale);
  const portfolioDoc = portfolio[page];
  if (page !== "home" && !service && !portfolioDoc) return null;

  const homePath = HOME[locale].path;
  const path = service?.path ?? portfolioDoc?.path ?? homePath;
  const url = `${ORIGIN}${path}`;
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
  const graph = [organizationNode(locale), website, webpage];

  if (page !== "home") {
    const home = UI[locale].homeLabel;
    const trail = [[home, homePath]];
    if (portfolioDoc && page !== "portfolio") trail.push([portfolio.portfolio.label, portfolio.portfolio.path]);
    trail.push([service?.label ?? portfolioDoc.label, path]);
    const crumbs = breadcrumbNode(url, locale, trail);
    webpage.breadcrumb = { "@id": crumbs["@id"] };
    graph.push(crumbs);
  }

  if (service) {
    const serviceId = `${url}#service`;
    const node = {
      "@type": "Service",
      "@id": serviceId,
      url,
      name: service.label,
      serviceType: service.label,
      description: service.intro,
      provider: { "@id": ORGANIZATION_ID },
      areaServed: AREA_SERVED,
    };
    if (page === "landingPages") node.offers = { "@type": "Offer", price: service.price, priceCurrency: "BRL", url, availability: "https://schema.org/InStock" };
    graph.push(node);
    webpage.mainEntity = { "@id": serviceId };
    if (page === "career") {
      graph.push({
        "@type": "Product",
        "@id": `${url}#essencial`,
        name: service.productName,
        description: service.metaDescription,
        image: `${ORIGIN}/assets/essencial/essencial-capa.webp`,
        brand: { "@id": ORGANIZATION_ID },
        category: "E-book",
        inLanguage: "pt-BR",
        offers: { "@type": "Offer", price: service.price, priceCurrency: "BRL", url: CHECKOUT_ESSENCIAL, availability: "https://schema.org/InStock", seller: { "@id": ORGANIZATION_ID } },
      });
    }
  }

  const faqs = service?.faqs ?? (page === "home" ? HOME[locale].faqs : null);
  if (faqs) graph.push(faqNode(url, faqs));

  if (page === "portfolio") {
    const cases = CLIENT_PROJECTS.map(item => portfolio[item.key]);
    const apps = [[APPS.recarga, APP_STORE_LINKS.button, "UtilitiesApplication"], [APPS.deRole, DE_ROLE_APP_STORE.url, "GameApplication"]];
    graph.push({
      "@type": "ItemList",
      "@id": `${url}#projects`,
      itemListElement: [
        ...cases.map((item, index) => ({ "@type": "ListItem", position: index + 1, item: { "@type": "CreativeWork", name: item.name, url: `${ORIGIN}${item.path}`, creator: { "@id": ORGANIZATION_ID } } })),
        ...apps.map(([app, store, category], index) => ({ "@type": "ListItem", position: cases.length + index + 1, item: { "@type": "SoftwareApplication", name: app.name, operatingSystem: "iOS", applicationCategory: category, url: store, author: { "@id": ORGANIZATION_ID }, offers: { "@type": "Offer", price: "0", priceCurrency: "BRL" } } })),
      ],
    });
  } else if (portfolioDoc) {
    graph.push({
      "@type": "CreativeWork",
      "@id": `${url}#case`,
      name: portfolioDoc.name,
      description,
      url,
      image: `${ORIGIN}${portfolioDoc.desktop}`,
      creator: { "@id": ORGANIZATION_ID },
      inLanguage: webpage.inLanguage,
      about: { "@type": "Organization", name: portfolioDoc.name, url: portfolioDoc.url },
    });
    webpage.mainEntity = { "@id": `${url}#case` };
  }

  return { "@context": "https://schema.org", "@graph": graph };
}

export function serializeStructuredData(value) {
  return JSON.stringify(value).replaceAll("<", "\\u003c");
}
