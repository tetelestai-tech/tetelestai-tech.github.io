import test from "node:test";
import assert from "node:assert/strict";
import { createAnalyticsController, CONSENT_KEY, CONSENT_DURATION, MEASUREMENT_ID, measurementPath } from "../src/analytics.mjs";

function browser(path = "/", hostname = "tetelestai.tech", search = "") {
  let now = 1000;
  const stored = new Map();
  const scripts = [];
  const cookies = [];
  const timers = new Map();
  let reloads = 0;
  const win = {
    location: { pathname: path, hostname, search, reload() { reloads++; } },
    localStorage: { getItem: k => stored.get(k) ?? null, setItem: (k, v) => stored.set(k, v), removeItem: k => stored.delete(k) },
    setTimeout: fn => { const id = timers.size + 1; timers.set(id, fn); return id; },
    clearTimeout: id => timers.delete(id),
  };
  const doc = {
    title: "Criação de sites", referrer: "https://www.google.com/search?q=private-value",
    head: { appendChild(s) { scripts.push(s); } },
    createElement: () => ({ remove() { this.removed = true; } }),
    get cookie() { return "_ga=abc; _ga_VKJKP1MBYF=def; essential=keep"; },
    set cookie(value) { cookies.push(value); },
  };
  const controller = createAnalyticsController(win, doc, () => now);
  const events = () => (win.dataLayer ?? []).map(v => Array.from(v)).filter(v => v[0] === "event");
  return { controller, win, doc, stored, scripts, cookies, timers, events, setNow: value => { now = value; }, get reloads() { return reloads; } };
}

test("only the sixteen commercial pages and their explicit aliases qualify", () => {
  for (const path of ["/", "/en/", "/criacao-de-sites/", "/criacao-de-landing-pages/", "/carreira-internacional/", "/capacitacao-em-ia/", "/projetos/", "/projetos/infinity-car-studio/", "/projetos/bolachinhas-da-vovo-juju/", "/en/website-development/", "/en/landing-pages/", "/en/international-career/", "/en/ai-training/", "/en/projects/", "/en/projects/infinity-car-studio/", "/en/projects/bolachinhas-da-vovo-juju/"]) {
    assert.equal(measurementPath(path), path);
    assert.equal(measurementPath(`${path}index.html`), path);
    if (path !== "/") assert.equal(measurementPath(path.slice(0, -1)), path);
  }
  for (const path of ["/projetos/afeto-nobre/", "/projetos/lalelis/", "/en/projects/afeto-nobre/", "/en/projects/lalelis/", "/recarga/", "/privacidade/", "/en/privacy/", "/missing/", "/en//", "/criacao-de-sites/missing/index.html", "/carreira-internacional/missing", "/capacitacao-em-ia//"]) assert.equal(measurementPath(path), null);
});

test("test link marks the first view and every click without overriding consent", () => {
  const b = browser("/projetos/", "tetelestai.tech", "?modo_teste=1");
  b.controller.sync();
  assert.equal(b.scripts.length, 0);
  assert.equal(b.stored.get("tetelestai:test-mode:v1"), "1");
  b.controller.choose("accepted");
  b.controller.trackWhatsApp();
  b.controller.trackAppStore("button");
  b.controller.trackAppStore("qr_link");
  assert.equal(b.events().length, 4);
  for (const [, , params] of b.events()) {
    assert.equal(params.traffic_type, "internal");
    assert.equal(params.test_mode, "internal");
    assert.doesNotMatch(params.page_location, /modo_teste/);
  }
  const config = b.win.dataLayer.map(v => Array.from(v)).find(v => v[0] === "config")[2];
  assert.equal(config.traffic_type, "internal");
});

test("test flag persists across documents and deactivation clears it before the next view", () => {
  const b = browser("/en/projects/");
  b.stored.set("tetelestai:test-mode:v1", "1");
  b.controller.choose("accepted");
  assert.equal(b.events()[0][2].test_mode, "internal");
  const consent = b.stored.get(CONSENT_KEY);
  b.win.location.search = "?modo_teste=0";
  const next = createAnalyticsController(b.win, b.doc, () => 1000);
  next.sync();
  assert.equal(b.win.localStorage.getItem("tetelestai:test-mode:v1"), null);
  assert.equal(b.events().at(-1)[2].test_mode, "public");
  assert.equal(b.events().at(-1)[2].traffic_type, "external");
  assert.equal(b.stored.get(CONSENT_KEY), consent);
});

