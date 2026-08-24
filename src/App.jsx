import { useEffect, useState } from "react";
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
import { ShieldCheckIcon } from "@phosphor-icons/react/dist/csr/ShieldCheck";
import { WhatsappLogoIcon } from "@phosphor-icons/react/dist/csr/WhatsappLogo";
import { XIcon } from "@phosphor-icons/react/dist/csr/X";

const WHATSAPP_LINK = "https://wa.me/5561998821206";

const ROUTES = {
  "/": { locale: "pt", page: "home" },
  "/en": { locale: "en", page: "home" },
  "/privacidade": { locale: "pt", page: "privacy" },
  "/en/privacy": { locale: "en", page: "privacy" },
};

function normalizePathname(pathname) {
  if (pathname === "/") return pathname;
  return pathname.replace(/\/+$/, "");
}

function resolveRoute(pathname) {
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
    nav: { solutions: "Soluções", method: "Método", about: "Sobre", contact: "Contato" },
    slogan: "Tecnologia com propósito. Oportunidades sem fronteiras.",
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
          "Desenvolvimento de sites e landing pages com design visual sob medida, sistemas web, MVPs, aplicativos móveis e automações integradas ao WhatsApp. O escopo é definido conforme os objetivos e as prioridades de cada projeto.",
        cta: "Converse sobre uma solução",
        Icon: CpuIcon,
      },
      {
        id: "capacitacao-ia",
        title: "Capacitação em IA",
        summary: "Treinamentos práticos e aplicados para pessoas e empresas desenvolverem habilidades em IA.",
        detail:
          "Conteúdo e formato ajustados ao público, ao objetivo e ao nível de conhecimento dos participantes.",
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
        role: "Responsável técnico",
        bio: "Responsável pela direção técnica dos trabalhos de tecnologia e inteligência artificial.",
      },
      {
        name: "Gabriela Rosa",
        role: "Marketing e mídias sociais",
        bio: "Responsável pelo marketing e pelas mídias sociais da Tetelestai.",
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
    ],
    contactKicker: "Contato",
    contactTitle: "Vamos conversar sobre o seu objetivo?",
    contactText:
      "Informe qual das três soluções corresponde à sua necessidade e consulte escopo, disponibilidade e condições.",
    whatsappLabel: "Conversar pelo WhatsApp",
    safety:
      "No primeiro contato, não envie senhas, dados bancários, documentos de identidade, currículos completos ou outras informações sensíveis.",
    privacy: "Privacidade",
    privacyPath: "/privacidade/",
    footerNote: "Tecnologia com propósito. Oportunidades sem fronteiras.",
    footerVerse: "Está consumado!",
    footerVerseReference: "João 19:30",
    privacyPage: {
      kicker: "Privacidade",
      title: "Privacidade e proteção de dados",
      metaTitle: "Privacidade | Tetelestai",
      metaDescription: "Como o site Tetelestai trata dados pessoais e informações técnicas.",
      intro:
        "Nesta versão, o site é informativo: não possui formulário, não utiliza analytics e não instala cookies não essenciais.",
      items: [
        "Ao iniciar uma conversa pelo WhatsApp, o contato ocorre fora deste site e depende das informações que você decidir fornecer.",
        "Dados de contato e o conteúdo da conversa podem ser usados para responder à solicitação, preparar uma proposta e cumprir obrigações legais. Eles serão mantidos apenas pelo tempo necessário para essas finalidades.",
        "Este site é hospedado pelo GitHub Pages, serviço da GitHub, Inc. Quando o site é visitado, o GitHub registra e armazena o endereço IP do visitante para fins de segurança.",
        "Até a definição de um canal específico de privacidade, solicitações podem ser iniciadas pelo WhatsApp da Tetelestai.",
        "Não envie informações sensíveis antes de receber orientação sobre o canal adequado.",
      ],
      warning:
        "Este aviso deverá ser atualizado se forem adicionados formulário, agenda, analytics, novos cookies ou outros provedores.",
      back: "Voltar ao site",
    },
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
    nav: { solutions: "Solutions", method: "Method", about: "About", contact: "Contact" },
    slogan: "Technology with purpose. Opportunities without borders.",
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
          "Development of websites and landing pages with tailored visual design, web systems, MVPs, mobile apps and WhatsApp integrations. Scope is defined around each project’s goals and priorities.",
        cta: "Discuss a digital solution",
        Icon: CpuIcon,
      },
      {
        id: "practical-ai",
        title: "Practical AI training",
        summary: "Applied training for people and companies building practical AI capabilities.",
        detail: "Content and format adapted to the audience, objective and participants’ level of knowledge.",
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
        role: "Technical lead",
        bio: "Responsible for the technical direction of technology and artificial intelligence engagements.",
      },
      {
        name: "Gabriela Rosa",
        role: "Marketing and social media",
        bio: "Responsible for Tetelestai’s marketing and social media.",
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
    ],
    contactKicker: "Contact",
    contactTitle: "Let’s talk about your objective",
    contactText: "Tell us which of the three solutions fits your need and ask about scope, availability and conditions.",
    whatsappLabel: "Chat on WhatsApp",
    safety: "Do not send passwords, banking details, identity documents, full CVs or other sensitive information in the first contact.",
    privacy: "Privacy",
    privacyPath: "/en/privacy/",
    footerNote: "Technology with purpose. Opportunities without borders.",
    footerVerse: "It is finished!",
    footerVerseReference: "John 19:30",
    privacyPage: {
      kicker: "Privacy",
      title: "Privacy and data protection",
      metaTitle: "Privacy | Tetelestai",
      metaDescription: "How the Tetelestai website handles personal data and technical information.",
      intro: "This version of the website is informational: it has no form, uses no analytics and installs no non-essential cookies.",
      items: [
        "When you start a conversation through WhatsApp, contact takes place outside this website and depends on the information you choose to provide.",
        "Contact details and conversation content may be used to respond to your request, prepare a proposal and meet legal obligations. They will be kept only as long as necessary for those purposes.",
        "This website is hosted on GitHub Pages, a service provided by GitHub, Inc. When the site is visited, GitHub logs and stores the visitor's IP address for security purposes.",
        "Until a dedicated privacy channel is defined, requests may be initiated through Tetelestai’s WhatsApp contact.",
        "Do not send sensitive information before receiving instructions about the appropriate channel.",
      ],
      warning: "This notice must be updated if forms, scheduling, analytics, new cookies or other providers are added.",
      back: "Back to the site",
    },
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
      <img src="/assets/tetelestai-symbol.png" width="72" height="72" alt="" aria-hidden="true" />
      <span className="brand__copy">
        <span className="brand__name">TETELESTAI</span>
        {!compact && <span className="brand__legal">SOLUÇÕES EM TECNOLOGIA LTDA.</span>}
      </span>
    </span>
  );
}

