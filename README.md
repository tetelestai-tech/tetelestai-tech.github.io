# Tetelestai website

Institutional bilingual website for Tetelestai Soluções em Tecnologia Ltda.

## Current status

- Local working prototype completed.
- Portuguese and English homepages implemented.
- Privacy routes are implemented and intentionally excluded from indexing for the first release.
- Production build and routing tests passing.
- WhatsApp is the confirmed contact and interim privacy channel; the local visual recheck passed for Portuguese and English desktop and 400 px mobile layouts.
- Public source repository: `tetelestai-tech/tetelestai-tech.github.io`; GitHub Pages deployment and custom-domain DNS configuration are pending.

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
- Keep the three offers distinct: international career consulting, AI model training/evaluation and practical AI training.
- Use WhatsApp only through the confirmed contact link `https://wa.me/5561998821206`; do not claim guaranteed interviews, hiring, visas, immigration advice, client relationships, metrics or outcomes.
- Do not state a number of years of experience unless Carlos confirms it.

## Verification

See `design-qa.md` for the browser, visual comparison, interaction and accessibility evidence.

## Deployment

See `DEPLOYMENT.md` for the recommended GitHub organization, GitHub Pages and Hostinger DNS sequence. DNS values must be rechecked against the linked official documentation at deployment time.
