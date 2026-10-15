import { useEffect, useRef, useState } from "react";
import "@fontsource/michroma/400.css";
import "@fontsource-variable/inter/wght.css";
import { ArrowLeftIcon } from "@phosphor-icons/react/dist/csr/ArrowLeft";
import { ArrowRightIcon } from "@phosphor-icons/react/dist/csr/ArrowRight";
import { ArrowUpIcon } from "@phosphor-icons/react/dist/csr/ArrowUp";
import { CheckCircleIcon } from "@phosphor-icons/react/dist/csr/CheckCircle";
import { CpuIcon } from "@phosphor-icons/react/dist/csr/Cpu";
import { GlobeHemisphereWestIcon } from "@phosphor-icons/react/dist/csr/GlobeHemisphereWest";
import { GraduationCapIcon } from "@phosphor-icons/react/dist/csr/GraduationCap";
import { ListIcon } from "@phosphor-icons/react/dist/csr/List";
import { WhatsappLogoIcon } from "@phosphor-icons/react/dist/csr/WhatsappLogo";
import { XIcon } from "@phosphor-icons/react/dist/csr/X";
import { LEGAL_CONTENT, LEGAL_PATHS, PRIVACY_CONTACT } from "./legal-content.mjs";
import { RECARGA_PAGES, RECARGA_UPDATED } from "./recarga-content.mjs";
import { DE_ROLE_PAGES, DE_ROLE_UPDATED } from "./de-role-content.mjs";
import { SERVICE_PAGES } from "./service-content.mjs";
import { pageStructuredData, serializeStructuredData } from "./structured-data.mjs";
import { OwnProjects } from "./OwnProjects.jsx";
import { CLIENT_PROJECTS, PORTFOLIO_PAGES } from "./portfolio-content.mjs";
import { ClientProjects, ProjectScreens } from "./ClientProjects.jsx";
import { EN_SERVICE_PAGES, EN_PORTFOLIO_PAGES, servicesFor, portfolioFor, equivalentPaths } from "./localized-content.mjs";
import { InstagramContents } from "./InstagramContents.jsx";
import { AnalyticsConsent, AnalyticsPreferencesButton } from "./AnalyticsConsent.jsx";
import { getAnalytics } from "./analytics.mjs";

const WHATSAPP_LINK = "https://wa.me/556184711930";

const ROUTES = {
  ...Object.fromEntries(Object.entries({...EN_SERVICE_PAGES,...EN_PORTFOLIO_PAGES}).map(([page, entry]) => [entry.path.replace(/\/$/, ""), {locale:"en",page}])),
  ...Object.fromEntries(Object.entries(PORTFOLIO_PAGES).map(([page, entry]) => [entry.path.replace(/\/$/, ""), {locale: "pt", page}])),
  ...Object.fromEntries(Object.entries(DE_ROLE_PAGES).map(([page, document]) =>
    [document.path.replace(/\/$/, ""), { locale: "pt", page }],
  )),
  "/": { locale: "pt", page: "home" },
  "/en": { locale: "en", page: "home" },
  ...Object.fromEntries(Object.entries(SERVICE_PAGES).map(([page, service]) =>
    [service.path.replace(/\/$/, ""), { locale: "pt", page }],
  )),
  ...Object.fromEntries(Object.entries(LEGAL_PATHS).flatMap(([page, paths]) =>
    Object.entries(paths).map(([locale, pathname]) => [pathname.replace(/\/$/, ""), { locale, page }]),
  )),
  ...Object.fromEntries(Object.entries(RECARGA_PAGES).map(([page, document]) =>
    [document.path.replace(/\/$/, ""), { locale: "pt", page }],
  )),
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
  if (pathname.startsWith("/en/") && pathname.endsWith("//")) return {locale:"en",page:"notFound"};
  const normalizedPath = normalizePathname(pathname);
  if (ROUTES[normalizedPath]) return ROUTES[normalizedPath];
  return { locale: normalizedPath.startsWith("/en/") ? "en" : "pt", page: "notFound" };
}