test("normal visitors and invalid mode links remain public, refused consent remains refused", () => {
  for (const search of ["", "?modo_teste=yes", "?modo_teste=1&modo_teste=0"]) {
    const b = browser("/", "tetelestai.tech", search);
    b.controller.choose("accepted");
    assert.equal(b.events()[0][2].test_mode, "public");
    assert.equal(b.win.localStorage.getItem("tetelestai:test-mode:v1"), null);
  }
  const b = browser("/", "tetelestai.tech", "?modo_teste=1");
  b.controller.choose("rejected");
  b.controller.trackAppStore("button");
  assert.equal(b.controller.choice(), "rejected");
  assert.deepEqual(b.events(), []);
});

test("a changed mode in another tab stops the previous tag before more events", () => {
  const b = browser();
  b.controller.choose("accepted");
  b.stored.set("tetelestai:test-mode:v1", "1");
  b.controller.trackAppStore("button");
  assert.equal(b.reloads, 1);
  assert.deepEqual(b.events(), []);
});

test("unreadable test preference blocks analytics rather than silently treating tests as public", () => {
  const b = browser();
  const get = b.win.localStorage.getItem;
  b.win.localStorage.getItem = key => {
    if (key === "tetelestai:test-mode:v1") throw Error("unavailable");
    return get(key);
  };
  b.controller.choose("accepted");
  assert.equal(b.scripts.length, 0);
  assert.deepEqual(b.events(), []);
});

test("no tracking before acceptance or after refusal; contact clicks are not replayed", () => {
  const b = browser();
  b.controller.sync();
  b.controller.trackWhatsApp();
  assert.equal(b.scripts.length, 0);
  assert.equal(b.win.gtag, undefined);
  assert.equal(b.controller.choose("rejected"), true);
  b.controller.trackWhatsApp();
  assert.equal(b.scripts.length, 0);
  assert.deepEqual(b.events(), []);
  b.controller.choose("accepted");
  assert.deepEqual(b.events().map(e => e[1]), ["page_view"]);
});

test("acceptance is idempotent and sends minimal events with sanitized context", () => {
  const b = browser("/criacao-de-sites/");
  assert.equal(b.controller.choose("accepted"), true);
  b.controller.sync();
  b.controller.sync();
  assert.equal(b.scripts.length, 1);
  b.controller.trackWhatsApp();
  b.controller.trackWhatsApp();
  assert.deepEqual(b.events().map(e => e[1]), ["page_view", "whatsapp_click", "whatsapp_click"]);
  assert.equal(b.events()[0][2].page_location, "https://tetelestai.tech/criacao-de-sites/");
  assert.equal(b.events()[0][2].page_referrer, "https://www.google.com/");
  assert.doesNotMatch(JSON.stringify(b.win.dataLayer), /private-value|556184711930|generate_lead/);
  const config = b.win.dataLayer.map(v => Array.from(v)).find(v => v[0] === "config")[2];
  assert.equal(config.send_page_view, false);
  assert.equal(config.cookie_expires, CONSENT_DURATION / 1000);
  assert.equal(config.cookie_update, false);
  assert.equal(config.allow_google_signals, false);
});

test("revocation stops even a queued tag, clears only GA cookies and reloads", () => {
  const b = browser();
  b.controller.choose("accepted");
  b.controller.choose("rejected");
  assert.equal(b.win[`ga-disable-${MEASUREMENT_ID}`], true);
  assert.equal(b.scripts[0].removed, true);
  assert.equal(b.win.dataLayer.length, 0);
  assert.equal(b.reloads, 1);
  assert.ok(b.cookies.some(c => c.startsWith("_ga=")));
  assert.ok(b.cookies.some(c => c.startsWith("_ga_VKJKP1MBYF=")));
  assert.ok(b.cookies.every(c => !c.startsWith("essential=")));
  b.controller.trackWhatsApp();
  assert.deepEqual(b.events(), []);
});

