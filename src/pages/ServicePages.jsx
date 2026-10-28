import { CHECKOUT_ACOMPANHADO, CHECKOUT_ESSENCIAL } from "../contact.mjs";
import { getAnalytics } from "../analytics.mjs";
import { HOW_STEPS, LANDING_RECEIPT, UI } from "../home-content.mjs";
import { portfolioFor, servicesFor } from "../localized-content.mjs";
import { PageShell, pathFor } from "../Layout.jsx";
import {
  Browser, CardGrid, Circuits, Crumbs, CtaFinal, DevicePair, Facts, FaqSection, IconCart, LinkArrow,
  Phone, Receipt, SectionHead, Steps, WhatsAppLink, placementOf,
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

// Kiwify checkout links; each click reports `checkout_click` with the product name.
function BuyLink({ children, className = "btn btn--lg", href = CHECKOUT_ESSENCIAL, product = "essencial" }) {
  return <a className={className} href={href} target="_blank" rel="noopener noreferrer" onClick={event => getAnalytics()?.trackCheckout(placementOf(event.currentTarget), product)}><IconCart />{children}</a>;
}

export function CareerPage({ locale }) {
  const service = servicesFor(locale).career;
  return (
    <PageShell locale={locale} page="career" sticky={<BuyLink>{service.buyShort}</BuyLink>}>
      <ServiceHero locale={locale} service={service} headingClass="h1 h1--sm"
        actions={<><BuyLink>{service.buyLabel}</BuyLink><LinkArrow href="#guide" icon="down">{service.secondaryLabel}</LinkArrow></>}
        media={<div className="hero__media hero__media--center"><div className="load-shot cover-wrap"><img className="cover" src="/assets/essencial/essencial-capa.webp" alt={service.coverAlt} width="640" height="935" fetchPriority="high" decoding="async" /></div></div>} />

      <section className="section light" id="guide" aria-labelledby="guide-title">
        <div className="wrap">
          <SectionHead eyebrow={service.build.eyebrow} title={service.build.title} id="guide-title" />
          <CardGrid items={service.build.items} />
        </div>
      </section>

      <section className="section dark" aria-labelledby="map-title">
        <div className="wrap split">
          <div className="stack" data-reveal="">
            <p className="eyebrow">{service.map.eyebrow}</p>
            <h2 className="h2" id="map-title">{service.map.title}</h2>
            <div className="card card--glass chapters">
              {service.map.chapters.map(([number, title, page]) => <div className="receipt__row" key={number}><span>{number}</span><span>{title}</span><i /><span className="muted">{page}</span></div>)}
            </div>
          </div>
          <div className="hero__media--center" data-reveal="zoom"><div className="cover-wrap"><img className="cover" src="/assets/essencial/essencial-mapa.webp" alt={service.mapAlt} width="640" height="935" loading="lazy" decoding="async" /></div></div>
        </div>
      </section>

      <section className="section light" aria-labelledby="author-title">
        <div className="wrap split">
          <div className="person" data-reveal="">
            <div className="person__photo" aria-hidden="true">CV</div>
            <div className="stack stack--sm">
              <p className="eyebrow">{service.author.eyebrow}</p>
              <h2 className="h2" id="author-title">{service.author.name}</h2>
              {service.author.paragraphs.map(text => <p className="muted" key={text.slice(0, 24)}>{text}</p>)}
            </div>
          </div>
          <div className="card" data-reveal="">
            <p className="eyebrow">{service.notIncluded.eyebrow}</p>
            <h3 className="h3">{service.notIncluded.title}</h3>
            <p>{service.notIncluded.text}</p>
          </div>
        </div>
      </section>

      <section className="section section--tight dark-2" id="acompanhado" aria-labelledby="coaching-title">
        <div className="wrap">
          <div className="card card--glass card--wide" data-reveal="">
            <div className="stack stack--sm"><p className="eyebrow">{service.coaching.eyebrow}</p><h2 className="h2" id="coaching-title">{service.coaching.title}</h2><p>{service.coaching.text}</p></div>
            <div className="btn-row">
              <BuyLink href={CHECKOUT_ACOMPANHADO} product="acompanhado">{service.coaching.cta}</BuyLink>
              <WhatsAppLink message={service.coaching.waMessage} className="link link--arrow" icon={false}>{service.coaching.question}</WhatsAppLink>
            </div>
          </div>
        </div>
      </section>

      <FaqSection eyebrow={service.faqTitle.eyebrow} title={service.faqTitle.title} items={service.faqs} />
      <CtaFinal title={service.final.title} text={service.final.text}>
        <BuyLink>{service.buyShort}</BuyLink>
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
