import { COMMERCIAL_TRANSLATIONS } from "../src/localized-content.mjs";
import assert from 'node:assert/strict';
import test from 'node:test';
import { createServer } from 'vite';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { readFile } from 'node:fs/promises';
import worker from '../worker/index.js';
import { measurementPath } from '../src/analytics.mjs';

const routes = ['/projetos/', '/projetos/infinity-car-studio/', '/projetos/bolachinhas-da-vovo-juju/', '/projetos/afeto-nobre/', '/projetos/lalelis/'];


test('portfolio and case pages expose verified deliveries, real links and navigation before hydration', async () => {
  const renderer = await createServer({appType:'custom',server:{middlewareMode:true,hmr:false,ws:false,watch:null},optimizeDeps:{noDiscovery:true,include:[]}});
  try {
    const { App } = await renderer.ssrLoadModule('/src/App.jsx');
    const render = pathname => renderToStaticMarkup(createElement(App,{pathname}));
    const portfolio = render('/projetos/');
    assert.ok(!portfolio.includes('Este endereço não existe'), 'portfolio route must resolve');
    for (const name of ['Infinity Car Studio','Bolachinhas da Vovó Juju','Afeto Nobre','LaLeLis']) assert.ok(portfolio.includes(name));
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
    for (const [path, name] of [['/criacao-de-sites/','Infinity Car Studio'],['/criacao-de-landing-pages/','Bolachinhas da Vovó Juju']]) {
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
    assert.ok(afeto.includes('href="/projetos/lalelis/"'), 'Afeto Nobre points to the next project');
    const lalelis=render('/projetos/lalelis/');
    assert.ok(lalelis.includes('href="https://lalelis.com.br/"'));
    assert.ok(lalelis.includes('href="/projetos/infinity-car-studio/"'), 'the last case returns to the first project');
    assert.ok(!/wa\.me\/556192505727/.test(afeto+lalelis), "client WhatsApp numbers stay on the clients' own sites");
    assert.ok(!/aumentou.{0,30}(vendas|conversão)/i.test(portfolio));
  } finally { await renderer.close(); }
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