test("a stored choice is respected, not renewed, and expires while a page is open", () => {
  const b = browser();
  b.controller.choose("accepted");
  const original = b.stored.get(CONSENT_KEY);
  b.setNow(2000);
  b.controller.sync();
  assert.equal(b.stored.get(CONSENT_KEY), original);
  b.setNow(1000 + CONSENT_DURATION);
  for (const callback of [...b.timers.values()]) callback();
  assert.equal(b.win[`ga-disable-${MEASUREMENT_ID}`], true);
  assert.equal(b.controller.choice(), null);
  assert.equal(b.reloads, 1);
});

test("malformed consent and storage failures fail closed", () => {
  for (const value of ["broken", "null", '{"choice":"accepted"}', '{"choice":"yes","expiresAt":10000}']) {
    const b = browser();
    b.stored.set(CONSENT_KEY, value);
    b.controller.sync();
    assert.equal(b.scripts.length, 0);
  }
  const b = browser();
  b.win.localStorage.setItem = () => { throw Error("denied"); };
  assert.equal(b.controller.choose("accepted"), false);
  assert.equal(b.scripts.length, 0);
  b.stored.set(CONSENT_KEY, JSON.stringify({ choice: "accepted", expiresAt: 10000, policyVersion: 4 }));
  b.controller.sync();
  assert.equal(b.scripts.length, 0, "readable but unwritable storage must not enable tracking");
});

test("returning visitors receive only the remaining consent duration for cookies", () => {
  const b = browser();
  b.stored.set(CONSENT_KEY, JSON.stringify({ choice: "accepted", expiresAt: 1000 + 3600 * 1000, policyVersion: 4 }));
  b.controller.sync();
  const config = b.win.dataLayer.map(v => Array.from(v)).find(v => v[0] === "config")[2];
  assert.equal(config.cookie_expires, 3600);
  assert.equal(JSON.parse(b.stored.get(CONSENT_KEY)).expiresAt, 1000 + 3600 * 1000);
});

test("revocation blocks this page even when persisting the choice fails", () => {
  const b = browser();
  b.controller.choose("accepted");
  b.win.localStorage.setItem = () => { throw Error("denied"); };
  b.win.localStorage.removeItem = () => { throw Error("denied"); };
  assert.equal(b.controller.choose("rejected"), false);
  b.controller.sync();
  b.controller.trackWhatsApp();
  assert.equal(b.win[`ga-disable-${MEASUREMENT_ID}`], true);
  assert.equal(b.reloads, 0, "do not reload into a stale accepted choice");
  assert.deepEqual(b.events(), []);
});

test("legal, Recarga, unknown pages and development hosts never load Analytics", () => {
  for (const [path, host] of [["/privacidade/", "tetelestai.tech"], ["/recarga/", "tetelestai.tech"], ["/unknown/", "tetelestai.tech"], ["/", "localhost"], ["/", "example.com"]]) {
    const b = browser(path, host);
    b.controller.choose("accepted");
    b.controller.trackWhatsApp();
    assert.equal(b.scripts.length, 0);
    assert.deepEqual(b.events(), []);
  }
});

test("a changed preference from another tab stops collection", () => {
  const b = browser();
  b.controller.choose("accepted");
  b.stored.set(CONSENT_KEY, JSON.stringify({ choice: "rejected", expiresAt: 10000 }));
  b.controller.sync();
  assert.equal(b.win[`ga-disable-${MEASUREMENT_ID}`], true);
  assert.equal(b.reloads, 1);
});

test("earlier acceptances do not authorize the expanded scope until explicit confirmation", () => {
  const b = browser("/carreira-internacional/");
  b.stored.set(CONSENT_KEY, JSON.stringify({ choice: "accepted", expiresAt: 10000 }));
  b.controller.sync();
  b.controller.trackWhatsApp();
  assert.equal(b.controller.choice(), null);
  assert.equal(b.scripts.length, 0);
  assert.deepEqual(b.events(), []);
  assert.equal(b.controller.choose("accepted"), true);
  assert.equal(JSON.parse(b.stored.get(CONSENT_KEY)).policyVersion, 4);
  assert.equal(b.scripts.length, 1);
  assert.deepEqual(b.events().map(e => e[1]), ["page_view"]);
});

