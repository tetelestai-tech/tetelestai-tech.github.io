import { useEffect, useRef, useState } from "react";
import { getAnalytics } from "../analytics.mjs";
import { UI } from "../home-content.mjs";
import { PageShell, pathFor } from "../Layout.jsx";
import {
  MENTORIA_CHECKOUT, MENTORIA_ENVIO, MENTORIA_FILTRO, MENTORIA_PAGE, MENTORIA_TURMA, MENTORIA_VIDEOS, MENTORIA_WHATSAPP,
  avaliarFiltro,
} from "../mentoria-content.mjs";
import { Circuits, Crumbs, Facts, IconDown, IconWhatsApp, LinkArrow, SectionHead, Steps, SymbolPicture, placementOf } from "../ui.jsx";

// Preview builds (Claude artifact) never write to the database.
const PREVIEW = import.meta.env?.VITE_MENTORIA_PREVIEW === "1";
const PASSED_KEY = "tetelestai:mentoria-filtro:v1";
const UTM_KEY = "tetelestai:mentoria-utm:v1";
const PASSED_DAYS = 30;
const UTM_PARAMS = ["utm_source", "utm_medium", "utm_campaign"];
const cleanUtm = value => (typeof value === "string" && /^[a-z0-9_.-]{1,60}$/i.test(value) ? value.toLowerCase() : null);

function readUtm() {
  try {
    const params = new URLSearchParams(window.location.search);
    const fromUrl = Object.fromEntries(UTM_PARAMS.map(name => [name, cleanUtm(params.get(name))]));
    if (Object.values(fromUrl).some(Boolean)) {
      window.sessionStorage.setItem(UTM_KEY, JSON.stringify(fromUrl));
      return fromUrl;
    }
    const stored = JSON.parse(window.sessionStorage.getItem(UTM_KEY) ?? "null");
    return stored ? Object.fromEntries(UTM_PARAMS.map(name => [name, cleanUtm(stored[name])])) : {};
  } catch { return {}; }
}

function rememberedPass() {
  try {
    const value = JSON.parse(window.localStorage.getItem(PASSED_KEY) ?? "null");
    return Boolean(value?.passou && Number.isFinite(value.em) && Date.now() - value.em < PASSED_DAYS * 864e5);
  } catch { return false; }
}

function rememberPass() {
  try { window.localStorage.setItem(PASSED_KEY, JSON.stringify({ passou: true, em: Date.now() })); } catch { /* the result still shows on this page */ }
}

// Sends the answers to the mentoria-filtro function, which stores them and, for people who pass,
// e-mails the private link to vídeo 2. A network failure never hides the result from the visitor.
async function enviar(answers, contact, utm, trap) {
  if (PREVIEW) return "preview";
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);
  try {
    const response = await fetch(MENTORIA_ENVIO.url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...contact, ...answers, aceite_lgpd: true, ...utm, empresa_site: trap }),
      signal: controller.signal,
    });
    return response.ok ? "ok" : "error";
  } catch { return "error"; } finally { clearTimeout(timer); }
}

function MentoriaWhatsApp({ href, children, className = "btn btn--lg" }) {
  return (
    <a className={className} href={href} target="_blank" rel="noopener noreferrer"
      onClick={event => getAnalytics()?.trackWhatsApp(placementOf(event.currentTarget), "mentoria")}>
      <IconWhatsApp />{children}
    </a>
  );
}

// Vertical video (1080 × 1920). Until the edited file arrives, a reserved frame says so.
function VideoFrame({ video, priority = false }) {
  if (video.src) {
    return <div className="vframe"><video controls playsInline preload={priority ? "metadata" : "none"} poster={video.poster ?? undefined} src={video.src} aria-label={video.label} /></div>;
  }
  return (
    <div className="vframe vframe--empty" role="img" aria-label={`${video.label}: em edição`}>
      <SymbolPicture sizes="72px" width={72} height={72} />
      <p className="eyebrow">{video.label}</p>
      <p className="muted">Em edição. O vídeo entra aqui assim que o arquivo final chegar.</p>
    </div>
  );
}