function Header({ t, locale, page }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const homePath = locale === "en" ? "/en/" : "/";
  const languagePaths = page === "privacy"
    ? { pt: "/privacidade/", en: "/en/privacy/" }
    : { pt: "/", en: "/en/" };
  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="site-header">
      <div className="site-header__inner">
        <a className="brand-link" href={homePath} aria-label={t.homeLabel}><Brand /></a>
        <button
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
          <a href={`${homePath}#method`} onClick={closeMenu}>{t.nav.method}</a>
          <a href={`${homePath}#about`} onClick={closeMenu}>{t.nav.about}</a>
          <a href={`${homePath}#contact`} onClick={closeMenu}>{t.nav.contact}</a>
          <span className="locale-switch" aria-label={t.languageLabel}>
            <a href={languagePaths.pt} lang="pt-BR" aria-current={locale === "pt" ? "page" : undefined}>PT</a>
            <span aria-hidden="true">|</span>
            <a href={languagePaths.en} lang="en" aria-current={locale === "en" ? "page" : undefined}>EN</a>
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
          <span>Carlos Viegas — {locale === "en" ? "technical lead" : "responsável técnico"}</span>
          <span>Gabriela Rosa — {locale === "en" ? "marketing and social media" : "marketing e mídias sociais"}</span>
        </div>
        <p className="site-footer__verse">
          {t.footerVerse}
          <span className="site-footer__verse-reference">
            {"\u00A0"}
            {t.footerVerseReference}
          </span>
        </p>
        <a className="footer-link" href={t.privacyPath}>{t.privacy}</a>
      </div>
    </footer>
  );
}

