import assert from 'node:assert/strict';
import test from 'node:test';
import { createServer } from 'vite';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

const whatsapp = /href="https:\/\/wa\.me\/556184711930(?:\?text=[^"]+)?"/g;

test('redesign keeps one WhatsApp action in each opening, presents each front once, and scopes projects correctly', async () => {
  const renderer = await createServer({
    appType: 'custom',
    server: { middlewareMode: true, hmr: false, ws: false, watch: null },
    optimizeDeps: { noDiscovery: true, include: [] },
  });
  try {
    const { App } = await renderer.ssrLoadModule('/src/App.jsx');
    const render = pathname => renderToStaticMarkup(createElement(App, { pathname }));
    for (const path of ['/', '/en/']) {
      const html = render(path);
      const hero = html.match(/<section id="home"[\s\S]*?<\/section>/)?.[0];
      assert.equal((hero?.match(whatsapp) ?? []).length, 1, `${path}: exactly one WhatsApp action in the opening`);
      assert.ok((hero?.match(/<a\b/g) ?? []).length <= 2, `${path}: the opening offers at most one secondary link`);
      assert.ok(hero.includes('href="#projects"'), `${path}: the secondary link leads to live projects`);
      const fronts = path === '/' ? ['Sites, landing pages e apps', 'Carreira internacional em TI', 'Capacitação em IA'] : ['Websites, landing pages and apps', 'International careers in tech', 'AI training'];
      for (const front of fronts) assert.equal((html.match(new RegExp(`>${front}</h3>`, 'g')) ?? []).length, 1, `${path}: ${front}`);
      assert.ok(html.includes('id="projects"'), 'Projects link must have a destination on each homepage');
      assert.ok(!html.includes('id="ios-apps-title"'), 'app presentation stays on the full portfolio page');
      assert.ok(html.includes('class="receipt"'), 'the price note is visible on the homepage');
    }
    for (const path of ['/criacao-de-sites/', '/criacao-de-landing-pages/']) {
      const html = render(path);
      const hero = html.match(/<section id="home"[\s\S]*?<\/section>/)?.[0];
      assert.equal((hero?.match(whatsapp) ?? []).length >= 1, true, `${path}: WhatsApp action in the opening`);
      assert.match(hero, /href="\/projetos\/(?:infinity-car-studio|bolachinhas-da-vovo-juju|afeto-nobre|lalelis)\/"/, `${path}: opening links to a real project`);
      assert.ok(html.includes('id="projects"'));
    }
    for (const path of ['/carreira-internacional/', '/capacitacao-em-ia/']) {
      assert.ok(!render(path).includes('id="projects"'), `${path}: no unrelated delivery claims`);
    }
  } finally {
    await renderer.close();
  }
});