const content = {
  pt: {
    lang: "pt-BR",
    title: "Tetelestai | Carreira internacional, soluções digitais e IA",
    description:
      "Consultoria para carreiras internacionais em tecnologia, automação e soluções digitais para negócios e capacitação prática em inteligência artificial.",
    skip: "Pular para o conteúdo",
    homeLabel: "Tetelestai — início",
    menuOpen: "Abrir menu",
    menuClose: "Fechar menu",
    navLabel: "Navegação principal",
    languageLabel: "Idioma",
    backToTopLabel: "Voltar ao topo",
    nav: { solutions: "Soluções", projects: "Projetos", method: "Método", about: "Sobre", contact: "Contato" },
    slogan: "Tecnologia com propósito. Oportunidades sem fronteiras.",
    heroOffer: "Carreira\u00a0internacional · Soluções\u00a0digitais · Capacitação\u00a0em\u00a0IA",
    serviceContactLabel: "Conversar sobre este serviço",
    projectsLinkLabel: "Ver portfólio",
    servicesLabel: "Soluções Tetelestai",
    services: [
      {
        id: "carreira-internacional",
        title: "Carreira internacional",
        summary: "Orientação estratégica para profissionais de tecnologia que desejam atuar globalmente.",
        detail:
          "Posicionamento profissional com currículo em inglês, LinkedIn, adequação a ATS e estratégia de candidatura.",
        cta: "Conheça a consultoria",
        Icon: GlobeHemisphereWestIcon,
      },
      {
        id: "solucoes-digitais",
        title: "Automação e soluções digitais",
        summary:
          "Sites, sistemas e automações de atendimento no WhatsApp para reduzir tarefas manuais e apoiar o crescimento do negócio.",
        detail:
          "Sites e landing pages com design visual sob medida, automação de atendimento no WhatsApp e sistemas ou MVPs com escopo definido conforme cada projeto.",
        cta: "Converse sobre uma solução",
        Icon: CpuIcon,
      },
      {
        id: "capacitacao-ia",
        title: "Capacitação em IA",
        summary: "Treinamentos práticos e aplicados para pessoas e empresas desenvolverem habilidades em IA.",
        detail:
          "Treinamentos práticos em IA, com conteúdo e formato ajustados ao público, ao objetivo e ao nível de conhecimento dos participantes.",
        cta: "Conheça os treinamentos",
        Icon: GraduationCapIcon,
      },
    ],
    introTitle: ["Tecnologia com direção.", "Propósito em cada solução."],
    introText:
      "A Tetelestai combina experiência técnica, visão global e propósito para aproximar profissionais e organizações de novas possibilidades.",
    solutionsKicker: "Três frentes. Um compromisso com clareza.",
    solutionsTitle: "Escolha a solução adequada ao seu objetivo",
    methodKicker: "Método",
    methodTitle: "Um processo claro do contexto à entrega",
    methodIntro:
      "Cada trabalho começa com entendimento e escopo. A execução segue critérios definidos e termina com uma entrega revisada.",
    method: [
      { number: "01", title: "Entendimento", text: "Objetivo, cenário atual e restrições relevantes." },
      { number: "02", title: "Definição", text: "Escopo, critérios de trabalho e resultado esperado." },
      { number: "03", title: "Execução e entrega", text: "Trabalho conduzido com atenção técnica, revisão e próximos passos." },
    ],
    aboutKicker: "Sobre",
    aboutTitle: "Experiência técnica aplicada a desafios reais",
    aboutText:
      "A Tetelestai atua na interseção entre tecnologia, desenvolvimento profissional e inteligência artificial.",
    people: [
      {
        name: "Carlos Viegas",
        role: "Co-Founder & CTO",
        bio: "Co-fundador. Lidera a direção técnica dos projetos de tecnologia, e-commerce e inteligência artificial.",
      },
      {
        name: "Gabriela Rosa",
        role: "Co-Founder & CEO",
        bio: "Co-fundadora e administradora da Tetelestai. Lidera o negócio, o marketing e o relacionamento com clientes.",
      },
    ],
    faqKicker: "Perguntas frequentes",
    faqTitle: "Antes de começar",
    faqs: [
      {
        q: "Para quem é a consultoria de carreira internacional?",
        a: "Para profissionais de tecnologia que desejam melhorar seu posicionamento e estruturar candidaturas para oportunidades internacionais.",
      },
      {
        q: "A consultoria garante entrevistas ou contratação?",
        a: "Não. A Tetelestai não garante entrevista, contratação, visto ou qualquer resultado migratório.",
      },
      {
        q: "A consultoria inclui assessoria jurídica migratória?",
        a: "Não. O serviço não inclui assessoria jurídica relacionada a vistos ou imigração.",
      },
      {
        q: "Que tipos de soluções digitais a Tetelestai desenvolve?",
        a: "A Tetelestai desenvolve sites e landing pages, sistemas web, MVPs e automações integradas ao WhatsApp. Aplicativos móveis são avaliados conforme a necessidade e o escopo de cada projeto.",
      },
      {
        q: "Como pedir uma proposta para um site ou uma landing page?",
        a: "Informe o objetivo do projeto, o público, os materiais disponíveis e se já existe domínio, hospedagem ou uma página publicada. O escopo, a disponibilidade e as condições são definidos na proposta.",
      },
      {
        q: "A capacitação em IA tem um programa fixo?",
        a: "A oferta é sob demanda. Conteúdo e formato são definidos conforme o público, o objetivo e o nível de conhecimento dos participantes.",
      },
    ],
    contactKicker: "Contato",
    contactTitle: "Vamos conversar sobre o seu objetivo?",
    contactText:
      "Informe qual das três soluções corresponde à sua necessidade e consulte escopo, disponibilidade e condições.",
    whatsappLabel: "Conversar pelo WhatsApp",
    safety:
      "No primeiro contato, não envie senhas, dados bancários, documentos de identidade, currículos completos ou outras informações sensíveis.",
    footerNote: "Tecnologia com propósito. Oportunidades sem fronteiras.",
    footerVerse: "Está consumado!",
    footerVerseReference: "João 19:30",
    notFound: {
      kicker: "Página não encontrada",
      title: "Este endereço não existe",
      text: "Volte ao início para conhecer as soluções da Tetelestai.",
      back: "Ir para o início",
      metaTitle: "Página não encontrada | Tetelestai",
    },
  },
  en: {
    lang: "en",
    title: "Tetelestai | International careers, digital solutions and AI",
    description:
      "International career consulting for technology professionals, business automation and digital solutions, and practical artificial intelligence training.",
    skip: "Skip to content",
    homeLabel: "Tetelestai — home",
    menuOpen: "Open menu",
    menuClose: "Close menu",
    navLabel: "Primary navigation",
    languageLabel: "Language",
    backToTopLabel: "Back to top",
    nav: { solutions: "Solutions", projects: "Projects", method: "Method", about: "About", contact: "Contact" },
    slogan: "Technology with purpose. Opportunities without borders.",
    heroOffer: "International\u00a0careers · Digital\u00a0solutions · AI\u00a0training",
    serviceContactLabel: "Discuss this service",
    projectsLinkLabel: "View our portfolio",
    servicesLabel: "Tetelestai solutions",
    services: [
      {
        id: "international-career",
        title: "International career",
        summary: "Strategic guidance for technology professionals who want to work globally.",
        detail: "Professional positioning through an English CV, LinkedIn, ATS alignment and application strategy.",
        cta: "Explore the consulting service",
        Icon: GlobeHemisphereWestIcon,
      },
      {
        id: "digital-solutions",
        title: "Automation and digital solutions",
        summary:
          "Websites, systems and WhatsApp customer service automation that reduce manual work and support business growth.",
        detail:
          "Websites and landing pages with tailored visual design, WhatsApp customer service automation, and systems or MVPs scoped around each project.",
        cta: "Discuss a digital solution",
        Icon: CpuIcon,
      },
      {
        id: "practical-ai",
        title: "Practical AI training",
        summary: "Applied training for people and companies building practical AI capabilities.",
        detail: "Practical AI training with content and format adapted to the audience, objective and participants’ level of knowledge.",
        cta: "Explore the training",
        Icon: GraduationCapIcon,
      },
    ],
    introTitle: ["Technology with direction.", "Purpose in every solution."],
    introText:
      "Tetelestai combines technical experience, global perspective and purpose to connect professionals and organizations with new possibilities.",
    solutionsKicker: "Three areas. One commitment to clarity.",
    solutionsTitle: "Choose the right solution for your objective",
    methodKicker: "Method",
    methodTitle: "A clear process from context to delivery",
    methodIntro:
      "Every engagement begins with understanding and scope. Execution follows defined criteria and ends with a reviewed delivery.",
    method: [
      { number: "01", title: "Understanding", text: "Objective, current situation and relevant constraints." },
      { number: "02", title: "Definition", text: "Scope, working criteria and expected outcome." },
      { number: "03", title: "Execution and delivery", text: "Technical execution, review and practical next steps." },
    ],
    aboutKicker: "About",
    aboutTitle: "Technical experience applied to real challenges",
    aboutText: "Tetelestai works at the intersection of technology, professional development and artificial intelligence.",
    people: [
      {
        name: "Carlos Viegas",
        role: "Co-Founder & CTO",
        bio: "Co-founder. Leads the technical direction of technology, e-commerce and AI engagements.",
      },
      {
        name: "Gabriela Rosa",
        role: "Co-Founder & CEO",
        bio: "Co-founder and Tetelestai’s managing partner. Leads the business, marketing and client relations.",
      },
    ],
    faqKicker: "Frequently asked questions",
    faqTitle: "Before we begin",
    faqs: [
      {
        q: "Who is international career consulting for?",
        a: "Technology professionals who want to improve their positioning and structure applications for international opportunities.",
      },
      {
        q: "Does the consulting service guarantee interviews or hiring?",
        a: "No. Tetelestai does not guarantee interviews, hiring, visas or any immigration outcome.",
      },
      {
        q: "Does it include immigration legal advice?",
        a: "No. The service does not include legal advice related to visas or immigration.",
      },
      {
        q: "What types of digital solutions does Tetelestai build?",
        a: "Tetelestai builds websites and landing pages, web systems, MVPs and WhatsApp integrations. Mobile apps are evaluated according to each project’s needs and scope.",
      },
      {
        q: "How do I request a proposal for a website or landing page?",
        a: "Tell us the project's objective, audience, available materials and whether you already have a domain, hosting or a published page. Scope, availability and conditions are defined in the proposal.",
      },
      {
        q: "Does AI training have a fixed programme?",
        a: "Training is offered on demand. Content and format are defined according to the audience, objective and participants' knowledge level.",
      },
    ],
    contactKicker: "Contact",
    contactTitle: "Let’s talk about your objective",
    contactText: "Tell us which of the three solutions fits your need and ask about scope, availability and conditions.",
    whatsappLabel: "Chat on WhatsApp",
    safety: "Do not send passwords, banking details, identity documents, full CVs or other sensitive information in the first contact.",
    footerNote: "Technology with purpose. Opportunities without borders.",
    footerVerse: "It is finished!",
    footerVerseReference: "John 19:30",
    notFound: {
      kicker: "Page not found",
      title: "This address does not exist",
      text: "Return home to explore Tetelestai's solutions.",
      back: "Go to the homepage",
      metaTitle: "Page not found | Tetelestai",
    },
  },
};

