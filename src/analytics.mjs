export const MEASUREMENT_ID = "G-VKJKP1MBYF";
export const CONSENT_KEY = "tetelestai:analytics-consent:v1";
export const CONSENT_DURATION = 180 * 24 * 60 * 60 * 1000;
export const PREFERENCES_EVENT = "tetelestai:cookie-preferences";

const PAGE_PATHS = ["/", "/en/", "/criacao-de-sites/", "/criacao-de-landing-pages/"];

export function measurementPath(pathname) {
  return PAGE_PATHS.find(path => pathname === path || pathname === `${path}index.html` ||
    (path !== "/" && pathname === path.slice(0, -1))) ?? null;
}

function referrerOrigin(value) {
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol) ? `${url.origin}/` : "";
  } catch { return ""; }
}

// No browser access at module scope: this module also participates in prerendering.
export function createAnalyticsController(win, doc, now = Date.now) {
  const disableKey = `ga-disable-${MEASUREMENT_ID}`;
  let script;
  let timer;
  let started = false;
  let blocked = false;

  function record() {
    try {
      const value = JSON.parse(win.localStorage.getItem(CONSENT_KEY));
      return value && ["accepted", "rejected"].includes(value.choice) &&
        Number.isFinite(value.expiresAt) && value.expiresAt > now() &&
        value.expiresAt <= now() + CONSENT_DURATION ? value : null;
    } catch { return null; }
  }

  function save(value) {
    try {
      const raw = JSON.stringify(value);
      win.localStorage.setItem(CONSENT_KEY, raw);
      return win.localStorage.getItem(CONSENT_KEY) === raw;
    } catch { return false; }
  }

  function clearCookies() {
    for (const cookie of doc.cookie.split(";")) {
      const name = cookie.trim().split("=")[0];
      if (name !== "_ga" && !name.startsWith("_ga_")) continue;
      for (const domain of ["", win.location.hostname, ".tetelestai.tech"]) {
        doc.cookie = `${name}=; Max-Age=0; path=/;${domain ? ` domain=${domain};` : ""} SameSite=Lax; Secure`;
      }
    }
  }

  function stop(reload = true) {
    win[disableKey] = true;
    blocked = true;
    win.clearTimeout(timer);
    if (win.dataLayer) win.dataLayer.length = 0;
    script?.remove();
    clearCookies();
    // Removing a script element does not unload its code or listeners.
    if (started && reload) win.location.reload();
  }

  function context(path) {
    return {
      page_location: `https://tetelestai.tech${path}`,
      page_referrer: referrerOrigin(doc.referrer),
      page_title: doc.title,
    };
  }

  function sync() {
    const consent = record();
    if (consent?.choice !== "accepted") {
      if (started && !blocked) stop();
      else if (!started) clearCookies();
      return;
    }
    if (blocked) return;
    const path = measurementPath(win.location.pathname);
    if (!path || !["tetelestai.tech", "www.tetelestai.tech"].includes(win.location.hostname)) return;
    // Confirm consent can still be changed without extending its expiration.
    if (!save(consent)) { stop(false); return; }
    win.clearTimeout(timer);
    timer = win.setTimeout(sync, Math.min(consent.expiresAt - now(), 2_147_483_647));
    if (started) return;
    started = true;
    win[disableKey] = false;
    win.dataLayer = win.dataLayer || [];
    win.gtag = function () { win.dataLayer.push(arguments); };
    win.gtag("consent", "default", {
      analytics_storage: "denied", ad_storage: "denied",
      ad_user_data: "denied", ad_personalization: "denied",
    });
    win.gtag("consent", "update", { analytics_storage: "granted" });
    win.gtag("js", new Date(now()));
    win.gtag("config", MEASUREMENT_ID, {
      ...context(path), send_page_view: false,
      allow_google_signals: false, allow_ad_personalization_signals: false,
      cookie_domain: "tetelestai.tech", cookie_path: "/",
      // GA4 may refresh its session cookie despite cookie_update=false. Do not
      // give a returning visitor another full 180 days of cookie lifetime.
      cookie_expires: Math.max(1, Math.floor((consent.expiresAt - now()) / 1000)), cookie_update: false,
      cookie_flags: "SameSite=Lax;Secure",
    });
    win.gtag("event", "page_view", { ...context(path), send_to: MEASUREMENT_ID });
    script = doc.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`;
    script.referrerPolicy = "origin";
    doc.head.appendChild(script);
  }

  function choose(choice) {
    if (!["accepted", "rejected"].includes(choice)) return false;
    const saved = save({ choice, expiresAt: now() + CONSENT_DURATION });
    if (choice === "rejected" || !saved) {
      let safeReload = saved;
      if (!saved) {
        try {
          win.localStorage.removeItem(CONSENT_KEY);
          safeReload = win.localStorage.getItem(CONSENT_KEY) === null;
        } catch { /* Keep the current page blocked if storage is unavailable. */ }
      }
      stop(safeReload);
      return saved;
    }
    // A stopped tag may still have listeners: restart only in a fresh document.
    if (started && blocked) { win.location.reload(); return true; }
    blocked = false;
    sync();
    return !blocked;
  }

  function trackWhatsApp() {
    sync();
    const path = measurementPath(win.location.pathname);
    if (!started || blocked || !path || record()?.choice !== "accepted") return;
    win.gtag("event", "whatsapp_click", {
      ...context(path), send_to: MEASUREMENT_ID,
      page_path: path, site_language: path === "/en/" ? "en" : "pt",
      contact_placement: "contact_section",
    });
  }

  return { choice: () => record()?.choice ?? null, choose, sync, trackWhatsApp };
}

let browserController;
export function getAnalytics() {
  if (typeof window === "undefined") return null;
  browserController ??= createAnalyticsController(window, document);
  return browserController;
}
