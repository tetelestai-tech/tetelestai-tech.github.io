const routeShells = new Map([
  ["/", "/index.html"],
  ["/en", "/en/index.html"],
  ["/en/", "/en/index.html"],
  ["/privacidade", "/privacidade/index.html"],
  ["/privacidade/", "/privacidade/index.html"],
  ["/en/privacy", "/en/privacy/index.html"],
  ["/en/privacy/", "/en/privacy/index.html"],
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
