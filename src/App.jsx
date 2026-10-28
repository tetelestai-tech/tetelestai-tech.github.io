import { useEffect } from "react";
import "@fontsource/michroma/400.css";
import "@fontsource-variable/inter/opsz.css";
import { LEGAL_CONTENT, LEGAL_PATHS } from "./legal-content.mjs";
import { RECARGA_PAGES } from "./recarga-content.mjs";
import { DE_ROLE_PAGES } from "./de-role-content.mjs";
import { SERVICE_PAGES } from "./service-content.mjs";
import { PORTFOLIO_PAGES } from "./portfolio-content.mjs";
import { EN_SERVICE_PAGES, EN_PORTFOLIO_PAGES, servicesFor, portfolioFor, equivalentPaths } from "./localized-content.mjs";
import { HOME, UI } from "./home-content.mjs";
import { pageStructuredData, serializeStructuredData } from "./structured-data.mjs";
import { AnalyticsConsent } from "./AnalyticsConsent.jsx";
import { createReveal } from "./reveal-kit.mjs";
import { createCircuitMotion } from "./circuit-motion.mjs";
import { createScrollShots } from "./scroll-shots.mjs";
import { HomePage } from "./pages/HomePage.jsx";
import { AiPage, CareerPage, LandingPage, SitesPage } from "./pages/ServicePages.jsx";
import { CasePage, PortfolioIndex } from "./pages/PortfolioPages.jsx";
import { DeRolePage, LegalPage, NotFoundPage, RecargaPage } from "./pages/DocumentPages.jsx";

const ROUTES = {
  ...Object.fromEntries(Object.entries({ ...EN_SERVICE_PAGES, ...EN_PORTFOLIO_PAGES }).map(([page, entry]) => [entry.path.replace(/\/$/, ""), { locale: "en", page }])),
  ...Object.fromEntries(Object.entries(PORTFOLIO_PAGES).map(([page, entry]) => [entry.path.replace(/\/$/, ""), { locale: "pt", page }])),
  ...Object.fromEntries(Object.entries(DE_ROLE_PAGES).map(([page, document]) => [document.path.replace(/\/$/, ""), { locale: "pt", page }])),
  "/": { locale: "pt", page: "home" },
  "/en": { locale: "en", page: "home" },
  ...Object.fromEntries(Object.entries(SERVICE_PAGES).map(([page, service]) => [service.path.replace(/\/$/, ""), { locale: "pt", page }])),
  ...Object.fromEntries(Object.entries(LEGAL_PATHS).flatMap(([page, paths]) =>
    Object.entries(paths).map(([locale, pathname]) => [pathname.replace(/\/$/, ""), { locale, page }]),
  )),
  ...Object.fromEntries(Object.entries(RECARGA_PAGES).map(([page, document]) => [document.path.replace(/\/$/, ""), { locale: "pt", page }])),
};

function normalizePathname(pathname) {
  if (pathname.endsWith("/index.html")) {
    const directory = pathname.slice(0, -"index.html".length);
    if (directory.endsWith("//")) return pathname;
    pathname = directory;
  }
  if (pathname === "/") return pathname;
  return pathname.replace(/\/+$/, "");
}

function resolveRoute(pathname) {
  if (pathname.startsWith("/projetos/") && pathname.endsWith("//")) return { locale: "pt", page: "notFound" };
  if ((pathname.startsWith("/recarga/") || pathname.startsWith("/de-role/")) && pathname.endsWith("//")) return { locale: "pt", page: "notFound" };
  if (pathname.startsWith("/en/") && pathname.endsWith("//")) return { locale: "en", page: "notFound" };
  const normalizedPath = normalizePathname(pathname);
  if (ROUTES[normalizedPath]) return ROUTES[normalizedPath];
  return { locale: normalizedPath.startsWith("/en/") ? "en" : "pt", page: "notFound" };
}

const SERVICE_VIEWS = { sites: SitesPage, landingPages: LandingPage, career: CareerPage, aiTraining: AiPage };

