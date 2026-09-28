import { useEffect, useRef, useState } from "react";
import { CONSENT_KEY, PREFERENCES_EVENT, getAnalytics, measurementPath } from "./analytics.mjs";

const COPY = {
  pt: {
    title: "Métricas do site",
    text: "Usamos cookies do Google Analytics para entender as visitas ao site e os cliques no WhatsApp. Você pode aceitar ou recusar a medição.",
    accept: "Aceitar métricas", reject: "Recusar", preferences: "Preferências de cookies",
    privacy: "Política de privacidade", privacyPath: "/privacidade/", close: "Fechar",
    error: "Não foi possível salvar sua escolha neste navegador. A medição está bloqueada nesta página.",
  },
  en: {
    title: "Site analytics",
    text: "We use Google Analytics cookies to understand site visits and WhatsApp clicks. You can accept or decline this measurement.",
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
  const title = useRef(null);
  const returnFocus = useRef(null);
  const copy = COPY[locale];

  useEffect(() => {
    const analytics = getAnalytics();
    analytics.sync();
    setOpen(Boolean(measurementPath(pathname)) && !analytics.choice());
    function show(event) {
      returnFocus.current = event.detail;
      setManual(true);
      setError(false);
      setOpen(true);
    }
    function refresh(event) {
      if (event.type === "storage" && event.key !== null && event.key !== CONSENT_KEY) return;
      analytics.sync();
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

  if (!open) return null;
  return <section className="analytics-consent" aria-labelledby="analytics-consent-title">
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
  </section>;
}
