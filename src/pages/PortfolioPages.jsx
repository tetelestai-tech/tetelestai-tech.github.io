import { getAnalytics } from "../analytics.mjs";
import { APP_STORE_LINKS, DE_ROLE_APP_STORE } from "../app-store-links.mjs";
import { UI } from "../home-content.mjs";
import { INSTAGRAM_CONTENTS } from "../instagram-content.mjs";
import { portfolioFor } from "../localized-content.mjs";
import { APPS, CASE_COPY, CLIENT_PROJECTS, nextClientKey } from "../portfolio-content.mjs";
import { PageShell, pathFor } from "../Layout.jsx";
import {
  Browser, Circuits, Crumbs, CtaFinal, DevicePair, Facts, IconOut, IconPlay, LinkArrow, SectionHead, WhatsAppLink,
} from "../ui.jsx";

const track = (placement, appId) => () => getAnalytics()?.trackAppStore(placement, appId);

function AppCard({ app, locale, storeHref, qrHref }) {
  const en = locale === "en";
  return (
    <article className="app" id={app.id === DE_ROLE_APP_STORE.id ? "app-de-role" : "app-recarga"} aria-labelledby={app.titleId} data-reveal="">
      <div className="stack">
        <div className="app__head">
          {app.icon && <img className="app__icon" src={app.icon} alt="" width="64" height="64" loading="lazy" decoding="async" />}
          <div><p className="case__meta">{app.category[locale]}</p><h3 className="h3" id={app.titleId}>{app.name}</h3></div>
        </div>
        <p className="muted">{app.text[locale]}</p>
        <div className="card card--glass"><ul>{app.features[locale].map(item => <li key={item}>{item}</li>)}</ul></div>
        <div className="btn-row">
          <a className="btn btn--glass" href={storeHref} target="_blank" rel="noopener noreferrer" onClick={track("button", app.id)}>{en ? "Download on the App Store" : "Baixar na App Store"}<IconOut /></a>
          <a className="qr" href={qrHref} target="_blank" rel="noopener noreferrer" onClick={track("qr_link", app.id)} aria-label={en ? `Open ${app.name} on the App Store` : `Abrir ${app.name} na App Store`}>
            <img src={app.qr} width="96" height="96" loading="lazy" decoding="async" alt={en ? `QR code to download ${app.name} from the App Store.` : `QR code para baixar ${app.name} na App Store.`} />
            <span>{en ? "Point your iPhone camera at the code" : "Aponte a câmera do iPhone para o código"}</span>
          </a>
        </div>
      </div>
      <div className="app__shots" tabIndex={0} role="region" aria-label={en ? `${app.name} screens` : `Telas do ${app.name}`}>
        {app.video && (
          <figure>
            <a className="app__video" href={app.video} type="video/mp4" target="_blank" rel="noopener noreferrer" onClick={() => getAnalytics()?.trackAppVideo("cover", app.id)} aria-label={en ? "Watch the De Rolê video in Portuguese, 20 seconds, in a new tab" : "Assistir ao vídeo do De Rolê, 20 segundos, em nova aba"}>
              <img src={app.poster} width="1080" height="1920" loading="lazy" decoding="async" alt={en ? "De Rolê video cover showing friends around a table and the Portuguese tagline Explain without saying the word." : "Capa do vídeo De Rolê: amigos reunidos à mesa com a chamada Explique sem dizer a palavra."} />
              <span className="app__play" aria-hidden="true"><IconPlay /></span>
            </a>
            <figcaption><a className="link" href={app.video} type="video/mp4" target="_blank" rel="noopener noreferrer" onClick={() => getAnalytics()?.trackAppVideo("text", app.id)}>{en ? "Watch the app video · 20 s" : "Assistir ao vídeo do app · 20 s"}</a></figcaption>
          </figure>
        )}
        {app.screens.map(screen => (
          <figure key={screen.src}>
            <img src={screen.src} width={screen.width} height={screen.height} loading="lazy" decoding="async" alt={screen[locale][1]} />
            <figcaption>{screen[locale][0]}</figcaption>
          </figure>
        ))}
      </div>
    </article>
  );
}

