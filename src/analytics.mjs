export const MEASUREMENT_ID = "G-VKJKP1MBYF";
export const CONSENT_KEY = "tetelestai:analytics-consent:v1";
export const CONSENT_POLICY_VERSION = 5;
export const CONSENT_DURATION = 180 * 24 * 60 * 60 * 1000;
export const PREFERENCES_EVENT = "tetelestai:cookie-preferences";
export const TEST_MODE_KEY = "tetelestai:test-mode:v1";
// Meta pixel (dataset) for the mentoria test, 11 to 25/11/2026. Empty = disabled until Carlos creates the
// dataset in Events Manager and sends its ID. It loads only on /mentoria/, only after consent, never in test mode.
export const META_PIXEL_ID = "";
const PIXEL_PATHS = ["/mentoria/"];
// UTM campaigns defined in the mentoria guide (section 5); anything else is reported as "outra".
const MENTORIA_CAMPAIGNS = ["bio_mentoria", "anuncio_mentoria", "reel_mentoria"];

const PAGE_PATHS = ["/", "/en/", "/criacao-de-sites/", "/criacao-de-landing-pages/", "/mentoria/", "/capacitacao-em-ia/", "/projetos/", "/projetos/infinity-car-studio/", "/projetos/bolachinhas-da-vovo-juju/", "/projetos/afeto-nobre/", "/projetos/lalelis/", "/projetos/respeitavel-feijuca/", "/en/website-development/", "/en/landing-pages/", "/en/ai-training/", "/en/projects/", "/en/projects/infinity-car-studio/", "/en/projects/bolachinhas-da-vovo-juju/", "/en/projects/afeto-nobre/", "/en/projects/lalelis/", "/en/projects/respeitavel-feijuca/"];

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
export function createAnalyticsController(win, doc, now = Date.now, { pixelId = META_PIXEL_ID } = {}) {
  const disableKey = `ga-disable-${MEASUREMENT_ID}`;
  let script;
  let pixelScript;
  let pixelStarted = false;
  let timer;
  let started = false;
  let blocked = false;
  let modeAtStart;
  let modeCommandHandled = false;
  let modeError = false;
  let modeCommand = null;

  function testMode() {
    if (modeError) return "error";
    try {
      if (!modeCommandHandled) {
        modeCommandHandled = true;
        const params = new URLSearchParams(win.location.search ?? "");
        const values = params.getAll("modo_teste");
        if (values.length === 1 && ["0", "1"].includes(values[0])) {
          modeCommand = values[0];
          if (modeCommand === "1") win.localStorage.setItem(TEST_MODE_KEY, "1");
          else win.localStorage.removeItem(TEST_MODE_KEY);
          const expected = modeCommand === "1" ? "1" : null;
          if (win.localStorage.getItem(TEST_MODE_KEY) !== expected) throw Error("Preference not saved");
          // Remove the command so copied URLs and reloads cannot replay it.
          const query = (params.delete("modo_teste"), params.toString());
          win.history?.replaceState(null, "", `${win.location.pathname}${query ? `?${query}` : ""}${win.location.hash ?? ""}`);
        }
      }
      const stored = win.localStorage.getItem(TEST_MODE_KEY);
      if (stored !== null && stored !== "1") throw Error("Invalid test preference");
      return stored === "1" ? "internal" : "public";
    } catch {
      modeError = true;
      return "error";
    }
  }

  function record() {
    try {
      const value = JSON.parse(win.localStorage.getItem(CONSENT_KEY));
      return value && ["accepted", "rejected"].includes(value.choice) &&
        Number.isFinite(value.expiresAt) && value.expiresAt > now() &&
        value.expiresAt <= now() + CONSENT_DURATION &&
        // A refusal remains protective across policy versions. An acceptance
        // needs explicit confirmation of the current measurement scope.
        (value.choice === "rejected" || value.policyVersion === CONSENT_POLICY_VERSION) ? value : null;
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
      if (name !== "_ga" && !name.startsWith("_ga_") && !["_fbp", "_fbc"].includes(name)) continue;
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
    pixelScript?.remove();
    clearCookies();
    // Removing a script element does not unload its code or listeners.
    if (started && reload) win.location.reload();
  }

  function context(path) {
    return {
      page_location: `https://tetelestai.tech${path}`,
      page_referrer: referrerOrigin(doc.referrer),
      page_title: doc.title,
      site_language: path.startsWith("/en/") ? "en" : "pt",
      test_mode: modeAtStart,
      traffic_type: modeAtStart === "internal" ? "internal" : "external",
    };
  }

  function sync() {
    const mode = testMode();
    if (mode === "error") { stop(false); return; }
    if (started && mode !== modeAtStart && !blocked) { stop(); return; }
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
    if (started) { startPixel(path); return; }
    modeAtStart = mode;
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
    startPixel(path);
  }

  // Meta pixel: same consent as Analytics (policy v5), only on the mentoria page, no automatic events.
  function startPixel(path) {
    if (pixelStarted || blocked || !pixelId || !PIXEL_PATHS.includes(path) || modeAtStart === "internal") return;
    pixelStarted = true;
    const fbq = function () { if (fbq.callMethod) fbq.callMethod.apply(fbq, arguments); else fbq.queue.push(arguments); };
    fbq.push = fbq; fbq.loaded = true; fbq.version = "2.0"; fbq.queue = [];
    win.fbq = fbq;
    if (!win._fbq) win._fbq = fbq;
    fbq("set", "autoConfig", false, pixelId);
    fbq("init", pixelId);
    fbq("track", "PageView");
    pixelScript = doc.createElement("script");
    pixelScript.async = true;
    pixelScript.src = "https://connect.facebook.net/en_US/fbevents.js";
    doc.head.appendChild(pixelScript);
  }

  function choose(choice) {
    if (!["accepted", "rejected"].includes(choice)) return false;
    const saved = save({ choice, expiresAt: now() + CONSENT_DURATION, policyVersion: CONSENT_POLICY_VERSION });
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

  // Placement names come from the page area that holds the link (hero, header, price_note, ...).
  const placementName = value => (typeof value === "string" && /^[a-z0-9_]{1,40}$/.test(value) ? value : "contact_section");

  function trackWhatsApp(placement, intent) {
    sync();
    const path = measurementPath(win.location.pathname);
    if (!started || blocked || !path || record()?.choice !== "accepted") return;
    win.gtag("event", "whatsapp_click", {
      ...context(path), send_to: MEASUREMENT_ID,
      page_path: path, site_language: path.startsWith("/en/") ? "en" : "pt",
      contact_placement: placementName(placement),
      contact_intent: ["landing_697", "mentoria"].includes(intent) ? intent : "orcamento",
    });
  }

  // "contato" = mentoria filter sent (guide, section 2): one event per complete submission, passed or not.
  // GA4 receives the result and the campaign; the Meta pixel receives the standard Contact event.
  function trackContact(passou, campaign) {
    sync();
    const path = measurementPath(win.location.pathname);
    if (!started || blocked || path !== "/mentoria/" || record()?.choice !== "accepted") return;
    const origem = MENTORIA_CAMPAIGNS.includes(campaign) ? campaign : campaign ? "outra" : "direto";
    win.gtag("event", "contato", {
      ...context(path), send_to: MEASUREMENT_ID, page_path: path,
      filtro_resultado: passou ? "passou" : "nao_passou", origem,
    });
    if (pixelStarted && typeof win.fbq === "function") win.fbq("track", "Contact", { content_name: "filtro_mentoria", filtro: passou ? "passou" : "nao_passou" });
  }

  function trackAppStore(placement, appId = "6815378368") {
    if (!["button", "qr_link"].includes(placement)) return;
    if (!["6815378368", "6820150552"].includes(appId)) return;
    sync();
    const path = measurementPath(win.location.pathname);
    if (!started || blocked || !path || record()?.choice !== "accepted") return;
    win.gtag("event", "app_store_click", {
      ...context(path), send_to: MEASUREMENT_ID, page_path: path,
      app_id: appId, link_placement: placement,
    });
  }

  function trackAppVideo(placement, appId) {
    if (!["cover", "text"].includes(placement) || appId !== "6820150552") return;
    sync();
    const path = measurementPath(win.location.pathname);
    if (!started || blocked || !path || record()?.choice !== "accepted") return;
    // Explicit link activation only; opening the file does not prove playback.
    win.gtag("event", "app_video_click", {
      ...context(path), send_to: MEASUREMENT_ID, page_path: path,
      app_id: appId, link_placement: placement,
    });
  }

  return { choice: () => record()?.choice ?? null, choose, sync, trackWhatsApp, trackContact, trackAppStore, trackAppVideo,
    testMode, modeCommand: () => modeCommand };
}

let browserController;
export function getAnalytics() {
  if (typeof window === "undefined") return null;
  browserController ??= createAnalyticsController(window, document);
  return browserController;
}