function PrivacyPage({ t, locale }) {
  const homePath = locale === "en" ? "/en/" : "/";
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">{t.skip}</a>
      <Header t={t} locale={locale} page="privacy" />
      <main id="main-content" className="legal-page">
        <div className="section-shell legal-page__inner">
          <p className="eyebrow">{t.privacyPage.kicker}</p>
          <h1>{t.privacyPage.title}</h1>
          <p className="legal-page__intro">{t.privacyPage.intro}</p>
          <ul className="legal-list">
            {t.privacyPage.items.map((item) => (
              <li key={item}><ShieldCheckIcon size={24} aria-hidden="true" /><span>{item}</span></li>
            ))}
          </ul>
          <div className="legal-warning">{t.privacyPage.warning}</div>
          <a className="text-link" href={homePath}><ArrowLeftIcon size={20} aria-hidden="true" />{t.privacyPage.back}</a>
        </div>
      </main>
      <Footer t={t} locale={locale} />
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
            <img className="hero__symbol" src="/assets/tetelestai-symbol.png" width="300" height="300" alt="" aria-hidden="true" />
            <h1 id="hero-title" className="hero__heading">
              <span className="hero__wordmark">TETELESTAI</span>
              <span className="hero__slogan">{t.slogan}</span>
            </h1>
          </div>
        </section>

        <section id="solutions" className="service-index" aria-label={t.servicesLabel}>
          <div className="service-index__inner">
            {t.services.map((service, index) => {
              const Icon = service.Icon;
              return (
                <a className="service-row" href={`#${service.id}`} key={service.id}>
                  <span className="service-row__number">{String(index + 1).padStart(2, "0")}</span>
                  <span className="service-row__icon"><Icon size={43} weight="light" aria-hidden="true" /></span>
                  <span className="service-row__copy"><strong>{service.title}</strong><span>{service.summary}</span></span>
                  <ArrowRightIcon className="service-row__arrow" size={31} weight="light" aria-hidden="true" />
                </a>
              );
            })}
          </div>
        </section>

        <section className="intro-section" aria-labelledby="intro-title">
          <div className="section-shell intro-section__inner">
            <div className="intro-section__copy">
              <h2 id="intro-title">{t.introTitle[0]}<br />{t.introTitle[1]}</h2>
              <span className="short-rule" aria-hidden="true" />
              <p>{t.introText}</p>
            </div>
            <img src="/assets/circuit-network.png" width="836" height="471" alt="" aria-hidden="true" />
          </div>
          <BackToTop label={t.backToTopLabel} />
        </section>

        <section className="solutions-detail" aria-labelledby="solutions-title">
          <div className="section-shell">
            <p className="eyebrow">{t.solutionsKicker}</p>
            <h2 id="solutions-title">{t.solutionsTitle}</h2>
            <div className="solution-grid">
              {t.services.map((service, index) => {
                const Icon = service.Icon;
                return (
                  <article id={service.id} className="solution-card" key={service.id}>
                    <span className="solution-card__index">0{index + 1}</span>
                    <Icon size={38} weight="light" aria-hidden="true" />
                    <h3>{service.title}</h3>
                    <p>{service.detail}</p>
                    <a className="text-link" href="#contact">{service.cta}<ArrowRightIcon size={19} aria-hidden="true" /></a>
                  </article>
                );
              })}
            </div>
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
              <a className="button button--primary" href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer"><WhatsappLogoIcon size={22} aria-hidden="true" />{t.whatsappLabel}</a>
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

export function App() {
  const route = resolveRoute(window.location.pathname);
  const { locale, page } = route;
  const t = content[locale];

  useEffect(() => {
    const isPrivacy = page === "privacy";
    const isNotFound = page === "notFound";
    const title = isPrivacy ? t.privacyPage.metaTitle : isNotFound ? t.notFound.metaTitle : t.title;
    const description = isPrivacy ? t.privacyPage.metaDescription : isNotFound ? t.notFound.text : t.description;
    const canonicalPath = isPrivacy
      ? (locale === "en" ? "/en/privacy/" : "/privacidade/")
      : (locale === "en" ? "/en/" : "/");
    const canonicalUrl = `https://tetelestai.tech${canonicalPath}`;

    document.documentElement.lang = t.lang;
    document.title = title;
    updateMeta('meta[name="description"]', "content", description);
    updateMeta('meta[name="robots"]', "content", isPrivacy || isNotFound ? "noindex,nofollow" : "index,follow");
    updateMeta('meta[property="og:title"]', "content", title);
    updateMeta('meta[property="og:description"]', "content", description);
    updateMeta('meta[property="og:url"]', "content", canonicalUrl);
    updateMeta('link[rel="canonical"]', "href", canonicalUrl);
  }, [locale, page, t]);

  if (page === "privacy") return <PrivacyPage t={t} locale={locale} />;
  if (page === "notFound") return <NotFoundPage t={t} locale={locale} />;
  return <HomePage t={t} locale={locale} />;
}
