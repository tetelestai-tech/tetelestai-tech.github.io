import test from "node:test";
import assert from "node:assert/strict";
import { createAnalyticsController, CONSENT_KEY, CONSENT_DURATION, MEASUREMENT_ID, measurementPath } from "../src/analytics.mjs";

function browser(path = "/", hostname = "tetelestai.tech") {
  let now = 1000;
  const stored = new Map();
  const scripts = [];
  const cookies = [];
  const timers = new Map();
  let reloads = 0;
  const win = {
    location: { pathname: path, hostname, reload() { reloads++; } },
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

test("only the four commercial pages and their explicit aliases qualify", () => {
  for (const path of ["/", "/en/", "/criacao-de-sites/", "/criacao-de-landing-pages/"]) {
    assert.equal(measurementPath(path), path);
    assert.equal(measurementPath(`${path}index.html`), path);
    if (path !== "/") assert.equal(measurementPath(path.slice(0, -1)), path);
  }
  for (const path of ["/recarga/", "/privacidade/", "/en/privacy/", "/missing/", "/en//", "/criacao-de-sites/missing/index.html"]) assert.equal(measurementPath(path), null);
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
  b.stored.set(CONSENT_KEY, JSON.stringify({ choice: "accepted", expiresAt: 10000 }));
  b.controller.sync();
  assert.equal(b.scripts.length, 0, "readable but unwritable storage must not enable tracking");
});

test("returning visitors receive only the remaining consent duration for cookies", () => {
  const b = browser();
  b.stored.set(CONSENT_KEY, JSON.stringify({ choice: "accepted", expiresAt: 1000 + 3600 * 1000 }));
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
