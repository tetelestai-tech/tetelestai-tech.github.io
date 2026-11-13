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
      const fronts = path === '/' ? ['Serviços para pequenas empresas', 'Carreira internacional em TI', 'Capacitação em IA'] : ['Services for small businesses', 'International careers in tech', 'AI training'];
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
    // Full list of services for small businesses (Carlos, 13/11): fronts block, footer, quote sentence and description, PT and EN.
    const SERVICES = {
      '/': { front: 'Serviços para pequenas empresas', words: ['automações', 'sistemas', 'gerenciamento de marketing digital'] },
      '/en/': { front: 'Services for small businesses', words: ['automations', 'software systems', 'digital marketing management'] },
    };
    for (const [path, want] of Object.entries(SERVICES)) {
      const html = render(path);
      const fronts = html.match(/<section[^>]*id="fronts"[\s\S]*?<\/section>/)?.[0] ?? html;
      assert.ok(fronts.includes(want.front), `${path}: services front title`);
      const foot = html.match(/<footer[\s\S]*?<\/footer>/)?.[0] ?? '';
      for (const word of want.words) {
        assert.ok(fronts.toLowerCase().includes(word), `${path}: ${word} in the fronts block`);
        assert.ok(foot.toLowerCase().includes(word), `${path}: ${word} in the footer`);
      }
      assert.doesNotMatch(fronts, /a partir de|starting at|from R\$/i, `${path}: no invented price for quoted services`);
    }
    const { HOME: HOME_COPY } = await renderer.ssrLoadModule('/src/home-content.mjs');
    assert.match(HOME_COPY.pt.metaDescription, /automações, sistemas e gerenciamento de marketing digital sob orçamento/);
    assert.match(HOME_COPY.en.metaDescription, /automations, software systems and digital marketing management, quoted per project/);
    // Published profile: Carlos's LinkedIn (address sent by him on 13/11); the personal page is not live yet.
    for (const [path, label] of [['/', 'Carlos no LinkedIn'], ['/en/', 'Carlos on LinkedIn']]) {
      const about = render(path).match(/<section[^>]*id="about"[\s\S]*?<\/section>/)?.[0] ?? '';
      const links = about.match(/<a [^>]*href="https:\/\/www\.linkedin\.com\/in\/carloshsrosa\/"[^>]*>[\s\S]*?<\/a>/g) ?? [];
      assert.equal(links.length, 1, `${path}: one LinkedIn link in the team block`);
      assert.ok(links[0].includes(label), `${path}: localized label`);
      assert.match(links[0], /target="_blank"/, `${path}: opens in a new tab`);
      assert.match(links[0], /rel="[^"]*noopener[^"]*"/, `${path}: noopener`);
      assert.ok(!/\?locale=|carlosviegas\.dev|github\.com/.test(about), `${path}: no tracking parameter, unpublished page or GitHub`);
    }
  } finally {
    await renderer.close();
  }
});
