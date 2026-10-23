import { DE_ROLE_PAGES, DE_ROLE_UPDATED } from "../de-role-content.mjs";
import { UI } from "../home-content.mjs";
import { LEGAL_CONTENT, PRIVACY_CONTACT } from "../legal-content.mjs";
import { RECARGA_PAGES, RECARGA_UPDATED } from "../recarga-content.mjs";
import { PageShell, SupportHeader, pathFor } from "../Layout.jsx";
import { IconWhatsApp, LinkArrow } from "../ui.jsx";

// Legal and support texts are rendered verbatim from their content modules.
function DocHero({ eyebrow, title, updated, dateTime, intro }) {
  return (
    <section className="doc-hero dark">
      <div className="wrap doc-hero__in">
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        {updated && <p className="doc-updated"><time dateTime={dateTime}>{updated}</time></p>}
        {intro && <p className="lead">{intro}</p>}
      </div>
    </section>
  );
}

function DocSections({ sections, prefix }) {
  return sections.map((section, index) => (
    <section className="legal-section" aria-labelledby={`${prefix}-section-${index}`} key={section.title}>
      <h2 id={`${prefix}-section-${index}`}>{section.title}</h2>
      {section.paragraphs.map(paragraph => <p key={paragraph}>{paragraph}</p>)}
      {section.link && <LinkArrow href={section.link.href} className="link link--arrow link--teal">{section.link.label}</LinkArrow>}
    </section>
  ));
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
        <a className="link link--arrow link--teal" href={PRIVACY_CONTACT.whatsapp} target="_blank" rel="noopener noreferrer">WhatsApp: {PRIVACY_CONTACT.phone}</a>
        <a className="link link--arrow link--teal" href={emailHref}>{PRIVACY_CONTACT.email}</a>
      </div>
    </section>
  );
}

export function LegalPage({ locale, page }) {
  const legal = LEGAL_CONTENT[locale];
  const document = legal[page];
  return (
    <PageShell locale={locale} page={page} sticky={null}>
      <DocHero eyebrow={legal.navigation} title={document.title} updated={document.updated ?? legal.updated} dateTime={document.updatedDate ?? "2026-09-11"} intro={document.intro} />
      <div className="doc light">
        <article className="wrap doc__in">
          {document.contactFirst && <PrivacyContact locale={locale} page={page} />}
          <DocSections sections={document.sections} prefix="legal" />
          {!document.contactFirst && <PrivacyContact locale={locale} page={page} />}
          <LinkArrow href={pathFor("home", locale)} icon="back" className="link link--arrow link--teal">{legal.back}</LinkArrow>
        </article>
      </div>
    </PageShell>
  );
}

function SupportShell({ children }) {
  return (
    <div className="site-shell">
      <a className="skip-link" href="#main-content">Ir para o conteúdo</a>
      <SupportHeader />
      <main id="main-content">{children}</main>
    </div>
  );
}

export function DeRolePage({ page }) {
  const document = DE_ROLE_PAGES[page];
  return (
    <SupportShell>
      <DocHero eyebrow="De Rolê" title={document.title} updated={`Atualizado em ${DE_ROLE_UPDATED}`} dateTime="2026-10-09" intro={document.intro} />
      <div className="doc light">
        <article className="wrap doc__in">
          <section className="legal-contact" aria-labelledby="de-role-contact-title">
            <h2 id="de-role-contact-title">Fale com a Tetelestai</h2>
            <div className="legal-contact__links"><a className="link link--arrow link--teal" href={`mailto:${PRIVACY_CONTACT.email}`}>{PRIVACY_CONTACT.email}</a></div>
          </section>
          <DocSections sections={document.sections} prefix="de-role" />
          <LinkArrow href="/" icon="back" className="link link--arrow link--teal">Voltar ao site</LinkArrow>
        </article>
      </div>
    </SupportShell>
  );
}

export function RecargaPage({ page }) {
  const document = RECARGA_PAGES[page];
  return (
    <SupportShell>
      <DocHero eyebrow="Tetelestai Recarga" title={document.title} updated={`Atualizado em ${RECARGA_UPDATED}`} dateTime="2026-09-14" intro={document.intro} />
      <div className="doc light">
        <article className="wrap doc__in">
          <nav className="doc-nav" aria-label="Informações do aplicativo">
            <a href="/recarga/">Calculadora</a>
            {Object.entries(RECARGA_PAGES).map(([key, value]) => <a href={value.path} key={key} aria-current={page === key ? "page" : undefined}>{value.label}</a>)}
          </nav>
          <section className="legal-contact" aria-labelledby="recarga-contact-title">
            <h2 id="recarga-contact-title">Contato com a Tetelestai</h2>
            <p>Para suporte, privacidade ou exclusão de mensagens de atendimento, use um destes canais:</p>
            <div className="legal-contact__links">
              <a className="link link--arrow link--teal" href={PRIVACY_CONTACT.whatsapp}><IconWhatsApp />WhatsApp {PRIVACY_CONTACT.phone}</a>
              <a className="link link--arrow link--teal" href={`mailto:${PRIVACY_CONTACT.email}`}>{PRIVACY_CONTACT.email}</a>
            </div>
          </section>
          <DocSections sections={document.sections} prefix="recarga" />
          <LinkArrow href="/" icon="back" className="link link--arrow link--teal">Voltar ao site</LinkArrow>
        </article>
      </div>
    </SupportShell>
  );
}

export function NotFoundPage({ locale }) {
  const t = UI[locale].notFound;
  return (
    <PageShell locale={locale} page="notFound" sticky={null}>
      <section className="doc-hero dark not-found">
        <div className="wrap doc-hero__in">
          <p className="eyebrow">{t.kicker}</p>
          <h1>{t.title}</h1>
          <p className="lead">{t.text}</p>
          <LinkArrow href={pathFor("home", locale)} icon="back" className="link link--arrow link--white">{t.back}</LinkArrow>
        </div>
      </section>
    </PageShell>
  );
}
