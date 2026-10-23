import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createServer } from 'vite';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import worker from '../worker/index.js';
import { measurementPath } from '../src/analytics.mjs';

export const pairs = [
  ['/criacao-de-sites/','/en/website-development/'],
  ['/criacao-de-landing-pages/','/en/landing-pages/'],
  ['/carreira-internacional/','/en/international-career/'],
  ['/capacitacao-em-ia/','/en/ai-training/'],
  ['/projetos/','/en/projects/'],
  ['/projetos/infinity-car-studio/','/en/projects/infinity-car-studio/'],
  ['/projetos/bolachinhas-da-vovo-juju/','/en/projects/bolachinhas-da-vovo-juju/'],
];

test('English home restores service shortcuts and every translated page preserves locale and equivalent selector', async () => {
  const server=await createServer({appType:'custom',server:{middlewareMode:true,hmr:false,ws:false,watch:null},optimizeDeps:{noDiscovery:true,include:[]}});
  try {
    const {App}=await server.ssrLoadModule('/src/App.jsx');
    const render=path=>renderToStaticMarkup(createElement(App,{pathname:path}));
    const home=render('/en/');
    for (const [,en] of pairs) assert.ok(home.includes(`href="${en}"`),`Missing English shortcut ${en}`);
    for (const [pt,en] of pairs) {
      const english=render(en), portuguese=render(pt);
      assert.ok(!english.includes('This address does not exist'),en);
      assert.ok(english.includes(`href="${pt}" lang="pt-BR"`),`PT counterpart ${en}`);
      assert.ok(portuguese.includes(`href="${en}" lang="en"`),`EN counterpart ${pt}`);
      assert.ok(english.includes('href="/en/projects/"'), 'English pages link to the English portfolio');
      for (const target of pairs.map(p=>p[0])) {
        const links=[...english.matchAll(/<a\b[^>]*>/g)].map(m=>m[0]);
        assert.ok(!links.some(a=>a.includes(`href="${target}"`)&&!a.includes('lang="pt-BR"')),`Unexpected PT link ${target} on ${en}`);
      }
      assert.ok(!/Conhecer o projeto|Ver portfólio completo|Página inicial em inglês|Antes de começar/.test(english));
      assert.equal(measurementPath(en),en,'approved English pages are eligible only through consent');
    }
  } finally { await server.close(); }
});

test('translated static pages have reciprocal metadata and English schema, and exact GET/HEAD routes',async()=>{
  for (const [pt,en] of pairs) {
    for (const [path,lang] of [[pt,'pt-BR'],[en,'en']]) {
      const html=await readFile(new URL(`../dist/client${path}index.html`,import.meta.url),'utf8');
      assert.ok(html.includes(`<html lang="${lang}">`));
      assert.ok(html.includes(`rel="canonical" href="https://tetelestai.tech${path}"`));
      assert.ok(html.includes(`hreflang="pt-BR" href="https://tetelestai.tech${pt}"`));
      assert.ok(html.includes(`hreflang="en" href="https://tetelestai.tech${en}"`));
      const graph=JSON.parse(html.match(/id="structured-data"[^>]*>([^<]+)<\/script>/)[1])['@graph'];
      assert.equal(graph.find(n=>n['@type']==='WebPage').url,'https://tetelestai.tech'+path);
      assert.equal(graph.find(n=>n['@type']==='WebPage').inLanguage,lang);
    }
    for (const path of [en,en.slice(0,-1)]) for (const method of ['GET','HEAD']) {
      const response=await worker.fetch(new Request('https://example.test'+path,{method,headers:{accept:'text/html'}}),{ASSETS:{fetch:async request=>new Response(method==='HEAD'?null:'shell',{status:new URL(request.url).pathname===en+'index.html'?200:404})}});
      assert.equal(response.status,200,`${method} ${path}`);
    }
  }
  for (const path of ['/en/projects/unknown/','/en/projects//','/en/website-development//','/en/projects/infinity-car-studio/extra/']) {
    const response=await worker.fetch(new Request('https://example.test'+path,{headers:{accept:'text/html'}}),{ASSETS:{fetch:async()=>new Response(null,{status:404})}});
    assert.equal(response.status,404,path);
  }
});
