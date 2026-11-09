import { HOW_STEPS, LANDING_RECEIPT, UI } from "../home-content.mjs";
import { portfolioFor, servicesFor } from "../localized-content.mjs";
import { PageShell, pathFor } from "../Layout.jsx";
import {
  Browser, CardGrid, Circuits, Crumbs, CtaFinal, DevicePair, Facts, FaqSection, LinkArrow,
  Phone, Receipt, SectionHead, Steps, WhatsAppLink,
} from "../ui.jsx";

function ServiceHero({ locale, service, actions, media, headingClass = "h1 h1--md" }) {
  const t = UI[locale];
  return (
    <section id="home" className="hero hero--page dark" aria-labelledby="service-title">
      <Circuits />
      <div className="wrap hero__in">
        <div className="hero__text">
          <Crumbs label={t.breadcrumbLabel} items={[{ label: t.homeLabel, href: pathFor("home", locale) }, { label: service.label }]} />
          <p className="eyebrow">{service.eyebrow}</p>
          <h1 className={`${headingClass}`} id="service-title">{service.heading}</h1>
          <p className="lead">{service.intro}</p>
          {service.byline && <p className="byline">{service.byline}</p>}
          <div className="btn-row">{actions}</div>
        </div>
        {media}
      </div>
      <div className="wrap hero__facts"><Facts items={service.facts} /></div>
    </section>
  );
}

export function SitesPage({ locale }) {
  const t = UI[locale];
  const service = servicesFor(locale).sites;
  const project = portfolioFor(locale)[service.caseStudy.key];
  const [full, landing] = service.compare.options;
  return (
    <PageShell locale={locale} page="sites" whatsapp={{ message: service.waMessage }}>
      <ServiceHero locale={locale} service={service}
        actions={<><WhatsAppLink message={service.waMessage}>{service.ctaLabel}</WhatsAppLink><LinkArrow href={project.path}>{service.secondaryLabel}</LinkArrow></>}
        media={<div className="hero__media"><DevicePair project={project} eager load className={null} /></div>} />

      <section className="section light" aria-labelledby="compare-title">
        <div className="wrap">
          <SectionHead eyebrow={service.compare.eyebrow} title={service.compare.title} id="compare-title" />
          <div className="compare" data-reveal-group="">
            <div className="card card--feature" data-reveal="">
              <span className="badge">{full.badge}</span><h3 className="h3">{full.title}</h3>
              <ul>{full.items.map(item => <li key={item}>{item}</li>)}</ul>
              <p className="price">{full.price}</p>
              <div><WhatsAppLink message={service.waMessage} className="btn btn--dark">{full.cta}</WhatsAppLink></div>
            </div>
            <div className="card" data-reveal="">
              <span className="badge">{landing.badge}</span><h3 className="h3">{landing.title}</h3>
              <ul>{landing.items.map(item => <li key={item}>{item}</li>)}</ul>
              <p className="price">{landing.price}</p>
              <div><a className="btn btn--ghost" href={pathFor("landingPages", locale)}>{landing.cta}</a></div>
            </div>
          </div>
        </div>
      </section>

      <section className="section light section--flush" aria-labelledby="features-title">
        <div className="wrap">
          <hr className="divider" />
          <SectionHead eyebrow={service.features.eyebrow} title={service.features.title} id="features-title" />
          <CardGrid items={service.features.items} />
        </div>
      </section>

      <section className="section dark" id="projects" aria-labelledby="projects-title">
        <div className="wrap split">
          <div className="stack" data-reveal="">
            <p className="eyebrow">{service.caseStudy.eyebrow}</p>
            <h2 className="h2" id="projects-title">{service.caseStudy.title}</h2>
            <div className="card card--glass"><ul>{service.caseStudy.items.map(item => <li key={item}>{item}</li>)}</ul></div>
            <div className="btn-row">
              <LinkArrow href={project.path}>{t.seeCase}</LinkArrow>
              <LinkArrow href={project.url} icon="out" external>{t.visitSite}</LinkArrow>
            </div>
          </div>
          <div className="device-pair" data-reveal="zoom" data-shot-zone="">
            <Browser src={project.desktop} full={project.desktopFull} video={project.desktopVideo} videoWebm={project.desktopVideoWebm} alt={project.altDesktop} host={project.domain} />
            <Phone src={project.mobile} full={project.mobileFull} video={project.mobileVideo} videoWebm={project.mobileVideoWebm} alt={project.altMobile} />
          </div>
        </div>
      </section>

      <section className="section light" aria-labelledby="how-title">
        <div className="wrap">
          <SectionHead eyebrow={service.how.eyebrow} title={service.how.title} id="how-title" />
          <Steps items={HOW_STEPS[locale]} />
        </div>
      </section>

      <FaqSection eyebrow={service.faqTitle.eyebrow} title={service.faqTitle.title} items={service.faqs} />
      <CtaFinal title={service.final.title} text={service.final.text} note={t.safety}>
        <WhatsAppLink message={service.waMessage}>{service.ctaLabel}</WhatsAppLink>
      </CtaFinal>
    </PageShell>
  );
}