function Brand({ compact = false }) {
  return (
    <span className={`brand ${compact ? "brand--compact" : ""}`}>
      <picture className="optimized-image">
        <source type="image/webp" srcSet="/assets/tetelestai-symbol-144.webp 144w, /assets/tetelestai-symbol-320.webp 320w" sizes={compact ? "48px" : "(max-width: 900px) 52px, 62px"} />
        <img src="/assets/tetelestai-symbol.png" width="72" height="72" alt="" aria-hidden="true" />
      </picture>
      <span className="brand__copy">
        <span className="brand__name">TETELESTAI</span>
        {!compact && <span className="brand__legal">SOLUÇÕES EM TECNOLOGIA LTDA.</span>}
      </span>
    </span>
  );
}

function Header({ t, locale, page }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuToggle = useRef(null);
  useEffect(() => {
    if (!menuOpen) return;
    const handleEscape = (event) => {
      if (event.key !== "Escape") return;
      setMenuOpen(false);
      menuToggle.current?.focus();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [menuOpen]);
  const homePath = locale === "en" ? "/en/" : "/";
  const languagePaths = LEGAL_PATHS[page] ?? equivalentPaths(page);
  const closeMenu = () => setMenuOpen(false);
  const isService = Boolean(SERVICE_PAGES[page]);
  const isPortfolio = Boolean(PORTFOLIO_PAGES[page]);

  return (
    <header className="site-header">
      <div className="site-header__inner">
        <a className="brand-link" href={homePath} aria-label={t.homeLabel}><Brand /></a>
        <button
          ref={menuToggle}
          className="menu-toggle"
          type="button"
          aria-label={menuOpen ? t.menuClose : t.menuOpen}
          aria-expanded={menuOpen}
          aria-controls="primary-navigation"
          onClick={() => setMenuOpen((value) => !value)}
        >
          {menuOpen ? <XIcon size={26} /> : <ListIcon size={26} />}
        </button>
        <nav id="primary-navigation" className={`primary-nav ${menuOpen ? "primary-nav--open" : ""}`} aria-label={t.navLabel}>
          <a href={`${homePath}#solutions`} onClick={closeMenu}>{t.nav.solutions}</a>
          <a href={`${homePath}#projects`} onClick={closeMenu}>{t.nav.projects}</a>
          <a href={isService ? "#method" : `${homePath}#method`} onClick={closeMenu}>{t.nav.method}</a>
          <a href={`${homePath}#about`} onClick={closeMenu}>{t.nav.about}</a>
          <a href={isService || isPortfolio ? "#contact" : `${homePath}#contact`} onClick={closeMenu}>{t.nav.contact}</a>
          <span className="locale-switch" aria-label={t.languageLabel}>
            <a href={languagePaths.pt} lang="pt-BR" aria-current={locale === "pt" ? "page" : undefined}>PT</a>
            <span aria-hidden="true">|</span>
            <a href={languagePaths.en} lang="en" title={locale === "pt" ? "Read this page in English" : "English version"} aria-current={locale === "en" ? "page" : undefined}>EN</a>
          </span>
        </nav>
      </div>
    </header>
  );
}

function BackToTop({ label }) {
  return (
    <div className="back-to-top-row">
      <a className="back-to-top" href="#home" aria-label={label}>
        <ArrowUpIcon size={24} weight="light" aria-hidden="true" />
      </a>
    </div>
  );
}

function Footer({ t, locale }) {
  const homePath = locale === "en" ? "/en/" : "/";
  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <a className="brand-link" href={homePath} aria-label={t.homeLabel}><Brand compact /></a>
        <p className="site-footer__note">{t.footerNote}</p>
        <div className="site-footer__company">
          <span>Tetelestai Soluções em Tecnologia Ltda.</span>
          <span>CNPJ 58.138.258/0001-39</span>
          <span>Carlos Viegas — Co-Founder & CTO</span>
          <span>Gabriela Rosa — Co-Founder & CEO</span>
        </div>
        <p className="site-footer__verse">
          {t.footerVerse}
          <span className="site-footer__verse-reference">
            {"\u00A0"}
            {t.footerVerseReference}
          </span>
        </p>
        <nav className="footer-legal-links" aria-label={LEGAL_CONTENT[locale].navigation}>
          {Object.entries(LEGAL_PATHS).map(([page, paths]) => (
            <a className="footer-link" href={paths[locale]} key={page}>{LEGAL_CONTENT[locale][page].label}</a>
          ))}
          <AnalyticsPreferencesButton locale={locale} />
        </nav>
      </div>
    </footer>
  );
}

function ServicePage({ t, page, locale }) {
  const service = servicesFor(locale)[page];
  const related = servicesFor(locale)[service.relatedKey];
  const english = locale === "en";
  const homePath = english ? "/en/" : "/";
  const u = (pt,en) => english ? en : pt;
  return (
    <div className="app-shell service-page">
      <a className="skip-link" href="#main-content">{t.skip}</a>
      <Header t={t} locale={locale} page={page} />
      <main id="main-content">
        <section id="home" className="service-hero" aria-labelledby="service-title">
          <div className="section-shell">
            <nav className="service-breadcrumb" aria-label={u("Caminho da página","Breadcrumb")}>
              <a href={homePath}>{u("Início","Home")}</a><span aria-hidden="true">/</span><span aria-current="page">{service.label}</span>
            </nav>
            <p className="eyebrow">{service.category}</p>
            <h1 id="service-title">{service.title}</h1>
            <p className="service-hero__intro">{service.intro}</p>
            <div className="hero-actions service-hero__actions">
              <a className="button button--primary" href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" onClick={() => getAnalytics().trackWhatsApp()}><WhatsappLogoIcon size={21} aria-hidden="true" />{service.ctaLabel}</a>
              {service.showOwnProjects && <a className="text-link" href="#projects">{u("Ver projetos em destaque","View selected projects")}<ArrowRightIcon size={20} aria-hidden="true" /></a>}
            </div>
          </div>
        </section>
        {service.showOwnProjects && <ClientProjects locale={locale}>
          <BackToTop label={t.backToTopLabel} />
        </ClientProjects>}
        <section className="service-section" aria-labelledby="use-cases-title">
          <div className="section-shell">
            <p className="eyebrow">{u("Seu objetivo","Your objective")}</p>
            <h2 id="use-cases-title">{service.objectiveTitle}</h2>
            <div className="service-feature-grid">
              {service.useCases.map((item, index) => (
                <article key={item.title}>
                  <span className="service-feature__number" aria-hidden="true">0{index + 1}</span>
                  <h3>{item.title}</h3><p>{item.text}</p>
                </article>
              ))}
            </div>
          </div>
          <BackToTop label={t.backToTopLabel} />
        </section>
        <section className="service-section service-section--surface" aria-labelledby="scope-title">
          <div className="section-shell method-section__grid">
            <div>
              <p className="eyebrow">{u("Escopo do projeto","Project scope")}</p>
              <h2 id="scope-title">{u("O que vamos definir juntos","What we will define together")}</h2>
              <p className="section-intro">{service.scopeIntro}</p>
            </div>
            <ul className="method-list">
              {service.scope.map((item, index) => (
                <li key={item.title}><span aria-hidden="true">0{index + 1}</span><div><h3>{item.title}</h3><p>{item.text}</p></div></li>
              ))}
            </ul>
          </div>
          <BackToTop label={t.backToTopLabel} />
        </section>
        <section id="method" className="method-section" aria-labelledby="method-title">
          <div className="section-shell method-section__grid">
            <div><p className="eyebrow">{t.methodKicker}</p><h2 id="method-title">{t.methodTitle}</h2><p className="section-intro">{t.methodIntro}</p></div>
            <ol className="method-list">
              {t.method.map((step) => (
                <li key={step.number}><span>{step.number}</span><div><h3>{step.title}</h3><p>{step.text}</p></div></li>
              ))}
            </ol>
          </div>
          <BackToTop label={t.backToTopLabel} />
        </section>
        <section className="faq-section" aria-labelledby="faq-title">
          <div className="section-shell faq-section__grid">
            <div><p className="eyebrow">{u("Perguntas frequentes","Frequently asked questions")}</p><h2 id="faq-title">{u("Antes de começar","Before we begin")}</h2></div>
            <div className="faq-list">
              {service.faqs.map((faq) => <details key={faq.q}><summary>{faq.q}</summary><p>{faq.a}</p></details>)}
            </div>
          </div>
          <BackToTop label={t.backToTopLabel} />
        </section>
        <section id="contact" className="contact-section" aria-labelledby="contact-title">
          <div className="section-shell contact-section__inner">
            <div><p className="eyebrow">{u("Vamos conversar","Let’s talk")}</p><h2 id="contact-title">{service.contactTitle}</h2><p>{service.contactText}</p></div>
            <div className="contact-panel">
              <a className="button button--primary" href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" onClick={() => getAnalytics().trackWhatsApp()}><WhatsappLogoIcon size={22} aria-hidden="true" />{service.ctaLabel}</a>
              <p>{t.safety}</p>
            </div>
          </div>
          <BackToTop label={t.backToTopLabel} />
        </section>
        {related && <nav className="section-shell service-related" aria-label={u("Outro serviço digital","Related digital service")}>
          <p>{u("Conheça também","Explore also")}</p>
          <a className="text-link" href={related.path}>{related.label}<ArrowRightIcon size={20} aria-hidden="true" /></a>
        </nav>}
      </main>
      <Footer t={t} locale={locale} />
    </div>
  );
}

function PortfolioContact({ t, locale }) {
  const u = (pt,en) => locale === "en" ? en : pt;
  return <section id="contact" className="contact-section" aria-labelledby="contact-title">
    <div className="section-shell contact-section__inner">
      <div><p className="eyebrow">{u("Seu próximo projeto","Your next project")}</p><h2 id="contact-title">{u("Vamos apresentar o seu negócio?","Shall we present your business?")}</h2><p>{u("Conte o que você precisa comunicar. Vamos conversar sobre o objetivo, o escopo e as condições do seu projeto.","Tell us what you need to communicate. We will discuss your project’s objective, scope and working conditions.")}</p></div>
      <div className="contact-panel"><a className="button button--primary" href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" onClick={() => getAnalytics().trackWhatsApp()}><WhatsappLogoIcon size={22} aria-hidden="true" />{u("Quero um projeto para minha empresa","Discuss a project for my business")}</a><p>{t.safety}</p></div>
    </div><BackToTop label={t.backToTopLabel} />
  </section>;
}

function PortfolioPage({ t, page, locale }) {
  const pages = portfolioFor(locale);
  const portfolioDoc = pages[page];
  const isIndex = page === "portfolio";
  const project = isIndex ? null : portfolioDoc;
  const next = project && Object.values(pages).find(item => item.key && item.key !== project.key);
  const english = locale === "en";
  const homePath = english ? "/en/" : "/";
  const u = (pt,en) => english ? en : pt;
  return <div className="app-shell portfolio-page">
    <a className="skip-link" href="#main-content">{t.skip}</a>
    <Header t={t} locale={locale} page={page} />
    <main id="main-content">
      <section id="home" className="service-hero portfolio-hero" aria-labelledby="portfolio-title">
        <div className="section-shell">
          <nav className="service-breadcrumb" aria-label={u("Caminho da página","Breadcrumb")}><a href={homePath}>{u("Início","Home")}</a><span aria-hidden="true">/</span>{isIndex ? <span aria-current="page">{u("Projetos","Projects")}</span> : <><a href={pages.portfolio.path}>{u("Projetos","Projects")}</a><span aria-hidden="true">/</span><span aria-current="page">{project.name}</span></>}</nav>
          <p className="eyebrow">{isIndex ? u("Portfólio · Soluções digitais","Portfolio · Digital solutions") : `${project.category} · ${project.type}`}</p>
          <h1 id="portfolio-title">{isIndex ? <>{u("Sites com identidade.","Websites with identity.")}<br className="portfolio-title-break" /> {u("Aplicativos com propósito.","Apps with purpose.")}</> : project.name}</h1>
          <p className="service-hero__intro">{isIndex ? u("Conheça os sites desenvolvidos para nossos clientes e o aplicativo iOS publicado na App Store. Cada projeto tem seu contexto, sua identidade e uma experiência pensada para quem usa.","Explore the websites developed for our clients and the iOS app published on the App Store. Each project has its own context, identity and an experience designed for its users.") : project.intro}</p>
          {project && <ul className="project-tags" aria-label={u("Entregas do projeto","Project deliverables")}>{project.tags.map(tag=><li key={tag}>{tag}</li>)}</ul>}
          <div className="hero-actions service-hero__actions">
            {isIndex ? <><a className="button button--primary" href="#projects">{u("Conhecer os projetos de clientes","Explore client projects")}<ArrowRightIcon size={20} aria-hidden="true" /></a><a className="portfolio-own-link" href="#ios-apps">{u("Aplicativos iOS ↓","iOS apps ↓")}</a></> : <><a className="button button--primary" href={project.url} target="_blank" rel="noopener noreferrer">{u("Visitar o site","Visit website (Portuguese)")}<span aria-hidden="true">↗</span></a><a className="text-link" href="#delivery">{u("Ver o que entregamos","Explore the deliverables")}<ArrowRightIcon size={20} aria-hidden="true" /></a></>}
          </div>
        </div>
      </section>
      {isIndex ? <><ClientProjects locale={locale} showPortfolioLink={false} /><OwnProjects locale={locale}><BackToTop label={t.backToTopLabel} /></OwnProjects><InstagramContents locale={locale} /></> : <>
        <ProjectScreens project={project} locale={locale} />
        <section id="delivery" className="service-section case-delivery" aria-labelledby="delivery-title">
          <div className="section-shell">
            <div className="case-delivery__intro"><div><p className="eyebrow">{u("O projeto","The project")}</p><h2 id="delivery-title">{u("Apresentação e contato,","Presentation and contact,")}<br />{u("no contexto da marca.","in the brand’s context.")}</h2></div><div><h3>{u("Objetivo do site","Website objective")}</h3><p>{project.objective}</p></div></div>
            <div className="service-feature-grid">{project.delivery.map((item,index)=><article key={item.title}><span className="service-feature__number" aria-hidden="true">0{index+1}</span><h3>{item.title}</h3><p>{item.text}</p></article>)}</div>
          </div><BackToTop label={t.backToTopLabel} />
        </section>
        <nav className="section-shell case-next" aria-label={u("Outros projetos","Other projects")}><a className="text-link" href={pages.portfolio.path}><ArrowLeftIcon size={20} aria-hidden="true" />{u("Todos os projetos","All projects")}</a><a className="text-link" href={next.path}>{next.name}<ArrowRightIcon size={20} aria-hidden="true" /></a></nav>
      </>}
      <PortfolioContact t={t} locale={locale} />
    </main><Footer t={t} locale={locale} />
  </div>;
}

function PrivacyContact({ locale, page }) {
  const legal = LEGAL_CONTENT[locale];
  const subject = locale === "pt" ? "Exclusão de dados — TETELESTAI Atendimento" : "Data deletion — TETELESTAI Atendimento";
  const emailHref = `mailto:${PRIVACY_CONTACT.email}${page === "deletion" ? `?subject=${encodeURIComponent(subject)}` : ""}`;
  return (
    <section className="legal-contact" aria-labelledby="legal-contact-title">
      <h2 id="legal-contact-title">{page === "terms" ? (locale === "pt" ? "Fale com a Tetelestai" : "Get in touch with Tetelestai") : legal.contactTitle}</h2>
      <p>{legal.contactText}</p>
      <div className="legal-contact__links">
        <a href={PRIVACY_CONTACT.whatsapp} target="_blank" rel="noopener noreferrer">WhatsApp: {PRIVACY_CONTACT.phone}</a>
        <a href={emailHref}>{PRIVACY_CONTACT.email}</a>
      </div>
    </section>
  );
}

function LegalPage({ t, locale, page }) {
  const homePath = locale === "en" ? "/en/" : "/";
  const legal = LEGAL_CONTENT[locale];
  const document = legal[page];
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">{t.skip}</a>
      <Header t={t} locale={locale} page={page} />
      <main id="main-content" className="legal-page">
        <article className="section-shell legal-page__inner">
          <p className="eyebrow">{legal.navigation}</p>
          <h1>{document.title}</h1>
          <p className="legal-page__updated"><time dateTime={document.updatedDate ?? "2026-09-11"}>{document.updated ?? legal.updated}</time></p>
          <p className="legal-page__intro">{document.intro}</p>
          {document.contactFirst && <PrivacyContact locale={locale} page={page} />}
          {document.sections.map((section, index) => (
            <section className="legal-section" aria-labelledby={`legal-section-${index}`} key={section.title}>
              <h2 id={`legal-section-${index}`}>{section.title}</h2>
              {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
              {section.link && <a className="text-link" href={section.link.href}>{section.link.label}<ArrowRightIcon size={19} aria-hidden="true" /></a>}
            </section>
          ))}
          {!document.contactFirst && <PrivacyContact locale={locale} page={page} />}
          <a className="text-link" href={homePath}><ArrowLeftIcon size={20} aria-hidden="true" />{legal.back}</a>
        </article>
      </main>
      <Footer t={t} locale={locale} />
    </div>
  );
}

function DeRolePage({ page }) {
  const document = DE_ROLE_PAGES[page];
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">Ir para o conteúdo</a>
      <header className="site-header recarga-header">
        <div className="site-header__inner">
          <a className="brand-link" href="/" aria-label="Site da Tetelestai"><Brand compact /></a>
          <a className="text-link" href="/"><ArrowLeftIcon size={20} aria-hidden="true" />Site da Tetelestai</a>
        </div>
      </header>
      <main id="main-content" className="legal-page">
        <article className="section-shell legal-page__inner">
          <p className="eyebrow">De Rolê</p>
          <h1>{document.title}</h1>
          <p className="legal-page__updated"><time dateTime="2026-10-09">Atualizado em {DE_ROLE_UPDATED}</time></p>
          <p className="legal-page__intro">{document.intro}</p>
          <section className="legal-contact" aria-labelledby="de-role-contact-title">
            <h2 id="de-role-contact-title">Fale com a Tetelestai</h2>
            <a className="text-link" href={`mailto:${PRIVACY_CONTACT.email}`}>{PRIVACY_CONTACT.email}</a>
          </section>
          {document.sections.map((section, index) => (
            <section className="legal-section" aria-labelledby={`de-role-section-${index}`} key={section.title}>
              <h2 id={`de-role-section-${index}`}>{section.title}</h2>
              {section.paragraphs.map(paragraph => <p key={paragraph}>{paragraph}</p>)}
              {section.link && <a className="text-link" href={section.link.href}>{section.link.label}<ArrowRightIcon size={19} aria-hidden="true" /></a>}
            </section>
          ))}
          <a className="text-link" href="/"><ArrowLeftIcon size={20} aria-hidden="true" />Voltar ao site</a>
        </article>
      </main>
    </div>
  );
}

