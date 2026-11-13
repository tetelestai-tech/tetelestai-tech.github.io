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
      // Opening chosen on 28/10 (option A): the landing page first, a quote second, nothing else.
      const actions = [...(hero ?? '').matchAll(/<a\b[^>]*href="([^"]*)"/g)].map(match => match[1]);
      assert.equal(actions.length, 2, `${path}: exactly two actions in the opening`);
      assert.ok(actions.every(href => href.startsWith('https://wa.me/556184711930')), `${path}: both opening actions go to the company WhatsApp`);
      assert.match(decodeURIComponent(actions[0]), /landing page/i, `${path}: the primary action asks for the landing page`);
      assert.doesNotMatch(decodeURIComponent(actions[1]), /landing page/i, `${path}: the secondary action asks for a quote`);
      assert.ok(hero.includes('class="trust"'), `${path}: trust facts under the actions`);
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
      assert.match(hero, /href="\/projetos\/(?:infinity-car-studio|respeitavel-feijuca)\/"/, `${path}: opening links to a real project`);
      assert.ok(html.includes('id="projects"'));
    }
    for (const path of ['/carreira-internacional/', '/capacitacao-em-ia/']) {
      assert.ok(!render(path).includes('id="projects"'), `${path}: no unrelated delivery claims`);
    }
  } finally {
    await renderer.close();
  }
});

// Decided by Carlos on 13/11/2026 (direction "cauda"): the site states the exit rule of the monthly fee
// (plan of 11/11: no minimum term, 30 days' notice, no fee) wherever the price is shown, in both languages.
test('the monthly fee exit rule is stated beside the price and in the FAQs, in both languages', async () => {
  const renderer = await createServer({
    appType: 'custom',
    server: { middlewareMode: true, hmr: false, ws: false, watch: null },
    optimizeDeps: { noDiscovery: true, include: [] },
  });
  try {
    const { App } = await renderer.ssrLoadModule('/src/App.jsx');
    const { LANDING_RECEIPT, PEOPLE, peopleFor } = await renderer.ssrLoadModule('/src/home-content.mjs');
    const render = pathname => renderToStaticMarkup(createElement(App, { pathname }));
    const expected = {
      '/': { rule: /Sem prazo mínimo e sem multa/, notice: /30 dias/, question: 'Posso cancelar a mensalidade quando quiser?', row: 'Cancelamento' },
      '/en/': { rule: /No minimum term, no cancellation fee/, notice: /30 days/, question: 'Can I cancel the monthly fee whenever I want?', row: 'Cancellation' },
      '/criacao-de-landing-pages/': { notice: /30 dias/, question: 'Posso cancelar a mensalidade quando quiser?', row: 'Cancelamento' },
      '/en/landing-pages/': { notice: /30 days/, question: 'Can I cancel the monthly fee whenever I want?', row: 'Cancellation' },
    };
    for (const [path, want] of Object.entries(expected)) {
      const html = render(path);
      if (want.rule) {
        const price = html.match(/<section[^>]*id="price"[\s\S]*?<\/section>/)?.[0] ?? '';
        assert.match(price, want.rule, `${path}: exit rule beside the price`);
        assert.match(price, want.notice, `${path}: notice period beside the price`);
      }
      const receipt = html.match(/<div class="receipt">[\s\S]*?<p class="receipt__note">/)?.[0] ?? '';
      assert.ok(receipt.includes(`<span>${want.row}</span>`), `${path}: cancellation row on the price note`);
      const faq = html.match(/<section class="faq-section[\s\S]*?<\/section>/)?.[0] ?? '';
      assert.ok(faq.includes(`<summary>${want.question}</summary>`), `${path}: cancellation question`);
      assert.match(faq, want.notice, `${path}: notice period in the answer`);
      assert.doesNotMatch(html, /fidelidade|lock-in/i, `${path}: no loyalty wording`);
    }
    // The two price notes describe the same offer: the monthly fee and the first-year domain in separate rows.
    assert.equal(LANDING_RECEIPT.pt.rows.length, LANDING_RECEIPT.en.rows.length);
    assert.ok(LANDING_RECEIPT.en.rows.some(([label]) => label === 'Monthly fee'));
    assert.ok(!LANDING_RECEIPT.en.rows.some(([label]) => label === 'Domain and hosting'), 'hosting is part of the monthly fee since 09/11');

    // "Quem faz": a profile link appears only when its address is set; nothing is invented.
    for (const locale of ['pt', 'en']) {
      assert.deepEqual(peopleFor(locale, {}).map(person => person.links), [[], []], `${locale}: no link without an address`);
      const [carlos, gabriela] = peopleFor(locale, { carlosLinkedIn: 'https://www.linkedin.com/in/exemplo/', carlosSite: 'https://carlosviegas.dev/' });
      assert.deepEqual(carlos.links.map(link => link.href), ['https://www.linkedin.com/in/exemplo/', 'https://carlosviegas.dev/']);
      assert.deepEqual(gabriela.links, []);
      assert.equal(peopleFor(locale).length, PEOPLE[locale].length);
    }
    const about = render('/').match(/<section[^>]*id="about"[\s\S]*?<\/section>/)?.[0] ?? '';
    assert.ok(!/github\.com/.test(about), 'GitHub stays out of the team block');
  } finally {
    await renderer.close();
  }
});