test("earlier refusals remain effective for the rest of their original duration", () => {
  const b = browser("/capacitacao-em-ia/");
  const choice = JSON.stringify({ choice: "rejected", expiresAt: 10000 });
  b.stored.set(CONSENT_KEY, choice);
  b.controller.sync();
  b.controller.trackWhatsApp();
  assert.equal(b.controller.choice(), "rejected");
  assert.equal(b.stored.get(CONSENT_KEY), choice);
  assert.equal(b.scripts.length, 0);
  b.setNow(10000);
  assert.equal(b.controller.choice(), null);
});

test("new service pages send only the existing minimal events after acceptance", () => {
  for (const path of ["/carreira-internacional/", "/capacitacao-em-ia/"]) {
    const b = browser(path);
    b.controller.sync();
    b.controller.trackWhatsApp();
    assert.deepEqual(b.events(), []);
    b.controller.choose("accepted");
    b.controller.trackWhatsApp();
    assert.deepEqual(b.events().map(e => e[1]), ["page_view", "whatsapp_click"]);
    assert.equal(b.events()[0][2].page_location, `https://tetelestai.tech${path}`);
    assert.equal(b.events()[1][2].page_path, path);
    assert.doesNotMatch(JSON.stringify(b.win.dataLayer), /private-value|556184711930|generate_lead/);
  }
});

test("unknown acceptance policy versions cannot enable tracking", () => {
  for (const policyVersion of [1, 2, 3, 99, "3", "4", null]) {
    const b = browser();
    b.stored.set(CONSENT_KEY, JSON.stringify({ choice: "accepted", expiresAt: 10000, policyVersion }));
    b.controller.sync();
    assert.equal(b.scripts.length, 0);
    assert.equal(b.controller.choice(), null);
  }
});


test("App Store clicks require consent, have bounded parameters and never imply an install", () => {
  const b = browser("/en/projects/");
  b.controller.trackAppStore?.("button");
  assert.deepEqual(b.events(), []);
  b.controller.choose("accepted");
  assert.equal(typeof b.controller.trackAppStore, "function");
  b.controller.trackAppStore("button");
  b.controller.trackAppStore("qr_link");
  b.controller.trackAppStore("private arbitrary value");
  const app = b.events().filter(e => e[1] === "app_store_click");
  assert.equal(app.length, 2);
  assert.deepEqual(app.map(e => e[2].link_placement), ["button", "qr_link"]);
  assert.ok(app.every(e => e[2].site_language === "en" && e[2].page_path === "/en/projects/"));
  assert.ok(app.every(e => e[2].app_id === "6815378368"));
  assert.doesNotMatch(JSON.stringify(b.win.dataLayer), /private arbitrary|first_open|file_download|app_install|private-value/);
  b.controller.choose("rejected");
  b.controller.trackAppStore("button");
  assert.deepEqual(b.events(), []);
});

test("old v2 consent needs reconfirmation while old refusal keeps its expiry", () => {
  for (const choice of ["accepted", "rejected"]) {
    const b = browser("/projetos/");
    const record = JSON.stringify({choice, expiresAt:10000, policyVersion:2});
    b.stored.set(CONSENT_KEY, record);
    b.controller.sync();
    assert.equal(b.scripts.length, 0);
    assert.equal(b.controller.choice(), choice === "rejected" ? "rejected" : null);
    assert.equal(b.stored.get(CONSENT_KEY), record);
  }
});