function RecargaPage({ page }) {
  const document = RECARGA_PAGES[page];
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">Ir para o conteúdo</a>
      <header className="site-header recarga-header">
        <div className="site-header__inner">
          <a className="brand-link" href="/" aria-label="Site da Tetelestai"><Brand compact /></a>
          <a className="text-link" href="/"><ArrowLeftIcon size={20} aria-hidden="true" />Site da Tetelestai</a>
        </div>
      </header>
      <main id="main-content" className="legal-page">
        <article className="section-shell legal-page__inner">
          <p className="eyebrow">Tetelestai Recarga</p>
          <h1>{document.title}</h1>
          <p className="legal-page__updated"><time dateTime="2026-09-14">Atualizado em {RECARGA_UPDATED}</time></p>
          <p className="legal-page__intro">{document.intro}</p>
          <nav className="recarga-navigation" aria-label="Informações do aplicativo">
            <a href="/recarga/">Calculadora</a>
            {Object.entries(RECARGA_PAGES).map(([key, value]) =>
              <a href={value.path} key={key} aria-current={page === key ? "page" : undefined}>{value.label}</a>,
            )}
          </nav>
          <section className="legal-contact" aria-labelledby="recarga-contact-title">
            <h2 id="recarga-contact-title">Contato com a Tetelestai</h2>
            <p>Para suporte, privacidade ou exclusão de mensagens de atendimento, use um destes canais:</p>
            <div className="legal-contact__links">
              <a className="text-link" href={PRIVACY_CONTACT.whatsapp}><WhatsappLogoIcon size={22} aria-hidden="true" />WhatsApp {PRIVACY_CONTACT.phone}</a>
              <a className="text-link" href={`mailto:${PRIVACY_CONTACT.email}`}>{PRIVACY_CONTACT.email}</a>
            </div>
          </section>
          {document.sections.map((section, index) => (
            <section className="legal-section" aria-labelledby={`recarga-section-${index}`} key={section.title}>
              <h2 id={`recarga-section-${index}`}>{section.title}</h2>
              {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
              {section.link && <a className="text-link" href={section.link.href}>{section.link.label}<ArrowRightIcon size={19} aria-hidden="true" /></a>}
            </section>
          ))}
          <a className="text-link" href="/"><ArrowLeftIcon size={20} aria-hidden="true" />Voltar ao site</a>
        </article>
      </main>
    </div>
  );
}