function InstagramSection({ locale, copy }) {
  const en = locale === "en";
  return (
    <section className="section light" id="instagram" aria-labelledby="instagram-title">
      <div className="wrap">
        <SectionHead eyebrow={copy.eyebrow} title={copy.title} aside={copy.aside} id="instagram-title" />
        <div className="reels" data-reveal-group="">
          {INSTAGRAM_CONTENTS.map(item => (
            <article className="reel" key={item.id} aria-labelledby={`reel-${item.id}`} data-reveal="">
              <a className="reel__cover" href={item.url} target="_blank" rel="noopener noreferrer" aria-label={`${en ? "Watch on Instagram" : "Assistir no Instagram"}: ${en ? item.titleEn : item.title}`}>
                {item.image
                  ? <img src={item.image} width="941" height="1672" loading="lazy" decoding="async" alt={en ? "Authorized original cover: Your business online, with a virtual presenter, TETELESTAI branding and the @tetelestai.tech profile." : "Capa autoral: Sua empresa no digital, com apresentador virtual, identidade TETELESTAI e perfil @tetelestai.tech."} />
                  : <span className="reel__art" aria-hidden="true">
                      <span className="brand__name">TETELESTAI</span>
                      <span className="reel__title">{(en ? item.coverLinesEn : item.coverLines).map(line => <span key={line}>{line}</span>)}</span>
                      <span className="reel__foot">{en ? "REMIX ON INSTAGRAM" : "REMIX NO INSTAGRAM"}</span>
                    </span>}
              </a>
              <p className="case__meta">{item.image ? (en ? "Original · AI content" : "Autoral · Conteúdo de IA") : (en ? "Remix on Instagram" : "Remix no Instagram")}</p>
              <h3 className="h3" id={`reel-${item.id}`}>{en ? item.titleEn : item.title}</h3>
              <p className="muted">{en ? item.descriptionEn : item.description}</p>
              <p className="reel__credit">{item.credit
                ? <>{en ? "Original audio: " : "Áudio original: "}<a href={item.audio} target="_blank" rel="noopener noreferrer">@{item.credit}</a></>
                : <>{en ? "Produced by TETELESTAI · " : "Produção TETELESTAI · "}<a href="https://www.instagram.com/ia.napratica.videos/" target="_blank" rel="noopener noreferrer">@ia.napratica.videos</a></>}</p>
            </article>
          ))}
        </div>
        <p className="more" data-reveal=""><LinkArrow href="https://www.instagram.com/ia.napratica.videos/" className="link link--arrow link--teal" icon="out" external>{copy.more}</LinkArrow></p>
      </div>
    </section>
  );
}