test("De Rolê clicks use their own app ID and retain consent and test separation", () => {
  const b = browser('/projetos/', 'tetelestai.tech', '?modo_teste=1');
  b.controller.trackAppStore('button', '6820150552');
  assert.deepEqual(b.events(), []);
  b.controller.choose('accepted');
  b.controller.trackAppStore('button');
  b.controller.trackAppStore('button', '6820150552');
  b.controller.trackAppStore('qr_link', '6820150552');
  b.controller.trackAppStore('button', 'unknown-app');
  const app = b.events().filter(e => e[1] === 'app_store_click');
  assert.deepEqual(app.map(e => e[2].app_id), ['6815378368', '6820150552', '6820150552']);
  assert.ok(app.every(e => e[2].test_mode === 'internal' && e[2].traffic_type === 'internal'));
  assert.doesNotMatch(JSON.stringify(b.win.dataLayer), /unknown-app|app_install|first_open/);
  b.controller.choose('rejected');
  b.controller.trackAppStore('button', '6820150552');
  assert.deepEqual(b.events(), []);
});

test("video scope requires a fresh acceptance of v4 but preserves a valid v3 refusal", () => {
  const accepted = browser("/projetos/");
  const oldAcceptance = JSON.stringify({ choice: "accepted", expiresAt: 10000, policyVersion: 3 });
  accepted.stored.set(CONSENT_KEY, oldAcceptance);
  accepted.controller.sync();
  assert.equal(accepted.scripts.length, 0, "the prior App Store-only acceptance must not enable the expanded scope");
  assert.equal(accepted.controller.choice(), null);
  assert.equal(accepted.stored.get(CONSENT_KEY), oldAcceptance, "inspection must not silently renew consent");
  assert.equal(accepted.controller.choose("accepted"), true);
  assert.equal(JSON.parse(accepted.stored.get(CONSENT_KEY)).policyVersion, 4);
  assert.deepEqual(accepted.events().map(e => e[1]), ["page_view"], "previous clicks must not be replayed");

  const refused = browser("/projetos/");
  const oldRefusal = JSON.stringify({ choice: "rejected", expiresAt: 10000, policyVersion: 3 });
  refused.stored.set(CONSENT_KEY, oldRefusal);
  refused.controller.sync();
  assert.equal(refused.controller.choice(), "rejected");
  assert.equal(refused.stored.get(CONSENT_KEY), oldRefusal);
  assert.equal(refused.scripts.length, 0);
});

test("video clicks measure only the two De Rolê link placements with bounded context", () => {
  for (const [path, search, mode, traffic, language] of [
    ["/projetos/", "", "public", "external", "pt"],
    ["/en/projects/", "?modo_teste=1", "internal", "internal", "en"],
  ]) {
    const b = browser(path, "tetelestai.tech", search);
    assert.equal(typeof b.controller.trackAppVideo, "function", "the explicit video-link measurement boundary is required");
    b.controller.choose("accepted");
    assert.deepEqual(b.events().map(e => e[1]), ["page_view"], "a page view must not become a video click");
    b.controller.trackAppVideo("cover", "6820150552");
    b.controller.trackAppVideo("text", "6820150552");
    for (const [placement, appId] of [["button", "6820150552"], ["qr_link", "6820150552"], ["arbitrary-private-value", "6820150552"], ["cover", "6815378368"], ["cover", "unknown"], ["cover", 6820150552]]) {
      b.controller.trackAppVideo(placement, appId);
    }
    const video = b.events().filter(e => e[1] === "app_video_click");
    assert.equal(video.length, 2);
    assert.deepEqual(video.map(e => e[2].link_placement), ["cover", "text"]);
    for (const [, , params] of video) {
      assert.deepEqual(params, {
        page_location: `https://tetelestai.tech${path}`, page_referrer: "https://www.google.com/",
        page_title: "Criação de sites", site_language: language,
        test_mode: mode, traffic_type: traffic, send_to: "G-VKJKP1MBYF",
        page_path: path, app_id: "6820150552", link_placement: params.link_placement,
      });
    }
    assert.doesNotMatch(JSON.stringify(b.win.dataLayer), /video_start|video_complete|video_progress|file_download|app_install|first_open|private-value|modo_teste/);
  }
});