function HomePage({ t, locale }) {
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">{t.skip}</a>
      <Header t={t} locale={locale} page="home" />
      <main id="main-content">
        <section id="home" className="hero" aria-labelledby="hero-title">
          <div className="hero__inner">
            <picture className="optimized-image">
              <source type="image/webp" srcSet="/assets/tetelestai-symbol-320.webp 320w, /assets/tetelestai-symbol-640.webp 640w" sizes="(max-width: 620px) 188px, (max-width: 840px) 210px, (max-width: 1144px) 25vw, 286px" />
              <img className="hero__symbol" src="/assets/tetelestai-symbol.png" width="300" height="300" alt="" aria-hidden="true" />
            </picture>
            <h1 id="hero-title" className="hero__heading">
              <span className="hero__wordmark">TETELESTAI</span>
              <span className="hero__slogan">{t.slogan}</span>
            </h1>
            <p className="hero__offer">{t.heroOffer}</p>
            <div className="hero-actions">
              <a className="button button--primary" href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" onClick={() => getAnalytics().trackWhatsApp()}><WhatsappLogoIcon size={21} aria-hidden="true" />{t.whatsappLabel}</a>
            </div>
          </div>
        </section>

        <section id="solutions" className="service-index" aria-labelledby="solutions-title">
          <div className="section-shell service-index__heading">
            <p className="eyebrow">{t.solutionsKicker}</p>
            <h2 id="solutions-title">{t.solutionsTitle}</h2>
          </div>
          <div className="service-index__inner">
            {t.services.map((service, index) => {
              const Icon = service.Icon;
              const pages = Object.values(servicesFor(locale)).filter(item => item.homeSection === service.id);
              return (
                <article id={service.id} className="service-row" key={service.id}>
                  <span className="service-row__number" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                  <span className="service-row__icon"><Icon size={35} weight="light" aria-hidden="true" /></span>
                  <div className="service-row__copy"><h3>{service.title}</h3><p>{service.detail}</p></div>
                  <div className="service-row__actions">
                    {<nav className="service-links" aria-label={`${locale === "en" ? "Details for" : "Detalhes de"} ${service.title}`}>
                      {pages.map(item => <a className="text-link" key={item.path} href={item.path}>{item.label}<ArrowRightIcon size={19} aria-hidden="true" /></a>)}
                      {["solucoes-digitais","digital-solutions"].includes(service.id) && <a className="text-link service-project-link" href={portfolioFor(locale).portfolio.path}>{t.projectsLinkLabel}<ArrowRightIcon size={19} aria-hidden="true" /></a>}
                    </nav>}
                    <a className="service-contact-link" href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" onClick={() => getAnalytics().trackWhatsApp()}><WhatsappLogoIcon size={19} aria-hidden="true" />{t.serviceContactLabel}</a>
                  </div>
                </article>
              );
            })}
          </div>
          <BackToTop label={t.backToTopLabel} />
        </section>

        <ClientProjects locale={locale} digitalContext />

        <InstagramContents locale={locale} />

        <section className="intro-section" aria-labelledby="intro-title">
          <div className="section-shell intro-section__inner">
            <div className="intro-section__copy">
              <h2 id="intro-title">{t.introTitle[0]}<br />{t.introTitle[1]}</h2>
              <span className="short-rule" aria-hidden="true" />
              <p>{t.introText}</p>
            </div>
            <picture className="optimized-image">
              <source type="image/webp" srcSet="/assets/circuit-network.webp" />
              <img src="/assets/circuit-network.png" width="836" height="471" alt="" aria-hidden="true" />
            </picture>
          </div>
          <BackToTop label={t.backToTopLabel} />
        </section>

        <section id="method" className="method-section" aria-labelledby="method-title">
          <div className="section-shell method-section__grid">
            <div>
              <p className="eyebrow">{t.methodKicker}</p>
              <h2 id="method-title">{t.methodTitle}</h2>
              <p className="section-intro">{t.methodIntro}</p>
            </div>
            <ol className="method-list">
              {t.method.map((step) => (
                <li key={step.number}><span>{step.number}</span><div><h3>{step.title}</h3><p>{step.text}</p></div></li>
              ))}
            </ol>
          </div>
          <BackToTop label={t.backToTopLabel} />
        </section>

        <section id="about" className="about-section" aria-labelledby="about-title">
          <div className="section-shell">
            <p className="eyebrow">{t.aboutKicker}</p>
            <h2 id="about-title">{t.aboutTitle}</h2>
            <p className="section-intro">{t.aboutText}</p>
            <div className="people-grid">
              {t.people.map((person) => (
                <article className="person-card" key={person.name}>
                  <CheckCircleIcon size={31} weight="light" aria-hidden="true" />
                  <h3>{person.name}</h3>
                  <p className="person-card__role">{person.role}</p>
                  <p>{person.bio}</p>
                </article>
              ))}
            </div>
          </div>
          <BackToTop label={t.backToTopLabel} />
        </section>

        <section className="faq-section" aria-labelledby="faq-title">
          <div className="section-shell faq-section__grid">
            <div><p className="eyebrow">{t.faqKicker}</p><h2 id="faq-title">{t.faqTitle}</h2></div>
            <div className="faq-list">
              {t.faqs.map((faq) => (
                <details key={faq.q}><summary>{faq.q}</summary><p>{faq.a}</p></details>
              ))}
            </div>
          </div>
          <BackToTop label={t.backToTopLabel} />
        </section>

        <section id="contact" className="contact-section" aria-labelledby="contact-title">
          <div className="section-shell contact-section__inner">
            <div><p className="eyebrow">{t.contactKicker}</p><h2 id="contact-title">{t.contactTitle}</h2><p>{t.contactText}</p></div>
            <div className="contact-panel">
              <a className="button button--primary" href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" onClick={() => getAnalytics().trackWhatsApp()}><WhatsappLogoIcon size={22} aria-hidden="true" />{t.whatsappLabel}</a>
              <p>{t.safety}</p>
            </div>
          </div>
          <BackToTop label={t.backToTopLabel} />
        </section>
      </main>
      <Footer t={t} locale={locale} />
    </div>
  );
}

