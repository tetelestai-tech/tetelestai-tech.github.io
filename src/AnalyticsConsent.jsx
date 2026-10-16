import { useEffect, useRef, useState } from "react";
import { CONSENT_KEY, TEST_MODE_KEY, PREFERENCES_EVENT, getAnalytics, measurementPath } from "./analytics.mjs";

const COPY = {
  pt: {
    title: "Métricas do site",
    text: "Usamos cookies do Google Analytics para entender visitas nas páginas iniciais, de serviços e do portfólio em português e inglês, além dos cliques no WhatsApp e nos links da App Store. Você pode aceitar ou recusar a medição.",
    accept: "Aceitar métricas", reject: "Recusar", preferences: "Preferências de cookies",
    privacy: "Política de privacidade", privacyPath: "/privacidade/", close: "Fechar",
    error: "Não foi possível salvar sua escolha neste navegador. A medição está bloqueada nesta página.",
  },
  en: {
    title: "Site analytics",
    text: "We use Google Analytics cookies to understand visits to the home, service and portfolio pages in Portuguese and English, as well as clicks on WhatsApp and App Store links. You can accept or decline this measurement.",
    accept: "Accept analytics", reject: "Decline", preferences: "Cookie preferences",
    privacy: "Privacy policy", privacyPath: "/en/privacy/", close: "Close",
    error: "Your choice could not be saved in this browser. Analytics is blocked on this page.",
  },
};

export function AnalyticsPreferencesButton({ locale }) {
  return <button type="button" className="footer-link cookie-preferences" onClick={event => {
    window.dispatchEvent(new CustomEvent(PREFERENCES_EVENT, { detail: event.currentTarget }));
  }}>{COPY[locale].preferences}</button>;
}

export function AnalyticsConsent({ locale, pathname }) {
  const [open, setOpen] = useState(false);
  const [manual, setManual] = useState(false);
  const [error, setError] = useState(false);
  const [testStatus, setTestStatus] = useState(null);
  const title = useRef(null);
  const returnFocus = useRef(null);
  const copy = COPY[locale];

  useEffect(() => {
    const analytics = getAnalytics();
    analytics.sync();
    setTestStatus(analytics.testMode() === "public" && analytics.modeCommand() !== "0" ? null : analytics.testMode());
    setOpen(Boolean(measurementPath(pathname)) && !analytics.choice());
    function show(event) {
      returnFocus.current = event.detail;
      setManual(true);
      setError(false);
      setOpen(true);
    }
    function refresh(event) {
      if (event.type === "storage" && event.key !== null && ![CONSENT_KEY, TEST_MODE_KEY].includes(event.key)) return;
      analytics.sync();
      setTestStatus(analytics.testMode() === "public" && analytics.modeCommand() !== "0" ? null : analytics.testMode());
      setOpen(Boolean(measurementPath(pathname)) && !analytics.choice());
    }
    window.addEventListener(PREFERENCES_EVENT, show);
    window.addEventListener("storage", refresh);
    window.addEventListener("pageshow", refresh);
    return () => {
      window.removeEventListener(PREFERENCES_EVENT, show);
      window.removeEventListener("storage", refresh);
      window.removeEventListener("pageshow", refresh);
    };
  }, [pathname]);

  useEffect(() => { if (open && manual) title.current?.focus(); }, [open, manual]);

  function close() {
    setOpen(false);
    returnFocus.current?.focus();
  }

  function choose(choice) {
    if (getAnalytics().choose(choice)) close();
    else setError(true);
  }

  return <>
    {testStatus && <aside className="analytics-test-status" role="status">
      <span>{testStatus === "internal" ? (locale === "en" ? "Test mode active" : "Modo de teste ativo") : testStatus === "error" ? (locale === "en" ? "Test preference unavailable. Analytics blocked." : "Preferência de teste indisponível. Medição bloqueada.") : (locale === "en" ? "Test mode off" : "Modo de teste desativado")}</span>
      {testStatus === "internal" && <a href={`${pathname}?modo_teste=0`}>{locale === "en" ? "Turn off" : "Desativar"}</a>}
      {testStatus === "public" && <button type="button" onClick={() => setTestStatus(null)}>{copy.close}</button>}
    </aside>}
    {open && <section className="analytics-consent" aria-labelledby="analytics-consent-title">
    <div className="analytics-consent__copy">
      <h2 id="analytics-consent-title" ref={title} tabIndex={-1}>{copy.title}</h2>
      <p>{copy.text} <a href={copy.privacyPath}>{copy.privacy}</a>.</p>
      {error && <p role="alert">{copy.error}</p>}
    </div>
    <div className="analytics-consent__actions">
      <button type="button" onClick={() => choose("accepted")}>{copy.accept}</button>
      <button type="button" onClick={() => choose("rejected")}>{copy.reject}</button>
      {manual && <button type="button" className="analytics-consent__close" onClick={close}>{copy.close}</button>}
    </div>
  </section>}
  </>;
}