test("video clicks never bypass missing, rejected or withdrawn consent and are not replayed", () => {
  const b = browser("/projetos/");
  assert.equal(typeof b.controller.trackAppVideo, "function");
  b.controller.trackAppVideo("cover", "6820150552");
  assert.equal(b.scripts.length, 0);
  assert.deepEqual(b.events(), []);
  b.controller.choose("rejected");
  b.controller.trackAppVideo("text", "6820150552");
  assert.deepEqual(b.events(), []);
  b.controller.choose("accepted");
  assert.deepEqual(b.events().map(e => e[1]), ["page_view"]);
  b.controller.trackAppVideo("cover", "6820150552");
  assert.equal(b.events().at(-1)[1], "app_video_click");
  b.controller.choose("rejected");
  b.controller.trackAppVideo("text", "6820150552");
  assert.deepEqual(b.events(), []);
  assert.equal(b.win[`ga-disable-${MEASUREMENT_ID}`], true);
  assert.equal(b.reloads, 1);
});

test("video clicks stop at expiration without extending the 180-day consent", () => {
  const b = browser("/projetos/");
  assert.equal(typeof b.controller.trackAppVideo, "function");
  b.controller.choose("accepted");
  const original = b.stored.get(CONSENT_KEY);
  b.setNow(2000);
  b.controller.trackAppVideo("cover", "6820150552");
  assert.equal(b.stored.get(CONSENT_KEY), original);
  b.setNow(1000 + CONSENT_DURATION);
  b.controller.trackAppVideo("text", "6820150552");
  assert.deepEqual(b.events(), []);
  assert.equal(b.controller.choice(), null);
  assert.equal(b.reloads, 1);
});

test("video clicks remain blocked on development hosts, unmeasured routes and unavailable storage", () => {
  for (const [path, host] of [["/projetos/", "localhost"], ["/en/projects/", "127.0.0.1"], ["/privacidade/", "tetelestai.tech"], ["/de-role/suporte/", "tetelestai.tech"]]) {
    const b = browser(path, host);
    assert.equal(typeof b.controller.trackAppVideo, "function");
    b.controller.choose("accepted");
    b.controller.trackAppVideo("cover", "6820150552");
    assert.equal(b.scripts.length, 0);
    assert.deepEqual(b.events(), []);
  }
  const b = browser("/projetos/");
  b.controller.choose("accepted");
  const get = b.win.localStorage.getItem;
  b.win.localStorage.getItem = key => {
    if (key === CONSENT_KEY) throw Error("unavailable");
    return get(key);
  };
  b.controller.trackAppVideo("text", "6820150552");
  assert.deepEqual(b.events(), []);
  assert.equal(b.reloads, 1);
});

test("a test-mode change blocks video clicks from the earlier tag instead of mislabeling them", () => {
  const b = browser("/en/projects/");
  assert.equal(typeof b.controller.trackAppVideo, "function");
  b.controller.choose("accepted");
  b.stored.set("tetelestai:test-mode:v1", "1");
  b.controller.trackAppVideo("cover", "6820150552");
  assert.deepEqual(b.events(), []);
  assert.equal(b.reloads, 1);
});

test("WhatsApp clicks report a safe placement and Essencial checkout clicks are measured after consent", () => {
  const b = browser("/carreira-internacional/");
  b.controller.trackCheckout("hero");
  assert.equal(b.events().length, 0, "nothing is sent before consent");
  b.controller.choose("accepted");
  b.controller.trackWhatsApp("price_note");
  b.controller.trackWhatsApp("<script>");
  b.controller.trackWhatsApp();
  b.controller.trackCheckout("sticky");
  b.controller.trackCheckout("section_coaching", "acompanhado");
  b.controller.trackCheckout("hero", "other");
  const [, wa1, wa2, wa3, checkout, coaching, unknown] = b.events();
  assert.equal(coaching[2].product_name, "acompanhado");
  assert.equal(unknown[2].product_name, "essencial", "unknown products fall back");
  assert.equal(wa1[2].contact_placement, "price_note");
  assert.equal(wa2[2].contact_placement, "contact_section", "unexpected values fall back");
  assert.equal(wa3[2].contact_placement, "contact_section");
  assert.equal(checkout[1], "checkout_click");
  assert.equal(checkout[2].product_name, "essencial");
  assert.equal(checkout[2].link_placement, "sticky");
  assert.equal(checkout[2].page_path, "/carreira-internacional/");
});
