# Prototype Instructions

Run the local server yourself and open the preview in the browser available to this environment. Do not give the user server-start instructions when you can run it.

Before making substantial visual changes, use the available Product Design workflow when the visual source is unclear or no longer matches the current goal. When the user gives durable prototype-specific design feedback, preferences, or decisions, record them in `AGENTS.md`.

When implementing from a selected generated mock, treat that image as the source of truth for layout, component anatomy, density, spacing, color, typography, visible content, and hierarchy.

Build app UI in `src/`. Preserve the verified localized-shell and strict-route behavior in `.openai/hosting.json`, `worker/index.js`, `scripts/prepare-sites-build.mjs`, and `tests/sites-worker.test.mjs` so the same local prototype can be handed to Sites. Before a Sites handoff, run `npm run build` and `npm run test:sites`; the build must leave localized HTML shells plus `dist/server/index.js` and `dist/.openai/hosting.json`.

## Tetelestai design decisions

- Visual source of truth: `design/reference-approved.png`.
- Preserve the approved dark institutional direction, explicit Christian cross / letter T symbol, cyan-on-navy palette, horizontal service rows, and centered hero composition.
- Wordmark typography: Michroma 400. Body/UI typography: Inter Variable.
- Approved slogan: `Tecnologia com propósito. Oportunidades sem fronteiras.`
- Confirmed offers: international career consulting for technology professionals; AI model training and evaluation; practical AI training for people and companies.
- Do not claim guaranteed interviews, hiring, visas, immigration legal services, client relationships, metrics, or outcomes.
- Carlos Viegas is the technical lead; Gabriela Rosa is the administrator.
- Do not state a number of years of experience unless Carlos confirms it.
- Do not label the conversion path as scheduling while the only available action is direct WhatsApp contact.
- Privacy and not-found routes remain `noindex,nofollow`; only the PT and EN homepages belong in the sitemap.
- The local prototype must be verified before any publish, GitHub, Hostinger, domain, or DNS action.
