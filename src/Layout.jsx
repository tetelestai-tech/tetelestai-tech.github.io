import { useEffect, useRef, useState } from "react";
import { AnalyticsPreferencesButton } from "./AnalyticsConsent.jsx";
import { INSTAGRAM_URL } from "./contact.mjs";
import { HOME, UI } from "./home-content.mjs";
import { LEGAL_CONTENT, LEGAL_PATHS } from "./legal-content.mjs";
import { equivalentPaths, portfolioFor, servicesFor } from "./localized-content.mjs";
import { IconArrow, IconArrowBack, SymbolPicture, WhatsAppLink } from "./ui.jsx";

export function pathFor(key, locale) {
  if (key === "home") return HOME[locale].path;
  if (key === "apps") return `${portfolioFor(locale).portfolio.path}#apps`;
  return servicesFor(locale)[key]?.path ?? portfolioFor(locale)[key]?.path ?? LEGAL_PATHS[key]?.[locale] ?? HOME[locale].path;
}

export function languagePaths(page) {
  return LEGAL_PATHS[page] ?? equivalentPaths(page);
}

function Brand({ locale, sizes = "42px" }) {
  return (
    <a className="brand" href={pathFor("home", locale)} aria-label={UI[locale].brandLabel}>
      <SymbolPicture sizes={sizes} width={42} height={42} />
      <span className="brand__name">TETELESTAI</span>
    </a>
  );
}

function LanguageSwitch({ locale, page }) {
  const paths = languagePaths(page);
  return (
    <div className="lang" role="group" aria-label={UI[locale].languageLabel}>
      {locale === "pt"
        ? <><span aria-current="true">PT</span><a href={paths.en} lang="en" hrefLang="en">EN</a></>
        : <><a href={paths.pt} lang="pt-BR" hrefLang="pt-BR">PT</a><span aria-current="true">EN</span></>}
    </div>
  );
}

const isCurrent = (key, page) => key === page || (key === "portfolio" && ["infinityProject", "jujuProject"].includes(page));

export function Header({ locale, page }) {
  const t = UI[locale];
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const toggle = useRef(null);
  const menu = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    document.body.style.overflow = "hidden";
    menu.current?.querySelector("a")?.focus();
    const onKey = event => {
      if (event.key !== "Escape") return;
      setOpen(false);
      toggle.current?.focus();
    };
    const onResize = () => { if (window.innerWidth > 980) setOpen(false); };
    document.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
    };
  }, [open]);

  return <>
    <header className={`site-head${scrolled ? " is-scrolled" : ""}`}>
      <div className="wrap site-head__in">
        <Brand locale={locale} />
        <nav className="nav" aria-label={t.navLabel}>
          {t.nav.map(([key, label]) => <a className="nav__link" href={pathFor(key, locale)} aria-current={isCurrent(key, page) ? "page" : undefined} key={key}>{label}</a>)}
        </nav>
        <div className="head-cta">
          <LanguageSwitch locale={locale} page={page} />
          <WhatsAppLink message={t.waDefault} className="btn btn--sm btn--ghost" icon={false}>{t.cta}</WhatsAppLink>
          <button ref={toggle} className="menu-btn" type="button" aria-expanded={open} aria-controls="mobile-menu" aria-label={open ? t.menuClose : t.menuOpen} onClick={() => setOpen(value => !value)}><span /></button>
        </div>
      </div>
    </header>
    <div ref={menu} className={`mobile-menu${open ? " is-open" : ""}`} id="mobile-menu" inert={open ? undefined : true} onClick={event => { if (event.target.closest("a")) setOpen(false); }}>
      {[["home", t.homeLabel], ...t.nav].map(([key, label]) => <a className="mm-link" href={pathFor(key, locale)} aria-current={isCurrent(key, page) ? "page" : undefined} key={key}>{label}<IconArrow /></a>)}
      <WhatsAppLink message={t.waDefault}>{t.ctaWhatsApp}</WhatsAppLink>
      <LanguageSwitch locale={locale} page={page} />
    </div>
  </>;
}

// Minimal header for app support pages linked from the App Store.
export function SupportHeader() {
  return (
    <header className="site-head">
      <div className="wrap site-head__in">
        <Brand locale="pt" />
        <a className="head-back" href="/"><IconArrowBack />Site da Tetelestai</a>
      </div>
    </header>
  );
}

export function Footer({ locale }) {
  const t = UI[locale];
  const f = t.footer;
  const other = locale === "pt" ? "en" : "pt";
  return (
    <footer className="site-foot">
      <div className="wrap site-foot__in">
        <div className="site-foot__top">
          <div className="site-foot__brand">
            <Brand locale={locale} />
            <p>{f.tagline}</p>
            <p className="site-foot__people">{f.people}</p>
          </div>
          <div className="site-foot__cols">
            {f.columns.map(([title, links]) => (
              <div className="site-foot__col" key={title}>
                <h2>{title}</h2>
                {links.map(([key, label]) => <a href={pathFor(key, locale)} key={key}>{label}</a>)}
              </div>
            ))}
            <div className="site-foot__col">
              <h2>{f.contact}</h2>
              <WhatsAppLink message={t.waDefault} className={null} icon={false}>WhatsApp</WhatsAppLink>
              <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer">Instagram</a>
            </div>
          </div>
        </div>
        <div className="site-foot__bottom">
          <span>{f.company}</span>
          <nav className="site-foot__legal" aria-label={LEGAL_CONTENT[locale].navigation}>
            {Object.entries(LEGAL_PATHS).map(([key, paths]) => <a href={paths[locale]} key={key}>{LEGAL_CONTENT[locale][key].label}</a>)}
            <a href={pathFor("home", other)} lang={other === "en" ? "en" : "pt-BR"} hrefLang={other === "en" ? "en" : "pt-BR"}>{f.otherLanguage}</a>
            <AnalyticsPreferencesButton locale={locale} />
          </nav>
          <p className="site-foot__verse"><span>{f.verse}</span>{" "}<span>{f.verseReference}</span></p>
        </div>
      </div>
    </footer>
  );
}

// Mobile-only WhatsApp (or purchase) button, shown between the hero and the final call to action.
export function StickyCta({ children }) {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const hero = document.querySelector(".hero");
    const final = document.querySelector(".cta-final");
    if (!hero || !("IntersectionObserver" in window)) return undefined;
    let heroVisible = true; let finalVisible = false;
    const update = () => setOn(!heroVisible && !finalVisible);
    const heroObserver = new IntersectionObserver(entries => { heroVisible = entries[0].isIntersecting; update(); });
    heroObserver.observe(hero);
    const finalObserver = final && new IntersectionObserver(entries => { finalVisible = entries[0].isIntersecting; update(); });
    if (final) finalObserver.observe(final);
    return () => { heroObserver.disconnect(); finalObserver?.disconnect(); };
  }, []);
  return <div className={`sticky-cta${on ? " is-on" : ""}`} aria-hidden={on ? undefined : "true"} inert={on ? undefined : true}>{children}</div>;
}

export function PageShell({ locale, page, sticky, children }) {
  const t = UI[locale];
  return (
    <div className="site-shell">
      <a className="skip-link" href="#main-content">{t.skip}</a>
      <Header locale={locale} page={page} />
      <main id="main-content">{children}</main>
      <Footer locale={locale} />
      {sticky !== null && <StickyCta>{sticky ?? <WhatsAppLink message={t.waDefault}>{t.ctaWhatsApp}</WhatsAppLink>}</StickyCta>}
    </div>
  );
}
