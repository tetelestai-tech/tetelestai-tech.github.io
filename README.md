# Tetelestai website

Institutional bilingual website for Tetelestai Soluções em Tecnologia Ltda.

## Current status

- Local working prototype completed.
- Portuguese and English homepages implemented.
- Privacy routes are implemented and intentionally excluded from indexing for the first release.
- Production build and routing tests passing.
- WhatsApp is the confirmed contact and interim privacy channel; the local visual recheck passed for Portuguese and English desktop and 400 px mobile layouts.
- Public source repository: `tetelestai-tech/tetelestai-tech.github.io`; the institutional site is deployed through GitHub Pages at `https://tetelestai.tech/`.

## Architecture

- React 19 and Vite 6.
- Static, client-rendered interface with route-specific prebuilt HTML metadata shells.
- Locally hosted Michroma and Inter fonts.
- Phosphor icon library.
- No database, API, form, analytics or non-essential cookies.
- Strict production route allowlist; unknown HTML paths remain HTTP 404.
- GitHub Pages workflow prepared for `dist/client`.
- Sites-compatible server/package output also prepared under `dist/`.

## Routes

| Route | Content | Indexing |
| --- | --- | --- |
| `/` | Portuguese homepage | allowed |
| `/en/` | English homepage | allowed |
| `/privacidade/` | Portuguese privacy notice | noindex |
| `/en/privacy/` | English privacy notice | noindex |
| `/recarga/` | Tetelestai Recarga 1.0.5 web calculator, in Portuguese | noindex |
| `/recarga/suporte/` | Tetelestai Recarga app support, in Portuguese | noindex |
| `/recarga/privacidade/` | Tetelestai Recarga app privacy, in Portuguese | noindex |

The Recarga support and privacy pages use `src/recarga-content.mjs` and are prerendered into the production HTML, so both remain readable without JavaScript. Both contact channels are available near the top. Only the two institutional homepages remain in the sitemap.

The calculator is a separate Expo web release at `/recarga/`. It requires JavaScript and a connection to open. Settings, profiles and charging history stay in that browser; clearing its data removes them. They do not synchronize with another browser or the iOS app. Notifications remain exclusive to the installed app; this release does not promise offline operation.

## Updating the web calculator

The site repository contains only the compiled browser release in `public/recarga/`, including its `release.json` file hashes. The separate, local `charging-app/` source project is required only to generate a new release:

```bash
cd charging-app
npm ci
npm run check
cd ..
npm run prepare:recarga
npm run build
npm run test:sites
```

`prepare:recarga` exports with `/recarga` as the asset base path, checks the files and replaces only a validated previous release. Its conditional `charging-app/app.config.ts` setting leaves the normal native configuration unchanged. The site CI needs only the committed browser artifact, with no Expo dependencies. Review `public/recarga/release.json` and test the resulting `dist/client/recarga/` page in a browser before publishing. Never add the native project, credentials, source maps or local archives to the public site repository.

## Local commands

```bash
npm ci
npm run dev
npm run build
npm run test:sites
```

The GitHub Pages artifact is `dist/client`. The build also prepares the Sites package in `dist/server` and `dist/.openai`.

## Brand and content constraints

- Preserve the explicit Christian cross / letter-T symbol.
- Approved slogan: `Tecnologia com propósito. Oportunidades sem fronteiras.`
- Keep the three offers distinct: international career consulting, business automation and digital solutions and practical AI training.
- Use WhatsApp only through the confirmed contact link `https://wa.me/556184711930`; do not claim guaranteed interviews, hiring, visas, immigration advice, client relationships, metrics or outcomes.
- Do not state a number of years of experience unless Carlos confirms it.

## Verification

See `design-qa.md` for the browser, visual comparison, interaction and accessibility evidence.

## Deployment

See `DEPLOYMENT.md` for the recommended GitHub organization, GitHub Pages and Hostinger DNS sequence. DNS values must be rechecked against the linked official documentation at deployment time.
