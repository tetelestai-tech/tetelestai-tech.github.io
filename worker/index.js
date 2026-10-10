const routeShells = new Map([
  ["/de-role/suporte", "/de-role/suporte/index.html"],
  ["/de-role/suporte/", "/de-role/suporte/index.html"],
  ["/", "/index.html"],
  ["/criacao-de-sites", "/criacao-de-sites/index.html"],
  ["/criacao-de-sites/", "/criacao-de-sites/index.html"],
  ["/criacao-de-landing-pages", "/criacao-de-landing-pages/index.html"],
  ["/criacao-de-landing-pages/", "/criacao-de-landing-pages/index.html"],
  ["/en", "/en/index.html"],
  ["/carreira-internacional", "/carreira-internacional/index.html"],
  ["/carreira-internacional/", "/carreira-internacional/index.html"],
  ["/capacitacao-em-ia", "/capacitacao-em-ia/index.html"],
  ["/capacitacao-em-ia/", "/capacitacao-em-ia/index.html"],
  ["/en/", "/en/index.html"],
  ["/privacidade", "/privacidade/index.html"],
  ["/privacidade/", "/privacidade/index.html"],
  ["/en/privacy", "/en/privacy/index.html"],
  ["/en/privacy/", "/en/privacy/index.html"],
  ["/termos", "/termos/index.html"],
  ["/termos/", "/termos/index.html"],
  ["/en/terms", "/en/terms/index.html"],
  ["/en/terms/", "/en/terms/index.html"],
  ["/exclusao-de-dados", "/exclusao-de-dados/index.html"],
  ["/exclusao-de-dados/", "/exclusao-de-dados/index.html"],
  ["/en/data-deletion", "/en/data-deletion/index.html"],
  ["/en/data-deletion/", "/en/data-deletion/index.html"],
  ["/recarga", "/recarga/index.html"],
  ["/recarga/", "/recarga/index.html"],
  ["/recarga/suporte", "/recarga/suporte/index.html"],
  ["/recarga/suporte/", "/recarga/suporte/index.html"],
  ["/recarga/privacidade", "/recarga/privacidade/index.html"],
  ["/recarga/privacidade/", "/recarga/privacidade/index.html"],
]);

export default {
  async fetch(request, env) {
    const response = await env.ASSETS.fetch(request);
    const acceptsHtml = request.headers.get("accept")?.includes("text/html");

    if (response.status !== 404 || !acceptsHtml || !["GET", "HEAD"].includes(request.method)) {
      return response;
    }

    const requestUrl = new URL(request.url);
    const routeShell = routeShells.get(requestUrl.pathname);
    if (!routeShell) return response;

    requestUrl.pathname = routeShell;
    requestUrl.search = "";
    return env.ASSETS.fetch(new Request(requestUrl, request));
  },
};
