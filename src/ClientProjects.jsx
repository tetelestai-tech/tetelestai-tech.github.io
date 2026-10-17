import { ArrowRightIcon } from '@phosphor-icons/react/dist/csr/ArrowRight';
import { CLIENT_PROJECTS } from './portfolio-content.mjs';
import { portfolioFor } from './localized-content.mjs';

export function ClientProjects({ children, showPortfolioLink = true, locale = 'pt', digitalContext = false }) {
  const english = locale === 'en';
  const detailTitle = undefined;
  const projects = CLIENT_PROJECTS.map(p => ({...p,...portfolioFor(locale)[p.key]}));
  return (
    <section id="projects" className="client-projects" aria-labelledby="projects-title">
      <div className="section-shell">
        <div className="client-projects__heading">
          <div><p className="eyebrow">{digitalContext ? (english ? 'Digital solutions' : 'Soluções digitais') : (english ? 'In practice' : 'Na prática')}</p><h2 id="projects-title">{english ? 'Selected projects' : 'Projetos em destaque'}</h2></div>
          <p>{english ? 'Different identities.' : 'Identidades diferentes.'}{' '}<br />{english ? 'The same care with presentation.' : 'Um cuidado em comum com a apresentação.'}</p>
        </div>
        <div className="client-projects__grid">
          {projects.map((project,index) => (
            <article className="client-card" key={project.key} aria-labelledby={`${project.key}-title`}>
              <a className="client-card__media" href={project.path} title={detailTitle} aria-label={english ? `View the ${project.name} project` : `Conhecer o projeto ${project.name}`}>
                <div className="client-card__browser">
                  <div className="client-card__bar" aria-hidden="true"><span className="client-card__dots">● ● ●</span><span>{project.domain}</span><span>↗</span></div>
                  <img src={project.desktop} width="1265" height="889" loading="lazy" decoding="async" alt={english ? `${project.name} website on desktop` : `Site de ${project.name} no computador`} />
                </div>
                <div className="client-card__phone"><img src={project.mobile} width="375" height="812" loading="lazy" decoding="async" alt={english ? `${project.name} website on mobile` : `Site de ${project.name} no celular`} /></div>
              </a>
              <div className="client-card__body">
                <p className="client-card__category"><span>{String(index+1).padStart(2,'0')} / {english ? project.categoryEn : project.category}</span><span className="client-card__status">{english ? 'Live' : 'Publicado'}</span></p>
                <h3 id={`${project.key}-title`}><a href={project.path} title={detailTitle}>{project.name}</a></h3>
                <p className="client-card__summary">{english ? project.summaryEn : project.summary}</p>
                <ul className="project-tags" aria-label={english ? 'Project deliverables' : 'Entregas do projeto'}>{(english ? project.tagsEn : project.tags).map(tag=><li key={tag}>{tag}</li>)}</ul>
                <div className="client-card__links">
                  <a className="text-link" href={project.path} title={detailTitle}>{english ? 'View project' : 'Conhecer o projeto'}<ArrowRightIcon size={20} aria-hidden="true" /></a>
                  <a className="client-card__visit" href={project.url} target="_blank" rel="noopener noreferrer">{english ? 'Visit website (Portuguese)' : 'Visitar o site'}<span aria-hidden="true">↗</span></a>
                </div>
              </div>
            </article>
          ))}
        </div>
        {showPortfolioLink && <div className="client-projects__more"><a className="text-link" href={portfolioFor(locale).portfolio.path}>{english ? 'View full portfolio' : 'Ver portfólio completo'}<ArrowRightIcon size={21} aria-hidden="true" /></a><p>{english ? 'Explore our iOS apps as well.' : 'Conheça também nossos aplicativos iOS.'}</p></div>}
      </div>
      {children}
    </section>
  );
}

export function ProjectScreens({ project, locale = 'pt' }) {
  const english = locale === 'en';
  const u = (pt,en) => english ? en : pt;
  return (
    <section className="case-screens" aria-label={english ? `Screenshots of the ${project.name} website` : `Capturas do site ${project.name}`}>
      <div className="section-shell case-screens__grid">
        <figure className="case-screens__desktop">
          <a href={project.desktop} target="_blank" rel="noopener noreferrer" aria-label={english ? `Enlarge ${project.name} desktop screenshot` : `Ampliar captura de ${project.name} no computador`}><img src={project.desktop} width="1265" height="889" decoding="async" alt={english ? `${project.name} homepage on desktop, in Portuguese` : `Página inicial de ${project.name} no computador`} /></a>
          <figcaption>{u("Computador","Desktop · Original site in Portuguese")} <a href={project.desktop} target="_blank" rel="noopener noreferrer">{u("Ampliar captura ↗","Enlarge screenshot ↗")}</a></figcaption>
        </figure>
        <figure className="case-screens__mobile">
          <a href={project.mobile} target="_blank" rel="noopener noreferrer" aria-label={english ? `Enlarge ${project.name} mobile screenshot` : `Ampliar captura de ${project.name} no celular`}><img src={project.mobile} width="375" height="812" decoding="async" alt={english ? `${project.name} homepage on mobile, in Portuguese` : `Página inicial de ${project.name} no celular`} /></a>
          <figcaption>{u("Celular","Mobile · Original site in Portuguese")} <a href={project.mobile} target="_blank" rel="noopener noreferrer">{u("Ampliar captura ↗","Enlarge screenshot ↗")}</a></figcaption>
        </figure>
      </div>
    </section>
  );
}
