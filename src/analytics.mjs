export const MEASUREMENT_ID = "G-VKJKP1MBYF";
export const CONSENT_KEY = "tetelestai:analytics-consent:v1";
export const CONSENT_POLICY_VERSION = 3;
export const CONSENT_DURATION = 180 * 24 * 60 * 60 * 1000;
export const PREFERENCES_EVENT = "tetelestai:cookie-preferences";
export const TEST_MODE_KEY = "tetelestai:test-mode:v1";

const PAGE_PATHS = ["/", "/en/", "/criacao-de-sites/", "/criacao-de-landing-pages/", "/carreira-internacional/", "/capacitacao-em-ia/", "/projetos/", "/projetos/infinity-car-studio/", "/projetos/bolachinhas-da-vovo-juju/", "/en/website-development/", "/en/landing-pages/", "/en/international-career/", "/en/ai-training/", "/en/projects/", "/en/projects/infinity-car-studio/", "/en/projects/bolachinhas-da-vovo-juju/"];

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
        // needs explicit confirmation of the expanded list of measured pages.
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
    if (started) return;
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

  function trackWhatsApp() {
    sync();
    const path = measurementPath(win.location.pathname);
    if (!started || blocked || !path || record()?.choice !== "accepted") return;
    win.gtag("event", "whatsapp_click", {
      ...context(path), send_to: MEASUREMENT_ID,
      page_path: path, site_language: path.startsWith("/en/") ? "en" : "pt",
      contact_placement: "contact_section",
    });
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

  return { choice: () => record()?.choice ?? null, choose, sync, trackWhatsApp, trackAppStore,
    testMode, modeCommand: () => modeCommand };
}

let browserController;
export function getAnalytics() {
  if (typeof window === "undefined") return null;
  browserController ??= createAnalyticsController(window, document);
  return browserController;
}