export function PortfolioIndex({ locale }) {
  const t = UI[locale];
  const pages = portfolioFor(locale);
  const page = pages.portfolio;
  const cases = CLIENT_PROJECTS.map(item => pages[item.key]);
  return (
    <PageShell locale={locale} page="portfolio">
      <section id="home" className="hero hero--page dark" aria-labelledby="portfolio-title">
        <Circuits />
        <div className="wrap hero__in">
          <div className="hero__text">
            <Crumbs label={t.breadcrumbLabel} items={[{ label: t.homeLabel, href: pathFor("home", locale) }, { label: page.label }]} />
            <p className="eyebrow">{page.eyebrow}</p>
            <h1 className="h1 h1--md" id="portfolio-title">{page.heading}</h1>
            <p className="lead">{page.intro}</p>
            <div className="btn-row">
              <a className="btn" href="#projects">{page.jumpSites}</a>
              <LinkArrow href="#apps" icon="down">{page.jumpApps}</LinkArrow>
            </div>
          </div>
        </div>
      </section>

      <section className="section light" id="projects" aria-labelledby="projects-title">
        <div className="wrap">
          <SectionHead eyebrow={page.sites.eyebrow} title={page.sites.title} id="projects-title" />
          {cases.map((item, index) => (
            <article className="split case-row" data-reveal="" key={item.key}>
              <a className="case__media" href={item.path} tabIndex={-1} aria-hidden="true">
                <Browser src={item.desktop} alt="" host={item.domain} className="browser case__shot" />
              </a>
              <div className="stack">
                <p className="case__meta">{String(index + 1).padStart(2, "0")} · {item.category}</p>
                <h3 className="h2 case__title"><a href={item.path}>{item.name}</a></h3>
                <p className="lead">{item.summary}</p>
                <div className="btn-row">
                  <LinkArrow href={item.path} className="link link--arrow link--teal">{t.seeCase}</LinkArrow>
                  <LinkArrow href={item.url} icon="out" external>{t.visitSite}</LinkArrow>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section dark" id="apps" aria-labelledby="ios-apps-title">
        <div className="wrap">
          <SectionHead eyebrow={page.apps.eyebrow} title={page.apps.title} aside={page.apps.aside} id="ios-apps-title" />
          <div className="stack">
            <AppCard app={APPS.recarga} locale={locale} storeHref={APP_STORE_LINKS.button} qrHref={APP_STORE_LINKS.qr} />
            <AppCard app={APPS.deRole} locale={locale} storeHref={DE_ROLE_APP_STORE.url} qrHref={DE_ROLE_APP_STORE.url} />
            <div className="card card--glass card--wide" data-reveal="">
              <div className="stack stack--sm"><p className="eyebrow">{page.appsCta.eyebrow}</p><h3 className="h2">{page.appsCta.title}</h3><p>{page.appsCta.text}</p></div>
              <WhatsAppLink message={page.appsCta.waMessage} className="btn btn--lg">{page.appsCta.cta}</WhatsAppLink>
            </div>
          </div>
        </div>
      </section>

      <InstagramSection locale={locale} copy={page.instagram} />

      <CtaFinal title={page.final.title} text={page.final.text} note={t.safety}>
        <WhatsAppLink message={t.waDefault}>{t.ctaWhatsApp}</WhatsAppLink>
      </CtaFinal>
    </PageShell>
  );
}

export function CasePage({ locale, page }) {
  const t = UI[locale];
  const copy = CASE_COPY[locale];
  const pages = portfolioFor(locale);
  const project = pages[page];
  const other = pages[nextClientKey(page)];
  const message = copy.waMessage(project.name);
  return (
    <PageShell locale={locale} page={page} sticky={<WhatsAppLink message={message}>{copy.cta}</WhatsAppLink>}>
      <section id="home" className="hero hero--page dark" aria-labelledby="portfolio-title">
        <Circuits />
        <div className="wrap hero__in">
          <div className="hero__text">
            <Crumbs label={t.breadcrumbLabel} items={[{ label: t.homeLabel, href: pathFor("home", locale) }, { label: pages.portfolio.label, href: pages.portfolio.path }, { label: project.name }]} />
            <p className="eyebrow">{project.eyebrow}</p>
            <h1 className="h1 h1--md" id="portfolio-title">{project.name}</h1>
            <p className="lead">{project.intro}</p>
            <div className="btn-row">
              <a className="btn btn--glass" href={project.url} target="_blank" rel="noopener noreferrer">{t.visitSite}<IconOut /></a>
              <WhatsAppLink message={message} className="btn">{copy.cta}</WhatsAppLink>
            </div>
          </div>
          <div className="hero__media"><DevicePair project={project} eager load className={null} /></div>
        </div>
        <div className="wrap hero__facts"><Facts items={project.facts} /></div>
      </section>

      <section className="section light" id="delivery" aria-labelledby="delivery-title">
        <div className="wrap">
          <SectionHead eyebrow={copy.decisions.eyebrow} title={copy.decisions.title} id="delivery-title" />
          <div className="grid grid--2" data-reveal-group="">
            {project.decisions.map(item => <div className="card" data-reveal="" key={item.title}><span className="card__k">{item.k}</span><h3 className="h3">{item.title}</h3><p>{item.text}</p></div>)}
          </div>
        </div>
      </section>

      <section className="section light section--flush" aria-labelledby="delivered-title">
        <div className="wrap split">
          <div className="stack" data-reveal="">
            <p className="eyebrow">{project.name}</p>
            <h2 className="h2" id="delivered-title">{copy.delivered}</h2>
            <div className="card"><ul>{project.delivered.map(item => <li key={item}>{item}</li>)}</ul></div>
            <LinkArrow href={pages.portfolio.path} icon="back" className="link link--arrow link--teal">{copy.all}</LinkArrow>
          </div>
          <a className="card card--link" href={other.path} data-reveal="">
            <span className="card__k">{copy.next}</span>
            <Browser src={other.desktop} alt="" host={other.domain} />
            <h3 className="h3">{other.name}</h3>
            <span className="link link--arrow link--teal">{t.seeCase}</span>
          </a>
        </div>
      </section>

      <CtaFinal title={copy.final.title} text={copy.final.text} note={t.safety}>
        <WhatsAppLink message={message}>{copy.cta}</WhatsAppLink>
      </CtaFinal>
    </PageShell>
  );
}
