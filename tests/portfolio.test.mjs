import { COMMERCIAL_TRANSLATIONS } from "../src/localized-content.mjs";
import assert from 'node:assert/strict';
import test from 'node:test';
import { createServer } from 'vite';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { readFile } from 'node:fs/promises';
import worker from '../worker/index.js';
import { measurementPath } from '../src/analytics.mjs';

const routes = ['/projetos/', '/projetos/infinity-car-studio/', '/projetos/bolachinhas-da-vovo-juju/', '/projetos/afeto-nobre/', '/projetos/lalelis/', '/projetos/respeitavel-feijuca/'];


test('portfolio and case pages expose verified deliveries, real links and navigation before hydration', async () => {
  const renderer = await createServer({appType:'custom',server:{middlewareMode:true,hmr:false,ws:false,watch:null},optimizeDeps:{noDiscovery:true,include:[]}});
  try {
    const { App } = await renderer.ssrLoadModule('/src/App.jsx');
    const render = pathname => renderToStaticMarkup(createElement(App,{pathname}));
    const portfolio = render('/projetos/');
    assert.ok(!portfolio.includes('Este endereço não existe'), 'portfolio route must resolve');
    for (const name of ['Respeitável Feijuca','Infinity Car Studio','Bolachinhas da Vovó Juju','Afeto Nobre','LaLeLis']) assert.ok(portfolio.includes(name));
    for (const path of routes.slice(1)) assert.ok(portfolio.includes(`href="${path}"`));
    assert.ok(portfolio.includes('Aplicativos iOS'));
    assert.ok(portfolio.includes('Tetelestai: Tempo de Recarga'));
    assert.ok(portfolio.includes('href="https://apps.apple.com/br/app/id6815378368?pt=129504047&amp;ct=site_tetelestai_botao&amp;mt=8"'));
    assert.ok(portfolio.includes('/assets/projects/recarga-app-store-qr.png'));
    assert.ok(portfolio.includes('id="project-de-role-title"'));
    assert.ok(portfolio.includes('href="https://apps.apple.com/br/app/id6820150552"'));
    assert.ok(portfolio.includes('/assets/projects/de-role-inicio.webp'));
    assert.ok(portfolio.includes('/assets/projects/de-role-app-store-qr.png'));
    const englishPortfolio = render('/en/projects/');
    assert.ok(englishPortfolio.includes('Team word game'));
    assert.ok(englishPortfolio.includes('href="https://apps.apple.com/br/app/id6820150552"'));
    assert.ok(!/Projetos próprios|Projeto próprio|TestFlight|aguardando revisão|Site Tetelestai/.test(portfolio));
    for (const path of ['/', '/en/', ...routes, '/criacao-de-sites/']) {
      assert.ok(render(path).includes(`href="${path==='/en/'?'/en/projects/':'/projetos/'}"`), `${path} must expose portfolio navigation`);
      const header = render(path).match(/<header[\s\S]*?<\/header>/)?.[0];
      assert.ok(header.includes(`href="${path === '/en/' ? '/en/projects/' : '/projetos/'}"`), 'Projects navigation must lead to the portfolio page');
    }
    for (const [path, name] of [['/criacao-de-sites/','Infinity Car Studio'],['/criacao-de-landing-pages/','Respeitável Feijuca']]) {
      const html=render(path);
      assert.ok(html.indexOf(name) > -1 && html.indexOf(name) < html.indexOf('class="faq-section'), `${path}: a real client project appears before the FAQ`);
      assert.ok(html.indexOf('id="projects"') < html.indexOf('class="faq-section'));
    }
    for (const path of ['/carreira-internacional/','/capacitacao-em-ia/']) {
      assert.ok(!render(path).includes('Infinity Car Studio'), 'digital cases must not imply career/training outcomes');
    }
    assert.ok(render(routes[1]).includes('href="https://infinitycarstudio.com.br/"'));
    const juju=render(routes[2]);
    assert.ok(juju.includes('href="https://bolachinhadavovojuju.com.br/"'));
    assert.ok(juju.includes('Instagram'));
    const afeto=render('/projetos/afeto-nobre/');
    assert.ok(afeto.includes('href="https://afetonobre.com.br/"'));
    assert.ok(afeto.includes('/assets/portfolio/afeto-desktop.webp'));
    assert.ok(afeto.includes('href="/projetos/bolachinhas-da-vovo-juju/"'), 'Afeto Nobre points to the next project');
    const lalelis=render('/projetos/lalelis/');
    assert.ok(lalelis.includes('href="https://lalelis.com.br/"'));
    assert.ok(lalelis.includes('href="/projetos/afeto-nobre/"'), 'LaLeLis points to its sister brand next');
    assert.ok(juju.includes('href="/projetos/respeitavel-feijuca/"'), 'the last case returns to the first project');
    const feijuca=render('/projetos/respeitavel-feijuca/');
    assert.ok(feijuca.includes('href="https://respeitavelfeijuca.com.br/"'));
    assert.ok(feijuca.includes('/assets/portfolio/feijuca-desktop.webp'));
    assert.ok(feijuca.includes('href="/projetos/infinity-car-studio/"'), 'Feijuca points to the next project');
    assert.ok(!/wa\.me\/5561992559210/.test(feijuca), "the client's WhatsApp stays on the client's site");
    const home=render('/');
    assert.ok(home.indexOf('case case--featured') > -1 && home.indexOf('case case--featured') < home.indexOf('>Infinity Car Studio</a>'), 'Feijuca is the featured first card on the home');
    const order = ['Respeitável Feijuca','Infinity Car Studio','LaLeLis','Afeto Nobre','Bolachinhas da Vovó Juju'].map(name => portfolio.indexOf(`>${name}</a>`));
    assert.ok(order.every(i => i > -1), 'every client case is listed');
    assert.deepEqual([...order].sort((x,y)=>x-y), order, 'portfolio order chosen on 2026-10-28');
    assert.ok(!/wa\.me\/556192505727/.test(afeto+lalelis), "client WhatsApp numbers stay on the clients' own sites");
    assert.ok(!/aumentou.{0,30}(vendas|conversão)/i.test(portfolio));
    // Scroll preview (2026-10-28): every frame names its whole-page capture, which never loads with the page.
    for (const html of [portfolio, feijuca, home, render('/criacao-de-landing-pages/'), render('/criacao-de-sites/')]) {
      const fulls = html.match(/data-full="[^"]+"/g) ?? [];
      assert.ok(fulls.length > 0, 'the frames offer the whole page');
      assert.ok(fulls.every(attr => /-(desktop|mobile)-full\.webp"$/.test(attr)));
      assert.ok(!/<img[^>]+src="[^"]+-full\.webp"/.test(html), 'the whole-page capture is not in the initial HTML');
    }
    assert.equal((portfolio.match(/<article class="split case-row"[^>]*data-shot-zone/g) ?? []).length, 5, 'each portfolio row is one hover zone');
    assert.ok(feijuca.includes('data-full="/assets/portfolio/feijuca-mobile-full.webp"'), 'the phone frame scrolls too');
    assert.ok(feijuca.includes('data-video="/assets/portfolio/feijuca-desktop.mp4"') && feijuca.includes('data-video-webm="/assets/portfolio/feijuca-mobile.webm"'), 'Feijuca frames play the recording of the site');
    assert.ok(!/<video[^>]+src="\/assets\/portfolio\//.test(home + portfolio + feijuca), 'the recordings are not in the initial HTML');
  } finally { await renderer.close(); }
});

test('whole-page captures and recordings match their posters and stay light', async () => {
  const { CLIENT_PROJECTS } = await import('../src/portfolio-content.mjs');
  const size = bytes => {
    // WebP VP8 (lossy) frame header: width/height 14 bits after the start code.
    const at = bytes.indexOf(Buffer.from([0x9d, 0x01, 0x2a]));
    assert.ok(at > 0, 'lossy WebP');
    return [bytes.readUInt16LE(at + 3) & 0x3fff, bytes.readUInt16LE(at + 5) & 0x3fff];
  };
  for (const project of CLIENT_PROJECTS) {
    for (const [poster, full, width, height] of [[project.desktop, project.desktopFull, 1265, 889], [project.mobile, project.mobileFull, 375, 812]]) {
      const [pw, ph] = size(await readFile(new URL(`../public${poster}`, import.meta.url)));
      const fullBytes = await readFile(new URL(`../public${full}`, import.meta.url));
      const [fw, fh] = size(fullBytes);
      assert.deepEqual([pw, ph], [width, height], poster);
      assert.equal(fw, width, full);
      assert.ok(fh > height, `${full} is longer than one screen`);
      assert.ok(fullBytes.length < 520000, `${full} stays light enough to load on hover`);
    }
    for (const video of [project.desktopVideo, project.mobileVideo, project.desktopVideoWebm, project.mobileVideoWebm].filter(Boolean)) {
      const bytes = await readFile(new URL(`../public${video}`, import.meta.url));
      assert.ok(bytes.length < 2300000, `${video} stays light enough to load on hover`);
      if (video.endsWith('.mp4')) assert.ok(bytes.indexOf('moov') > -1 && bytes.indexOf('moov') < bytes.indexOf('mdat'), `${video} starts playing before it finishes downloading`);
    }
  }
  const withVideo = CLIENT_PROJECTS.filter(project => project.desktopVideo).map(project => project.key);
  assert.deepEqual(withVideo, ['feijucaProject', 'infinityProject', 'lalelisProject', 'afetoProject'], 'recordings exist for the sites whose files are available');
});

test('portfolio exact route fallbacks preserve 404 for unknown project URLs', async () => {
  for (const path of routes) {
    for (const variant of [path,path.slice(0,-1)]) {
      for (const method of ['GET','HEAD']) {
        const calls=[];
        const response=await worker.fetch(new Request(`https://example.test${variant}`,{method,headers:{accept:'text/html'}}),{ASSETS:{fetch:async request=>{
          const pathname=new URL(request.url).pathname; calls.push(pathname);
          return pathname===`${path}index.html` ? new Response(method==='HEAD'?null:path,{status:200}):new Response(null,{status:404});
        }}});
        assert.equal(response.status,200,variant);
        assert.equal(calls.at(-1),`${path}index.html`);
      }
    }
    assert.equal(measurementPath(path),path,'approved portfolio pages are eligible only through consent');
  }
  for (const path of ['/projetos/desconhecido/','/projetos//','/projetos/infinity-car-studio/extra/']) {
    let calls=0;
    const response=await worker.fetch(new Request(`https://example.test${path}`,{headers:{accept:'text/html'}}),{ASSETS:{fetch:async()=>{calls++;return new Response(null,{status:404});}}});
    assert.equal(response.status,404); assert.equal(calls,1);
  }
});

test('built portfolio pages have their own metadata and the protected institutional sharing image', async () => {
  for (const path of routes) {
    const html=await readFile(new URL(`../dist/client${path}index.html`,import.meta.url),'utf8');
    assert.ok(html.includes(`rel="canonical" href="https://tetelestai.tech${path}"`));
    assert.ok(html.includes('name="robots" content="index,follow"'));
    assert.ok(html.includes('https://tetelestai.tech/assets/tetelestai-share.png'));
    assert.ok(html.includes(`hreflang="en" href="https://tetelestai.tech${COMMERCIAL_TRANSLATIONS.find(p=>p.pt===path).en}"`));
    const graph=JSON.parse(html.match(/id="structured-data"[^>]*>([^<]+)<\/script>/)[1])['@graph'];
    assert.equal(graph.find(item=>item['@type']==='WebPage').url,`https://tetelestai.tech${path}`);
    assert.ok(!graph.some(item=>item['@type']==='Service'));
  }
});