function PageView({ locale, page }) {
  if (DE_ROLE_PAGES[page]) return <DeRolePage page={page} />;
  if (RECARGA_PAGES[page]) return <RecargaPage page={page} />;
  if (SERVICE_VIEWS[page]) { const View = SERVICE_VIEWS[page]; return <View locale={locale} />; }
  if (page === "portfolio") return <PortfolioIndex locale={locale} />;
  if (PORTFOLIO_PAGES[page]) return <CasePage locale={locale} page={page} />;
  if (LEGAL_PATHS[page]) return <LegalPage locale={locale} page={page} />;
  if (page === "notFound") return <NotFoundPage locale={locale} />;
  return <HomePage locale={locale} />;
}

function updateMeta(selector, attribute, value) {
  const element = document.querySelector(selector);
  if (element) element.setAttribute(attribute, value);
}

export function App({ pathname = window.location.pathname }) {
  const { locale, page } = resolveRoute(pathname);
  const t = UI[locale];
  const commercial = servicesFor(locale)[page] ?? portfolioFor(locale)[page] ?? (page === "home" ? HOME[locale] : null);

  useEffect(() => {
    const root = document.querySelector(".site-shell");
    const reveal = createReveal(root);
    const circuit = createCircuitMotion(root);
    const shots = createScrollShots(root);
    return () => { reveal.destroy(); circuit.destroy(); shots.destroy(); };
  }, [locale, page]);

  useEffect(() => {
    const recarga = RECARGA_PAGES[page];
    const deRole = DE_ROLE_PAGES[page];
    const legal = deRole ?? recarga ?? (LEGAL_PATHS[page] ? LEGAL_CONTENT[locale][page] : null);
    const pageContent = commercial ?? legal;
    const isNotFound = page === "notFound";
    const title = pageContent ? pageContent.metaTitle : t.notFound.metaTitle;
    const description = pageContent ? pageContent.metaDescription : t.notFound.text;
    const paths = LEGAL_PATHS[page] ?? equivalentPaths(page);
    const canonicalPath = commercial?.path ?? deRole?.path ?? recarga?.path ?? paths[locale];
    const canonicalUrl = `https://tetelestai.tech${canonicalPath}`;

    document.documentElement.lang = t.lang;
    document.title = title;
    updateMeta('meta[name="description"]', "content", description);
    updateMeta('meta[name="robots"]', "content", legal || isNotFound ? "noindex,nofollow" : "index,follow");
    updateMeta('meta[property="og:title"]', "content", title);
    updateMeta('meta[property="og:description"]', "content", description);
    updateMeta('meta[property="og:url"]', "content", canonicalUrl);
    updateMeta('meta[property="og:locale"]', "content", locale === "en" ? "en_US" : "pt_BR");
    updateMeta('meta[property="og:locale:alternate"]', "content", locale === "en" ? "pt_BR" : "en_US");
    const imageAlt = locale === "en" ? "Tetelestai's original symbol on a navy background." : "Símbolo original da Tetelestai sobre fundo azul-marinho.";
    updateMeta('meta[property="og:image:alt"]', "content", imageAlt);
    updateMeta('meta[name="twitter:title"]', "content", title);
    updateMeta('meta[name="twitter:description"]', "content", description);
    updateMeta('meta[name="twitter:image:alt"]', "content", imageAlt);
    updateMeta('link[rel="canonical"]', "href", canonicalUrl);
    updateMeta('link[hreflang="pt-BR"]', "href", `https://tetelestai.tech${paths.pt}`);
    updateMeta('link[hreflang="en"]', "href", `https://tetelestai.tech${paths.en}`);
    updateMeta('link[hreflang="x-default"]', "href", `https://tetelestai.tech${paths.pt}`);
    if (deRole || recarga) {
      document.querySelectorAll('link[rel="alternate"][hreflang]').forEach((link) => link.remove());
      document.querySelector('meta[property="og:locale:alternate"]')?.remove();
    }
  }, [locale, page, t, commercial]);

  const structuredData = commercial && pageStructuredData({ page, locale, title: commercial.metaTitle, description: commercial.metaDescription });
  return <>
    {structuredData && <script type="application/ld+json" id="structured-data" dangerouslySetInnerHTML={{ __html: serializeStructuredData(structuredData) }} />}
    <PageView locale={locale} page={page} />
    <AnalyticsConsent locale={locale} pathname={pathname} />
  </>;
}