function Question({ item, value, onChange }) {
  const id = `filtro-${item.name}`;
  if (item.type === "text") {
    return (
      <div className="filtro__q">
        <label className="filtro__label" htmlFor={id}>{item.label}</label>
        <input id={id} name={item.name} type="text" maxLength={200} required value={value ?? ""} placeholder={item.placeholder} onChange={event => onChange(item.name, event.target.value)} />
      </div>
    );
  }
  return (
    <fieldset className="filtro__q">
      <legend className="filtro__label">{item.label}</legend>
      <div className="filtro__options">
        {item.options.map(([key, label]) => (
          <label className="filtro__option" key={key}>
            <input type="radio" name={item.name} value={key} required checked={value === key} onChange={() => onChange(item.name, key)} />
            <span>{label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function Filtro({ onDone }) {
  const copy = MENTORIA_PAGE.filtro;
  const [answers, setAnswers] = useState({});
  const [contact, setContact] = useState({ nome: "", email: "", whatsapp: "" });
  const [accepted, setAccepted] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(false);
  const trap = useRef(null);

  async function submit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.checkValidity() || !accepted) { setError(true); form.reportValidity(); return; }
    setError(false);
    setSending(true);
    const result = avaliarFiltro(answers);
    const utm = readUtm();
    // Bots fill the hidden field; people never see it.
    const email = contact.email.trim();
    const status = trap.current?.value ? "skipped" : await enviar(answers, { nome: contact.nome.trim(), email, whatsapp: contact.whatsapp.trim() }, utm, "");
    // "contato" = filtro enviado (guia, seção 2): fires for every complete submission, with the result.
    getAnalytics()?.trackContact(result.passou, utm.utm_campaign);
    if (result.passou) rememberPass();
    setSending(false);
    onDone({ ...result, status, email });
  }

  const update = (name, value) => setAnswers(current => ({ ...current, [name]: value }));
  return (
    <form className="filtro card" onSubmit={submit} noValidate aria-describedby={error ? "filtro-erro" : undefined}>
      {MENTORIA_FILTRO.map((item, index) => (
        <div className="filtro__step" key={item.name}>
          <span className="card__k">{`Pergunta ${index + 1} de ${MENTORIA_FILTRO.length}`}</span>
          <Question item={item} value={answers[item.name]} onChange={update} />
        </div>
      ))}
      <fieldset className="filtro__q filtro__contact">
        <legend className="filtro__label">{copy.contatoTitulo}</legend>
        <label>Nome<input name="nome" type="text" autoComplete="name" required minLength={2} maxLength={120} value={contact.nome} onChange={event => setContact({ ...contact, nome: event.target.value })} /></label>
        <label>E-mail<input name="email" type="email" autoComplete="email" required maxLength={160} value={contact.email} onChange={event => setContact({ ...contact, email: event.target.value })} /></label>
        <label>WhatsApp com DDD<input name="whatsapp" type="tel" autoComplete="tel" inputMode="tel" required minLength={8} maxLength={30} pattern="[0-9 \(\)\+\.\-]{8,30}" value={contact.whatsapp} onChange={event => setContact({ ...contact, whatsapp: event.target.value })} /></label>
      </fieldset>
      <div className="filtro__trap" aria-hidden="true"><label>Empresa<input ref={trap} name="empresa_site" type="text" tabIndex={-1} autoComplete="off" /></label></div>
      <label className="filtro__lgpd">
        <input type="checkbox" required checked={accepted} onChange={event => setAccepted(event.target.checked)} />
        <span>{copy.lgpd} <a href="/privacidade/">Política de privacidade</a>.</span>
      </label>
      {error && <p className="filtro__error" id="filtro-erro" role="alert">{copy.obrigatorio}</p>}
      <button className="btn btn--lg" type="submit" disabled={sending}>{sending ? copy.enviando : copy.enviar}</button>
    </form>
  );
}

function Passou({ status, email }) {
  const copy = MENTORIA_PAGE.passou;
  const vagas = MENTORIA_PAGE.vagas;
  const aberta = MENTORIA_TURMA.vagasRestantes > 0;
  const texto = status === "error" ? copy.erro : status === "remembered" || !email ? copy.lembrado : copy.enviado.replace("{email}", email);
  return (
    <div className="card card--feature resultado__ok stack">
      <p className="eyebrow">{copy.eyebrow}</p>
      <h2 className="h2" id="resultado-title" tabIndex={-1}>{copy.title}</h2>
      <p className="lead">{texto}</p>
      {status !== "error" && <p className="muted">{copy.spam}</p>}
      {!aberta && <p className="muted">{vagas.fechada}</p>}
      <div className="btn-row">
        {aberta
          ? <MentoriaWhatsApp href={MENTORIA_WHATSAPP.naoRecebi} className="btn btn--ghost">{copy.whatsapp}</MentoriaWhatsApp>
          : <MentoriaWhatsApp href={MENTORIA_WHATSAPP.espera}>{vagas.esperaCta}</MentoriaWhatsApp>}
      </div>
    </div>
  );
}

// The offer sits right under the title, inside the same card: people who do not pass read the
// title and leave (Carlos, 09/11), so the button has to be on the first screen.
function Direcionamento() {
  const copy = MENTORIA_PAGE.naoPassou.direcionamento;
  const checkout = MENTORIA_CHECKOUT.direcionamento;
  return (
    <div className="direcionamento">
      <p className="eyebrow">{copy.eyebrow}</p>
      <p><strong>{copy.title}.</strong> {copy.texto}</p>
      <div className="direcionamento__acao">
        <strong className="direcionamento__preco">{copy.preco}</strong>
        {checkout
          ? <a className="btn" href={checkout} target="_blank" rel="noopener noreferrer">{copy.cta}</a>
          : <MentoriaWhatsApp href={MENTORIA_WHATSAPP.direcionamento} className="btn">{copy.ctaWhatsApp}</MentoriaWhatsApp>}
      </div>
      <p className="direcionamento__termos">{copy.pagamento}. {copy.termos}</p>
    </div>
  );
}

function NaoPassou({ volte }) {
  const copy = MENTORIA_PAGE.naoPassou;
  return (
    <div className="card resultado__nao">
      <p className="eyebrow">{copy.eyebrow}</p>
      <h2 className="h3" id="resultado-title" tabIndex={-1}>{copy.title}</h2>
      <p>{copy.sincero}</p>
      <Direcionamento />
      <p>{copy.volte}:</p>
      <ul>{volte.map(item => <li key={item}>{item}.</li>)}</ul>
      <p className="muted">{copy.fecho}</p>
    </div>
  );
}

export function MentoriaPage({ locale = "pt" }) {
  const t = UI[locale];
  const page = MENTORIA_PAGE;
  const [result, setResult] = useState(null);
  const resultRef = useRef(null);

  useEffect(() => {
    readUtm();
    if (rememberedPass()) setResult({ passou: true, volte: [], status: "remembered" });
  }, []);

  useEffect(() => {
    if (!result || result.status === "remembered") return;
    resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    resultRef.current?.querySelector("#resultado-title")?.focus({ preventScroll: true });
  }, [result]);

  return (
    <PageShell locale={locale} page="career" sticky={null}>
      <section id="home" className="hero hero--page dark" aria-labelledby="service-title">
        <Circuits />
        <div className="wrap hero__in">
          <div className="hero__text">
            <Crumbs label={t.breadcrumbLabel} items={[{ label: t.homeLabel, href: pathFor("home", locale) }, { label: "Mentoria" }]} />
            <p className="eyebrow">{page.eyebrow}</p>
            <h1 className="h1 h1--md" id="service-title">{page.heading}</h1>
            <p className="lead">{page.intro}</p>
            <div className="btn-row">
              <a className="btn btn--lg" href="#filtro">{page.ctaLabel}<IconDown /></a>
              <LinkArrow href="#para-quem" icon="down">{page.secondaryLabel}</LinkArrow>
            </div>
          </div>
          <div className="hero__media hero__media--center"><VideoFrame video={MENTORIA_VIDEOS.video1} priority /></div>
        </div>
        <div className="wrap hero__facts"><Facts items={page.facts} /></div>
      </section>

      <section className="section light" id="para-quem" aria-labelledby="quem-title">
        <div className="wrap">
          <SectionHead eyebrow={page.quem.eyebrow} title={page.quem.title} id="quem-title" />
          <div className="grid grid--2" data-reveal-group="">
            <div className="card card--feature" data-reveal=""><h3 className="h3">É para você se</h3><ul>{page.quem.e.map(item => <li key={item}>{item}</li>)}</ul></div>
            <div className="card" data-reveal=""><h3 className="h3">Não é para você se</h3><ul>{page.quem.naoE.map(item => <li key={item}>{item}</li>)}</ul></div>
          </div>
          <div className="stack quem__fecho" data-reveal=""><p className="lead">{page.quem.fecho}</p><p className="muted">{page.quem.fila}</p></div>
        </div>
      </section>

      <section className="section dark" id="encontros" aria-labelledby="encontros-title">
        <div className="wrap">
          <SectionHead eyebrow={page.encontros.eyebrow} title={page.encontros.title} aside={page.encontros.aside} id="encontros-title" />
          <Steps items={page.encontros.items} glass className="steps steps--4" />
        </div>
      </section>

      <section className="section light" id="sem-promessa" aria-labelledby="promessa-title">
        <div className="wrap grid grid--2" data-reveal-group="">
          <div className="card" data-reveal=""><p className="eyebrow">{page.semPromessa.eyebrow}</p><h2 className="h3" id="promessa-title">{page.semPromessa.title}</h2><p>{page.semPromessa.texto}</p></div>
          <div className="card" data-reveal=""><p className="eyebrow">Indicação</p><h2 className="h3">{page.semPromessa.comissaoTitulo}</h2><p>{page.semPromessa.comissao}</p></div>
        </div>
      </section>

      <section className="section dark-2" id="filtro" aria-labelledby="filtro-title">
        <div className="wrap filtro-wrap">
          <div className="stack">
            <p className="eyebrow">{page.filtro.eyebrow}</p>
            <h2 className="h2" id="filtro-title">{page.filtro.title}</h2>
            <p className="lead">{page.filtro.lead}</p>
            {PREVIEW && <p className="note">Prévia: nesta cópia o envio não grava nada no banco.</p>}
          </div>
          <div ref={resultRef} className="resultado-slot" aria-live="polite">
            {!result && <Filtro onDone={setResult} />}
            {result && !result.passou && <NaoPassou volte={result.volte} />}
            {result?.passou && <Passou status={result.status} email={result.email} />}
          </div>
        </div>
      </section>

      <section className="section section--tight dark mentoria-dados" aria-labelledby="dados-title">
        <div className="wrap stack stack--sm">
          <h2 className="eyebrow" id="dados-title">{page.dados.title}</h2>
          <p className="muted">{page.dados.texto} <a href="/privacidade/">{page.dados.privacidade}</a>.</p>
        </div>
      </section>
    </PageShell>
  );
}