function NotFoundPage({ t, locale }) {
  const homePath = locale === "en" ? "/en/" : "/";
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">{t.skip}</a>
      <Header t={t} locale={locale} page="notFound" />
      <main id="main-content" className="legal-page">
        <div className="section-shell legal-page__inner">
          <p className="eyebrow">{t.notFound.kicker}</p>
          <h1>{t.notFound.title}</h1>
          <p className="legal-page__intro">{t.notFound.text}</p>
          <a className="text-link" href={homePath}><ArrowLeftIcon size={20} aria-hidden="true" />{t.notFound.back}</a>
        </div>
      </main>
      <Footer t={t} locale={locale} />
    </div>
  );
}

function updateMeta(selector, attribute, value) {
  const element = document.querySelector(selector);
  if (element) element.setAttribute(attribute, value);
}

export function App({ pathname = window.location.pathname }) {
  const route = resolveRoute(pathname);
  const { locale, page } = route;
  const t = content[locale];

  useEffect(() => {
    const service = servicesFor(locale)[page];
    const recarga = RECARGA_PAGES[page];
    const deRole = DE_ROLE_PAGES[page];
    const legal = deRole ?? recarga ?? (LEGAL_PATHS[page] ? LEGAL_CONTENT[locale][page] : null);
    const portfolioDoc = portfolioFor(locale)[page];
    const pageContent = service ?? portfolioDoc ?? legal;
    const isNotFound = page === "notFound";
    const title = pageContent ? pageContent.metaTitle : isNotFound ? t.notFound.metaTitle : t.title;
    const description = pageContent ? pageContent.metaDescription : isNotFound ? t.notFound.text : t.description;
    const languagePaths = LEGAL_PATHS[page] ?? equivalentPaths(page);
    const canonicalPath = service?.path ?? portfolioDoc?.path ?? deRole?.path ?? recarga?.path ?? languagePaths[locale];
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
    updateMeta('link[hreflang="pt-BR"]', "href", `https://tetelestai.tech${languagePaths.pt}`);
    updateMeta('link[hreflang="en"]', "href", `https://tetelestai.tech${languagePaths.en}`);
    updateMeta('link[hreflang="x-default"]', "href", `https://tetelestai.tech${languagePaths.pt}`);
    if (deRole || recarga) {
      document.querySelectorAll('link[rel="alternate"][hreflang]').forEach((link) => link.remove());
      document.querySelector('meta[property="og:locale:alternate"]')?.remove();
    }
  }, [locale, page, t]);

  if (DE_ROLE_PAGES[page]) return <DeRolePage page={page} />;
  if (RECARGA_PAGES[page]) return <RecargaPage page={page} />;
  const pageView = PORTFOLIO_PAGES[page] ? <PortfolioPage t={t} page={page} locale={locale} /> : SERVICE_PAGES[page] ? <ServicePage t={t} page={page} locale={locale} /> :
    LEGAL_PATHS[page] ? <LegalPage t={t} locale={locale} page={page} /> :
    page === "notFound" ? <NotFoundPage t={t} locale={locale} /> : <HomePage t={t} locale={locale} />;
  const service = servicesFor(locale)[page] ?? portfolioFor(locale)[page];
  const structuredData = pageStructuredData({
    page, locale, title: service?.metaTitle ?? t.title, description: service?.metaDescription ?? t.description,
  });
  return <>{structuredData && <script type="application/ld+json" id="structured-data" dangerouslySetInnerHTML={{ __html: serializeStructuredData(structuredData) }} />}{pageView}<AnalyticsConsent locale={locale} pathname={pathname} /></>;
}
