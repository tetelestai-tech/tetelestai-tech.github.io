import { ArrowUpRightIcon } from '@phosphor-icons/react/dist/csr/ArrowUpRight';
import { InstagramLogoIcon } from '@phosphor-icons/react/dist/csr/InstagramLogo';

// User-selected links. Audio credits read from Instagram on 2026-10-15.
// Only the third cover is a supplied/authorized Instagram image.
export const INSTAGRAM_CONTENTS = [
  {
    id: 'DecE4Orp25n',
    url: 'https://www.instagram.com/ia.napratica.videos/reel/DecE4Orp25n/',
    title: 'Humor no cotidiano', titleEn: 'Everyday humor',
    description: 'Uma cena de casal em um remix de humor publicado no Instagram.',
    descriptionEn: 'A couple’s everyday moment in a humor remix on Instagram.',
    credit: 'jose_e_mariaa3', audio: 'https://www.instagram.com/reels/audio/28323907633957968/',
    coverClass: 'reel-cover--everyday', coverLines: ['Humor no', 'cotidiano.'], coverLinesEn: ['Everyday', 'humor.'],
  },
  {
    id: 'Dec2uGYp463',
    url: 'https://www.instagram.com/ia.napratica.videos/reel/Dec2uGYp463/',
    title: 'Humor com Sebastian', titleEn: 'Humor with Sebastian',
    description: 'Um remix com Sebastian, selecionado para o perfil IA na Prática.',
    descriptionEn: 'A remix with Sebastian, selected for the IA na Prática profile.',
    credit: 'soueusebastian', audio: 'https://www.instagram.com/reels/audio/28683150714639888/',
    coverClass: 'reel-cover--sebastian', coverLines: ['Humor com', 'Sebastian.'], coverLinesEn: ['Humor with', 'Sebastian.'],
  },
  {
    id: 'DeeuzhYJ-_i',
    url: 'https://www.instagram.com/ia.napratica.videos/reel/DeeuzhYJ-_i/',
    title: 'Sua empresa no digital', titleEn: 'Your business online',
    description: 'Sites, aplicativos e automações apresentados em um vídeo autoral da TETELESTAI.',
    descriptionEn: 'Websites, apps and automation presented in an original TETELESTAI video.',
    image: '/assets/instagram/sua-empresa-no-digital.webp',
  },
];

export function InstagramContents({ locale = 'pt' }) {
  const english = locale === 'en';
  return <section id="instagram" className="instagram-contents" aria-labelledby="instagram-title">
    <div className="section-shell">
      <div className="instagram-contents__heading">
        <div><p className="eyebrow">{english ? 'Beyond the projects' : 'Além dos projetos'}</p><h2 id="instagram-title">{english ? 'Content on Instagram' : 'Conteúdos no Instagram'}</h2></div>
        <p>{english ? 'Original videos and remixes from IA na Prática, shared in collaboration with TETELESTAI. Videos in Portuguese.' : 'Vídeos autorais e remixes do IA na Prática, publicados em colaboração com a TETELESTAI.'}</p>
      </div>
      <div className="reel-grid">
        {INSTAGRAM_CONTENTS.map((item, index) => <article className="reel-card" key={item.id} aria-labelledby={`reel-${item.id}`}>
          <a className={`reel-cover ${item.coverClass || 'reel-cover--original'}`} href={item.url} target="_blank" rel="noopener noreferrer" aria-label={`${english ? 'Watch on Instagram' : 'Assistir no Instagram'}: ${english ? item.titleEn : item.title}`}>
            {item.image ? <img src={item.image} width="941" height="1672" loading="lazy" decoding="async" alt={english ? 'Authorized original cover: Your business online, with a virtual presenter, TETELESTAI branding and the @tetelestai.tech profile.' : 'Capa autoral: Sua empresa no digital, com apresentador virtual, identidade TETELESTAI e perfil @tetelestai.tech.'} /> : <div className="reel-cover__art" aria-hidden="true">
              <div className="reel-cover__brand"><img src="/assets/tetelestai-symbol-144.webp" width="44" height="44" alt="" /><span>TETELESTAI</span></div>
              <span className="reel-cover__index">{String(index + 1).padStart(2, '0')} / IA NA PRÁTICA</span>
              <div className="reel-cover__title">{(english ? item.coverLinesEn : item.coverLines).map(line => <span key={line}>{line}</span>)}</div>
              <div className="reel-cover__footer"><span>{english ? 'REMIX ON INSTAGRAM' : 'REMIX NO INSTAGRAM'}</span><InstagramLogoIcon size={26} weight="light" /></div>
            </div>}
            <span className="reel-cover__open" aria-hidden="true"><ArrowUpRightIcon size={20} /></span>
          </a>
          <div className="reel-card__body">
            <p className="reel-card__kind">{item.image ? (english ? 'Original · AI content' : 'Autoral · Conteúdo de IA') : (english ? 'Remix on Instagram' : 'Remix no Instagram')}</p>
            <h3 id={`reel-${item.id}`}>{english ? item.titleEn : item.title}</h3>
            <p className="reel-card__description">{english ? item.descriptionEn : item.description}</p>
            <p className="reel-card__credit">{item.credit ? <>{english ? 'Original audio: ' : 'Áudio original: '}<a href={item.audio} target="_blank" rel="noopener noreferrer" aria-label={`${english ? 'Original audio credited to' : 'Áudio original creditado a'} @${item.credit}`}>@{item.credit}</a></> : <>{english ? 'Produced by TETELESTAI · ' : 'Produção TETELESTAI · '}<a href="https://www.instagram.com/ia.napratica.videos/" target="_blank" rel="noopener noreferrer">@ia.napratica.videos</a></>}</p>
            <a className="text-link reel-card__watch" href={item.url} target="_blank" rel="noopener noreferrer">{english ? 'Watch on Instagram' : 'Assistir no Instagram'}<ArrowUpRightIcon size={20} aria-hidden="true" /></a>
          </div>
        </article>)}
      </div>
      <div className="instagram-contents__more"><p>{english ? 'Remix audio credits follow the profiles identified in each Instagram publication.' : 'Os créditos de áudio dos remixes seguem os perfis indicados em cada publicação no Instagram.'}</p><a className="text-link" href="https://www.instagram.com/ia.napratica.videos/" target="_blank" rel="noopener noreferrer">{english ? 'Visit IA na Prática' : 'Conhecer o IA na Prática'}<ArrowUpRightIcon size={20} aria-hidden="true" /></a></div>
    </div>
  </section>;
}