export function LandingPage({ locale }) {
  const t = UI[locale];
  const service = servicesFor(locale).landingPages;
  const project = portfolioFor(locale)[service.caseStudy.key];
  return (
    <PageShell locale={locale} page="landingPages" whatsapp={{ message: service.waMessage }}>
      <ServiceHero locale={locale} service={service}
        actions={<><WhatsAppLink message={service.waMessage}>{service.ctaLabel}</WhatsAppLink><LinkArrow href={project.path}>{service.secondaryLabel}</LinkArrow></>}
        media={<div className="hero__media hero__media--flat"><Receipt data={LANDING_RECEIPT[locale]} message={service.waMessage} /></div>} />

      <section className="section light" aria-labelledby="audience-title">
        <div className="wrap">
          <SectionHead eyebrow={service.audience.eyebrow} title={service.audience.title} id="audience-title" />
          <CardGrid items={service.audience.items} />
        </div>
      </section>

      <section className="section dark" aria-labelledby="anatomy-title">
        <div className="wrap">
          <SectionHead eyebrow={service.anatomy.eyebrow} title={service.anatomy.title} aside={service.anatomy.aside} id="anatomy-title" />
          <Steps items={service.anatomy.items} glass />
        </div>
      </section>

      <section className="section light" id="projects" aria-labelledby="projects-title">
        <div className="wrap split">
          <div className="device-pair" data-reveal="zoom" data-shot-zone="">
            <Browser src={project.desktop} full={project.desktopFull} video={project.desktopVideo} videoWebm={project.desktopVideoWebm} alt={project.altDesktop} host={project.domain} />
            <Phone src={project.mobile} full={project.mobileFull} video={project.mobileVideo} videoWebm={project.mobileVideoWebm} alt={project.altMobile} />
          </div>
          <div className="stack" data-reveal="">
            <p className="eyebrow">{service.caseStudy.eyebrow}</p>
            <h2 className="h2" id="projects-title">{service.caseStudy.title}</h2>
            <p className="lead">{service.caseStudy.text}</p>
            <div className="btn-row">
              <LinkArrow href={project.path} className="link link--arrow link--teal">{t.seeCase}</LinkArrow>
              <LinkArrow href={project.url} icon="out" external>{t.visitSite}</LinkArrow>
            </div>
          </div>
        </div>
      </section>

      <section className="section light section--flush" aria-labelledby="how-title">
        <div className="wrap">
          <hr className="divider" />
          <SectionHead eyebrow={service.how.eyebrow} title={service.how.title} id="how-title" />
          <Steps items={HOW_STEPS[locale]} />
        </div>
      </section>

      <FaqSection eyebrow={service.faqTitle.eyebrow} title={service.faqTitle.title} items={service.faqs} />
      <CtaFinal title={service.final.title} text={service.final.text} note={t.safety}>
        <WhatsAppLink message={service.waMessage}>{service.ctaLabel}</WhatsAppLink>
      </CtaFinal>
    </PageShell>
  );
}

export function AiPage({ locale }) {
  const t = UI[locale];
  const service = servicesFor(locale).aiTraining;
  return (
    <PageShell locale={locale} page="aiTraining" whatsapp={{ message: service.waMessage }}>
      <ServiceHero locale={locale} service={service}
        actions={<WhatsAppLink message={service.waMessage}>{service.ctaLabel}</WhatsAppLink>}
        media={<div className="hero__media hero__media--flat"><div className="card card--glass load-shot examples"><p className="eyebrow">{service.examples.title}</p><ul>{service.examples.items.map(item => <li key={item}>{item}</li>)}</ul></div></div>} />

      <section className="section light" aria-labelledby="define-title">
        <div className="wrap">
          <SectionHead eyebrow={service.define.eyebrow} title={service.define.title} id="define-title" />
          <CardGrid items={service.define.items} columns={2} />
        </div>
      </section>

      <section className="section light section--flush" aria-labelledby="how-title">
        <div className="wrap">
          <hr className="divider" />
          <SectionHead eyebrow={service.how.eyebrow} title={service.how.title} id="how-title" />
          <Steps items={service.how.steps} />
        </div>
      </section>

      <FaqSection eyebrow={service.faqTitle.eyebrow} title={service.faqTitle.title} items={service.faqs} />
      <CtaFinal title={service.final.title} text={service.final.text} note={t.safety}>
        <WhatsAppLink message={service.waMessage}>{service.ctaLabel}</WhatsAppLink>
      </CtaFinal>
    </PageShell>
  );
}
