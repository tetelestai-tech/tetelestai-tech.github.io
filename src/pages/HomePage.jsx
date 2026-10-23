import { HOME, HOW_STEPS, LANDING_RECEIPT, PEOPLE, UI } from "../home-content.mjs";
import { portfolioFor, servicesFor } from "../localized-content.mjs";
import { CLIENT_PROJECTS } from "../portfolio-content.mjs";
import { PageShell, pathFor } from "../Layout.jsx";
import { Browser, Circuits, CtaFinal, DevicePair, FaqSection, LinkArrow, Receipt, SectionHead, Steps, WhatsAppLink } from "../ui.jsx";

export function CaseCard({ project, locale, heading: Heading = "h3" }) {
  const t = UI[locale];
  return (
    <article className="case" data-reveal="">
      <a className="case__media" href={project.path} tabIndex={-1} aria-hidden="true">
        <Browser src={project.desktop} alt="" host={project.domain} className="browser case__shot" />
      </a>
      <div className="stack stack--sm">
        <p className="case__meta">{project.category}</p>
        <Heading className="h3 case__title"><a href={project.path}>{project.name}</a></Heading>
        <p className="muted">{project.summary}</p>
      </div>
      <div className="btn-row">
        <LinkArrow href={project.path} className="link link--arrow link--teal">{t.seeCase}</LinkArrow>
        <LinkArrow href={project.url} icon="out" external>{t.visitSite}</LinkArrow>
      </div>
    </article>
  );
}

export function PeopleGrid({ locale }) {
  return (
    <div className="grid grid--2">
      {PEOPLE[locale].map(person => (
        <div className="person" data-reveal="" key={person.name}>
          <div className="person__photo" aria-hidden="true">{person.initials}</div>
          <div className="stack stack--sm"><h3 className="h3">{person.name}</h3><p className="case__meta">{person.role}</p><p className="muted">{person.bio}</p></div>
        </div>
      ))}
    </div>
  );
}

export function HomePage({ locale }) {
  const t = UI[locale];
  const home = HOME[locale];
  const projects = portfolioFor(locale);
  const cases = CLIENT_PROJECTS.map(item => projects[item.key]);
  const services = servicesFor(locale);
  return (
    <PageShell locale={locale} page="home">
      <section id="home" className="hero dark" aria-labelledby="hero-title">
        <Circuits />
        <div className="wrap hero__in">
          <div className="hero__text">
            <p className="eyebrow load" style={{ "--d": 0 }}>{home.hero.eyebrow}</p>
            <h1 className="h1 load" style={{ "--d": 1 }} id="hero-title">{home.hero.title}</h1>
            <p className="lead load" style={{ "--d": 2 }}>{home.hero.lead}</p>
            <div className="btn-row load" style={{ "--d": 3 }}>
              <WhatsAppLink message={t.waDefault}>{t.ctaWhatsApp}</WhatsAppLink>
              <LinkArrow href="#projects" icon="down">{home.hero.secondary}</LinkArrow>
            </div>
            <div className="btn-row load" style={{ "--d": 4 }}><span className="chip chip--price">{home.hero.price}</span><span className="byline">{home.hero.byline}</span></div>
          </div>
          <div className="hero__media"><DevicePair project={cases[0]} eager load className={null} /></div>
        </div>
      </section>

      <div className="proof">
        <div className="wrap proof__in">
          <span className="eyebrow">{home.proof.label}</span>
          {cases.map(item => <LinkArrow href={item.url} icon="out" external key={item.key}>{item.domain}</LinkArrow>)}
          <a className="link" href={`${projects.portfolio.path}#apps`}>{home.proof.apps}</a>
        </div>
      </div>

      <section className="section light" id="projects" aria-labelledby="projects-title">
        <div className="wrap">
          <SectionHead eyebrow={home.projects.eyebrow} title={home.projects.title} aside={home.projects.aside} id="projects-title" />
          <div className="grid grid--2">{cases.map(item => <CaseCard project={item} locale={locale} key={item.key} />)}</div>
          <p className="more" data-reveal=""><LinkArrow href={projects.portfolio.path} className="link link--arrow link--teal">{home.projects.more}</LinkArrow></p>
        </div>
      </section>

      <section className="section dark" id="price" aria-labelledby="price-title">
        <div className="wrap split">
          <div className="stack" data-reveal="">
            <p className="eyebrow">{home.price.eyebrow}</p>
            <h2 className="h2" id="price-title">{home.price.title}</h2>
            <p className="lead">{home.price.lead}</p>
            <p className="muted">{home.price.other} <LinkArrow href={services.sites.path}>{home.price.otherLink}</LinkArrow></p>
          </div>
          <Receipt data={LANDING_RECEIPT[locale]} message={home.price.waMessage} />
        </div>
      </section>

      <section className="section light" aria-labelledby="how-title">
        <div className="wrap">
          <SectionHead eyebrow={home.how.eyebrow} title={home.how.title} id="how-title" />
          <Steps items={HOW_STEPS[locale]} />
        </div>
      </section>

      <section className="section light section--flush" id="about" aria-labelledby="about-title">
        <div className="wrap">
          <hr className="divider" />
          <SectionHead eyebrow={home.who.eyebrow} title={home.who.title} id="about-title" />
          <PeopleGrid locale={locale} />
        </div>
      </section>

      <section className="section section--tight dark-2" id="solutions" aria-labelledby="solutions-title">
        <div className="wrap">
          <SectionHead eyebrow={home.fronts.eyebrow} title={home.fronts.title} aside={home.fronts.aside} id="solutions-title" />
          <div className="grid grid--3">
            {home.fronts.items.map(front => (
              <article className="card card--glass" id={front.id} data-reveal="" key={front.id}>
                <h3 className="h3">{front.title}</h3>
                <p>{front.text}</p>
                <div className="card__links">
                  {front.links.map(key => <LinkArrow href={pathFor(key, locale)} className="link link--arrow link--white" key={key}>{services[key]?.label ?? t.appsLabel}</LinkArrow>)}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <FaqSection eyebrow={home.faqTitle.eyebrow} title={home.faqTitle.title} items={home.faqs} />

      <CtaFinal title={home.final.title} text={home.final.text} note={t.safety}>
        <WhatsAppLink message={t.waDefault}>{t.ctaWhatsApp}</WhatsAppLink>
      </CtaFinal>
    </PageShell>
  );
}
