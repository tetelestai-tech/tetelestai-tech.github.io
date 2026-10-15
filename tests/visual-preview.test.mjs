import assert from 'node:assert/strict';
import test from 'node:test';
import { createServer } from 'vite';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

test('approved preview makes contact accessible, presents each service once, and scopes projects correctly', async () => {
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
      assert.ok(hero?.includes('href="https://wa.me/556184711930"'), `${path}: contact in opening`);
      assert.equal((hero?.match(/<a\b/g) ?? []).length, 1, `${path}: opening has only the approved WhatsApp action`);
      assert.equal((html.match(/>Carreira internacional<\/h[23]>/g) ?? []).length, path === '/' ? 1 : 0);
      assert.equal((html.match(/>Automação e soluções digitais<\/h[23]>/g) ?? []).length, path === '/' ? 1 : 0);
      assert.equal((html.match(/>Capacitação em IA<\/h[23]>/g) ?? []).length, path === '/' ? 1 : 0);
      assert.ok(html.includes('id="projects"'), 'Projects menu must have a destination on each homepage');
      assert.ok(!html.includes('id="ios-apps"'), 'app presentation stays on the full portfolio page');
    }
    for (const path of ['/criacao-de-sites/', '/criacao-de-landing-pages/']) {
      const html = render(path);
      assert.ok(html.indexOf('id="projects"') < html.indexOf('id="use-cases-title"'), `${path}: show projects before process and scope`);
      assert.ok(html.match(/<section id="home"[\s\S]*?href="#projects"[\s\S]*?<\/section>/), 'opening links to projects');
      assert.ok(html.includes('Projetos em destaque'));
    }
    for (const path of ['/carreira-internacional/', '/capacitacao-em-ia/']) {
      assert.ok(!render(path).includes('id="projects"'), `${path}: no unrelated delivery claims`);
    }
  } finally {
    await renderer.close();
  }
});
