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
- Confirmed offers: international career consulting for technology professionals; business automation and digital solutions; practical AI training for people and companies.
- For digital solutions, prioritize WhatsApp automation, conversion-focused websites and scoped systems or MVPs; treat graphic design as part of the delivery and native mobile apps as case-dependent.
- Do not claim guaranteed interviews, hiring, visas, immigration legal services, client relationships, metrics, or outcomes.
- Carlos Viegas is the technical lead; Gabriela Rosa leads marketing and social media.
- Do not state a number of years of experience unless Carlos confirms it.
- Do not label the conversion path as scheduling while the only available action is direct WhatsApp contact.
- Visual preview authorized on 2026-10-14 and refined after banner review: preserve the centered branded hero and slogan. Use the concise line `Carreira internacional · Soluções digitais · Capacitação em IA` and its English counterpart, with more spacing around the brand and slogan, a quieter circuit background, and only the WhatsApp button with reduced glow. Remove the secondary solutions shortcut from the home hero. This supersedes the previous no-CTA hero and the first preview's long offer paragraph/two-action layout. Publication requires review of the local preview.
- Confirmed company WhatsApp (2026-09-08): `+55 61 98471-1930`; use `https://wa.me/556184711930`. The user verified that the conversation link must omit the additional mobile digit; preserve the full company phone number elsewhere. Updating this link does not connect the Chatwoot/n8n automation to WhatsApp.
- On desktop, place back-to-top links after the circuit introduction, after the detailed solution cards, and at the end of method, about, FAQ and contact.
- Keep every back-to-top control borderless and visually quiet: use the same muted-gray arrow at rest while preserving its `44 × 44 px` target, visible keyboard focus, and equal spacing above and below each desktop control.
- On desktop, keep a generous responsive gap between the service index and the circuit introduction so the image does not begin immediately after item `03`.
- Center the company-information group and localized verse: `Está consumado! João 19:30` / `It is finished! John 19:30`; render both parts at `1rem`, keep the phrase cyan and the non-wrapping reference in the primary text color, separated only by a non-breaking space.
- On mobile, use the existing circuit image behind the solutions introduction with `contain` sizing and low image-only opacity.
- Protect `public/assets/tetelestai-symbol.png`; set the entire wordmark in Michroma 400 without isolated treatment of the letter `S`.
- Use `public/assets/tetelestai-share.png` for Open Graph sharing: keep it at `1200 × 630 px`, under `600 KB`, with an opaque `#000C19` background and only the protected original symbol, without a wordmark. Center the visible symbol at approximately `504 px` high (80% of the image height), scaling the original proportionally without redrawing, recoloring or clipping any tip; keep the complete symbol inside the centered square thumbnail crop. Do not use the transparent symbol file itself as the sharing image.
- Privacy and not-found routes remain `noindex,nofollow`. The sitemap includes the PT and EN homepages and the approved PT service pages `/criacao-de-sites/` and `/criacao-de-landing-pages/`.
- Confirmed privacy and data deletion channels (2026-09-11): company WhatsApp and `contato@tetelestai.tech`. Keep both available in the PT/EN privacy, terms and deletion pages. Terms and deletion routes also remain `noindex,nofollow`; do not add them to the sitemap. Describe WhatsApp automation as in preparation until the integration is verified live.
- The local prototype must be verified before any publish, GitHub, Hostinger, domain, or DNS action.
- Keep the homepage's `PT | EN` language selector on service pages, with the same styling and active-language color. PT links to the current service page; EN links to `/en/` with the title `Página inicial em inglês` until service translations exist.
- SEO scope approved on 2026-09-28: prioritize sites and landing pages for businesses in Brazil. Prerender the PT homepage and both service pages with their real content and contact links. Keep a self-canonical URL and unique metadata on each service page, including after JavaScript runs. No English service translation is available yet; do not present the EN homepage as its hreflang equivalent. Preserve the existing visual identity and WhatsApp contact. State prices, deadlines, maintenance and integrations only as defined in each proposal; do not invent packages, client cases or results.
- GA4 scope approved on 2026-09-28: use measurement ID `G-VKJKP1MBYF` only on the PT and EN homepages and the two approved PT service pages. Analytics requires opt-in: block the Google tag and measurement requests before acceptance and after refusal. Refusal must preserve access and contact. Keep legal routes and all Recarga routes free of Analytics.
- Store the consent choice locally for a fixed 180 days; subsequent visits must not automatically extend consent. Configure Analytics cookies initially for up to 180 days and derive their duration on subsequent visits from the time remaining until the consent record's fixed `expiresAt`. Real-tag testing showed that `_ga_VKJKP1MBYF` can renew its expiration despite `cookie_update: false`; Google may update the session cookie while consent is valid. Do not promise that all Analytics cookies remain unchanged or never renew. Stop measurement and remove accessible Analytics cookies when consent expiry is detected. Footer cookie preferences must allow withdrawal, remove the Analytics cookies accessible to the site, and reload the page to stop measurement.
- Keep the web stream's Enhanced measurement disabled in GA4. The site explicitly sends `page_view` and `whatsapp_click`; automatically collected session events may still occur after consent. Do not re-enable automatic search, outbound-click or form measurement without reviewing its data and avoiding duplicate contact metrics.
- Analytics may measure page views, navigation events, browser/device technical information, referring domain only, and WhatsApp clicks. A click is not a conversation, qualified lead or sale; never collect WhatsApp conversation content through Analytics. Keep the PT/EN privacy notices consistent with the implementation, including Google's receipt of requests and cookie identifiers. Do not claim anonymity or invent the GA4 property's data-retention settings. Version the privacy notice date separately from unchanged terms and deletion instructions.

## SEO expansion approved on 2026-10-09

- Add PT service pages `/carreira-internacional/` and `/capacitacao-em-ia/`. Career copy covers the confirmed CV in English, LinkedIn, ATS and application strategy scope; AI training is on demand according to audience, objective and knowledge level.
- Group service links under their respective homepage fronts. Keep the approved hero and contact composition. Digital own projects remain only on the two digital service pages; do not reuse them as evidence of career or training delivery.
- Prerender all six commercial pages, including the EN homepage. Keep each PT service self-canonical without an invented EN translation; include exactly those six commercial URLs in the sitemap.
- Use lossless WebP display derivatives of the protected original symbol (144/320/640 px), native-sized circuit WebP and a 64 px PNG favicon. Preserve the original PNGs and the approved 1200 × 630 sharing image exactly.
- Expand the existing consent-gated GA4 allowlist to those six pages, retaining only the existing `page_view` and `whatsapp_click` events and sanitized URLs. No expanded UTM capture or new event payload types.
- Policy version 2 requires explicit reconfirmation of earlier acceptances. Valid earlier refusals remain effective for their original remaining duration. Preserve expiry, revocation and fail-closed storage behavior; the local storage key remains compatible.
- Update PT/EN privacy notices for the measured pages and reconfirmation, dating that notice separately from unchanged terms and deletion pages.
- Prepare canonical service links and short presentation texts for review. Social profile changes, external posts and public deployment are separate actions after the final preview review and corresponding authorization.

## SEO and GEO improvements approved on 2026-10-14

- Preserve the approved visual identity, page titles, descriptions, contacts, consent flow and Analytics events. Add only two homepage FAQs, covering proposals for websites/landing pages and on-demand AI training, with corresponding English text.
- Publish Organization, WebSite and WebPage structured data on the six commercial pages, and Service data on the four PT service pages using their visible introductions. Keep the protected original logo. Do not invent an address, hours, prices, ratings, customers or results; legal and app support pages remain outside this commercial schema.
- Complete locale-specific sharing metadata with the existing protected sharing image, preserve valid canonical and hreflang relationships, and date the six actually updated sitemap entries with the release date. Test the static HTML and hydrated pages before publication.

## Charging app design decisions

- For the new iOS charging calculator, the user selected the third concept's layout: a circular battery indicator, minus/plus controls, an editable completion time, side-by-side start time and duration, and a copy-time action.
- Adapt that layout to Tetelestai's identity: navy background, cyan accents, the original protected symbol, Michroma 400 for the wordmark, and Inter Variable for the interface. Use the supplied Facebook cover/profile images and the existing site styles as brand references.
- Updated charging calibration: BYD Song Pro 25/26 with the original portable charger, 69% at 04:20, 85% at 05:37 and 100% at 06:50 (150 minutes). Use the session average of 150/31 minutes per percentage point, rounded up to whole minutes; the partial reading validates that approximation. The earlier 25% to 100% in 6h is historical. Below 69%, label extrapolation. Default completion target remains 07:00, and the user schedules the car manually.
- Web publication authorized on 2026-09-14: publish the approved Recarga 1.0.5 calculator at `/recarga/` on the existing GitHub Pages domain. Preserve the app design and calculations, keep data in the current browser without synchronization, and retain reminders only in the installed app. Version only the compiled browser release and integrity manifest under `public/recarga/`; keep the separate native project out of the website repository. Add a discreet Calculator link to the app support/privacy pages and keep these routes out of the sitemap.
- Calibration guidance approved on 2026-09-14: replace the yellow extrapolation sentence with cyan, tappable guidance opening `Sua recarga`: `Para melhorar a estimativa, cadastre uma carga real, por exemplo, de 30% a 100%.` Display it only under the existing extrapolation condition; preserve the calculation. Keep yellow for actual timing warnings.

- Five visitor improvements approved on 2026-10-05: contextual WhatsApp inside the vehicle ficha (available: Conversar sobre este clássico; reserved: Consultar disponibilidade; sold: Procuro um semelhante); shareable ?veiculo= links for published sample vehicles only; optional Motor/Câmbio/Combustível/Cor/Quilometragem fields; Todos/Disponíveis/Reservados/Vendidos visitor filters; and Procuro um clássico with required model and optional preferences. Preserve the existing visual identity, inventory/stamps/showcase keys and stale-write guards. Older stored records must not inherit newly added seed specifications, and absent values must not be invented or displayed. Sharing must explain that local edits are not included; locally created records have no public share link. Inquiry fields are not persisted, and WhatsApp messages require the visitor to open and send them. Keep preview notices/noindex and no official inventory or Analytics integration.

## De Rolê publication decisions

- Publication of De Rolê 1.0.0 authorized on 2026-10-09. The game uses baralho for the set and cartas for individual items; its optional non-consumable purchase is Versão completa, with 180 free plus 540 additional cards, 720 in total.
- Keep /de-role/suporte/ public, prerendered and noindex,nofollow, using the existing app support template. It must remain outside Analytics eligibility and sitemap. Add only its exact GET/HEAD fallback, preserving strict unknown-route behavior.
- Preserve the general PT/EN policy and append the De Rolê scope. Support emails are for voluntary support only, not marketing or tracking. The chosen initial operation does not export or retain individual Apple usage/diagnostic records; any later operational change requires reviewing the policy and App Privacy declaration.
- Do not put the native app, IPA, Apple credentials, receipts or tester data in this website repository.

## Visual preview authorized on 2026-10-14

- Consolidate repeated homepage service presentations into one section of horizontal rows with balanced copy, separate service-detail links and explicit WhatsApp contact. Preserve all four PT service destinations and the three business fronts.
- Move the existing own-project section directly after the hero on the two digital service pages, with larger image previews and a hero shortcut. Keep the own-project and app-test status labels; do not invent client cases or apply these projects to career or AI training pages.
- Keep the navy/cyan identity, protected symbol, Michroma and Inter, slogan, metadata, consent and existing Analytics events. Fix small-screen horizontal overflow at its source and close the navigation with Escape, returning focus to the toggle.
- These changes are a local review preview. Do not deploy externally until the user reviews and authorizes publication.

## Client portfolio preview authorized on 2026-10-14

- The user authorized local presentation of Infinity Car Studio and Bolachinhas da Vovó Juju as client projects. Use actual site captures, preserve each client's identity and describe verified site features. Do not invent sales, conversion, traffic, testimonials or other outcomes.
- Digital service pages feature those two client projects near the hero. Add the central PT portfolio at `/projetos/` and individual presentations at `/projetos/infinity-car-studio/` and `/projetos/bolachinhas-da-vovo-juju/`. Expose Projects navigation with a clear Portuguese destination from EN; do not invent English case translations.
- Present the Tetelestai site and Recarga separately under own projects on the portfolio page. Do not imply that digital client sites demonstrate career or AI-training results. Add later clients only after delivery and approval; no empty coming-soon cards.
- Preserve the refined home hero, navy/cyan brand, original symbol, fonts, existing service facts, legal copy and consent behavior. Extend exact routes, prerendering, self-canonical metadata, structured WebPage data and sitemap to the three portfolio pages. Keep Analytics limited to the existing six approved pages; do not expand tracking in this preview.
- Verified public destinations: `https://infinitycarstudio.com.br/` (WhatsApp contact) and `https://bolachinhadavovojuju.com.br/` (Instagram contact). Keep TETELESTAI's own inquiry links pointed at its approved WhatsApp, not client contacts.
- This remains a local preview. No deployment until the user reviews and authorizes publication.

## Portfolio navigation refinement authorized on 2026-10-14

- The Projects header link follows the homepage-anchor navigation: `/#projects` in PT and `/en/#projects` in EN. The PT/EN homepages now include the two verified client cards after the services, explicitly labeled as digital solutions. This supersedes the earlier direct-to-portfolio header destination and the former exclusion of a digital project section from the homepage.
- Opening the full portfolio or an individual case remains a deliberate click from the cards or full-portfolio link. Keep the standalone portfolio and case pages. Do not show own products or imply career/training outcomes in the homepage client section.
- Localize the homepage project presentation for EN; case and full-portfolio pages remain Portuguese, with a descriptive destination title on English links. Preserve canonical and hreflang rules.
- On `/projetos/`, emphasize `Conhecer os projetos de clientes` as the primary solid-cyan button linking to `#projects`. Keep own projects as the quieter secondary action. Preserve the approved home hero and its single WhatsApp button.
- Continue local preview only until human publication approval.


## Published iOS app portfolio approved on 2026-10-14

- Superseding the own-project presentation above, remove the institutional website card and present `Tetelestai: Tempo de Recarga` under `Aplicativos iOS`, without own-project labels or implied client ownership. The public App Store listing confirms the name and availability: https://apps.apple.com/br/app/tetelestai-tempo-de-recarga/id6815378368.
- Replace outdated TestFlight/pending-review copy with App Store availability. Retain factual app functionality and actual screenshots; do not claim downloads, ratings or commercial results.
- Include a locally generated QR code with an unmodified App Store destination and a direct accessible download button. Keep quiet-zone margins and high contrast; do not use an external QR tracking/redirect service.
- The portfolio opening and links now include iOS apps; preserve the strong client-project CTA and homepage-anchor Projects navigation. Preview only, publication still pending review.

## Instagram content preview authorized on 2026-10-15

- Add `Conteúdos no Instagram` after the homepage client section (PT/EN) and after the iOS app section on the full PT portfolio. Keep these editorial contents separate from delivered client projects. No new navigation-menu item or tracking event.
- User selected Reels `DecE4Orp25n` and `Dec2uGYp463` as remixes and `DeeuzhYJ-_i` as original, all on `ia.napratica.videos` in collaboration with `tetelestai.tech`.
- For the first two, create original typographic covers using approved navy/cyan branding, fonts and protected original symbol. Do not copy frames, faces, video files or thumbnail images from those remixes. Link to the exact user-supplied Reel URLs.
- Audio credits observed on Instagram: `jose_e_mariaa3` for `DecE4Orp25n` (also tagged), `soueusebastian` for `Dec2uGYp463`. Label these specifically as audio credits, not independently verified video ownership. Preserve original audio links so visitors can inspect the attribution.
- User explicitly confirmed original ownership and authorized the published cover for `DeeuzhYJ-_i`. Use that cover proportionally without cropping; label as original AI content and credit the production. Only this cover is locally saved from Instagram.
- Load no Instagram embed scripts, pixels, video files or external images. All cards open Instagram only after a deliberate click. Keep consent, Analytics, legal copy, approved home hero and earlier portfolio improvements unchanged. Local preview only until final publication approval.


## Full English navigation approved on 2026-10-15

- Superseding the former PT-only service/portfolio restriction, the user approved full English versions of all four service pages, portfolio index and both client case pages. Use `/en/website-development/`, `/en/landing-pages/`, `/en/international-career/`, `/en/ai-training/`, `/en/projects/`, `/en/projects/infinity-car-studio/`, `/en/projects/bolachinhas-da-vovo-juju/`.
- Restore the four service shortcuts and the portfolio shortcut on the English homepage. Internal English links, breadcrumbs, related service/case links and header anchors stay within English. PT/EN selects the equivalent page in either direction.
- Translate all template labels, case descriptions, app presentation, accessible names and metadata. Preserve the original company/product names, screenshots, QR destination and factual scope. The external client websites and selected Instagram videos are Portuguese; make that clear rather than implying they have English versions.
- Publish self-canonical and reciprocal PT/EN hreflang in prerendered and hydrated HTML, localized structured data, exact GET/HEAD route fallbacks and the 16-page commercial sitemap. Unknown or malformed routes still return 404.
- English translations do not expand the existing six-page Analytics allowlist; preserve consent, policies and events. Preserve the approved visual identity and all earlier previews. Local preview only; no publication until review and authorization.

## Production release authorized on 2026-10-15

- The user reviewed the previews and explicitly authorized publishing all approved visual improvements, client portfolio, published iOS app with download QR code, Instagram section and seven English translations to https://tetelestai.tech/. This authorization supersedes the preview-only publication gates above for this release.
- Use the existing GitHub Pages repository and preserve unrelated files, existing contacts, consent, Analytics eligibility and legal/support pages. Verify the deployed pages, assets, navigation and equivalent PT/EN selectors after deployment.


## Measurement expansion approved on 2026-10-15

- Following the separate read-only diagnosis, the user approved measuring all 16 commercial PT/EN pages, portfolio/project views and App Store link clicks. This supersedes the former six-page Analytics scope only for the listed commercial pages; legal, Recarga and app support pages remain excluded.
- Preserve measurement ID G-VKJKP1MBYF, 180-day fixed consent expiry, fail-closed storage, withdrawal and existing refusals. Consent policy version 3 requires renewed acceptance of the expanded scope. Update both privacy notices and banners; preserve unrelated app policies and terms.
- Record app_store_click only after consent, with bounded button/qr_link placement, page, site_language and app_id 6815378368. A click is not a download, install, sale or lead. Scanning a QR code with another device does not trigger a website click.
- Use the exact App Store Connect campaign links generated in the authenticated TETELESTAI account for site_tetelestai_botao and site_tetelestai_qr, with provider token 129504047. Preserve the protected brand and generate the QR locally with quiet-zone margins; verify its decoded destination at rendered sizes.
- The user authorized publication and GA4/Search Console configuration for this package. Preserve the existing 14-month retention, test comparison and disabled enhanced measurement. Verify new event receipt and distinguish sitemap submission, processing, indexability and indexing.

## Browser test mode approved on 2026-10-16

- After a separate read-only diagnosis, the user authorized implementing and publishing browser test mode and updating the Site, portfólio e app dashboard. Activate with ?modo_teste=1 and deactivate with ?modo_teste=0; persist only the explicit browser preference in tetelestai:test-mode:v1. Remove the command from the current URL after processing it.
- Classify consented events with test_mode=internal/public and traffic_type=internal/external, including the tag configuration for automatically collected events. Keep measurement allowlist, consent version 3, refusal, expiry and Apple campaign links unchanged. Test mode never grants analytics consent. Storage failures block measurement. A changed mode in another tab stops and reloads the previous tag.
- Show a small status only to the tester. This setting applies separately to each browser/profile/device; private browsing or clearing site storage resets it. Do not claim historical unmarked tests can be reclassified.
- Keep the GA4 Internal Traffic data filter in Test mode, never activate permanent exclusion under this authorization. Preserve local-referral test identification in the dashboard and distinguish marked tests from traffic not identified as tests, without calling the latter verified real people.


## Art direction and De Rolê production release approved on 2026-10-17

- The user reviewed and explicitly approved publication of the art and motion preview, equal-width top-aligned client cards, subtle method/team/FAQ hover states, and the one-time circuit effect. Preserve the navy/cyan identity, original symbol, typography, contacts, PT/EN routing, accessibility and reduced-motion fallbacks. This approval supersedes the local-preview-only restriction for this release.
- Present De Rolê as the second published iOS app, with App Store ID 6820150552, a direct button and locally generated QR code. Preserve Recarga campaign URLs. Keep consent and browser test-mode classification; app_store_click accepts only the two approved app IDs. A store click is not a download.
- Use the user-supplied complete 9:16 cover as the clickable video presentation. Link to the supplied 20-second local MP4 on explicit interaction; preserve the three actual app screenshots in the expandable gallery. Localize surrounding PT/EN copy, without claiming that the Portuguese app is available in English.
- Production destination remains the existing GitHub Pages repository. Publish only the approved runtime, media, tests and this context; preserve unrelated legal/support files. Local reports, backups, source media paths and preview-only settings must not enter the public artifact. Verify deployed pages, links, video and mobile layout.

- Post-deployment link verification found that the former global Recarga campaign paths returned 404. Use the verified Brazilian /br/app/id6815378368 destination in the button and QR, preserving provider token, both campaign names and mt=8. No changes to App Store Connect campaigns or analytics consent were made.


## App measurement and portfolio metadata approved on 2026-10-17

- After a separate read-only diagnosis, the user approved registering app_id in GA4 property 556374668, updating the Site, portfólio e app dashboard to distinguish identified tests, measuring the De Rolê video links, and publishing the portfolio title/sitemap corrections. Keep Internal Traffic in Test mode; never activate permanent exclusion under this approval.
- Emit app_video_click only for explicit cover/text link activations of app 6820150552, using the existing consent, site_language, test_mode and traffic_type context. A click opens the MP4 and proves neither playback nor completion. Preserve the video, cover, gallery, store links and approved visual appearance.
- Consent policy v4 expands the notice to video link clicks, requires renewed acceptance of earlier acceptances, preserves valid refusals and the fixed 180-day expiration, and keeps legal/support routes unmeasured.
- Register the existing app_id as ID do aplicativo; link_placement is shared by App Store button/qr_link and video cover/text. Reports must distinguish internal tests, public events without a test marker and unclassified historical data; public is not proof of a real person. Retain historical local-referral identification separately without claiming automatic retroactive reclassification.
- Portfolio titles explicitly mention websites and iOS apps in PT/EN. Update lastmod to 2026-10-17 only for /projetos/ and /en/projects/, whose content changed; preserve other sitemap dates and exact routes.


## Conversion redesign prepared on 2026-10-23 (pending review)

- Carlos asked for a full-site redesign: modern look with transitions, translucency, light hover motion, SEO, GEO and a stronger path from visit to hiring. He chose the "new visual + strategy adjustments" option, with changes marked for his approval. This supersedes the earlier centered-brand home hero, single-button opening, home Instagram section and back-to-top controls for this release. Nothing is published until he reviews the branch and authorizes the merge to `main`.
- Positioning: the homepage leads with websites and landing pages for small businesses in Brasília, with the R$ 697 landing page as the entry offer and the price stated on the page (price note component). Career (Essencial guide, R$ 47 via Kiwify, coaching waitlist) and AI training stay as separate fronts with their own pages. Keep the existing 16 commercial URLs, PT/EN equivalents, legal/support routes, strict 404 behavior and the protected symbol/share image.
- Visual system: navy/cyan identity; Bricolage Grotesque (display), Figtree (text), JetBrains Mono (labels) and Michroma only for the TETELESTAI wordmark, all self-hosted through Fontsource (no Google Fonts requests). Glass header, glass cards, cross-document view transitions, one-time hero circuit pulses (finite, under 5 s), scroll reveals through `art-motion.mjs` (no hidden base state) and the existing one-time circuit sweep in the closing call to action. Reduced motion disables all of it.
- WhatsApp links keep the confirmed number `556184711930` and may carry a prefilled first message (`?text=`) naming the page or offer; the visitor still decides whether to send it. Every WhatsApp entry point keeps the consented `whatsapp_click` event. The Kiwify checkout link has no tracking. Consent v4, events, allowlist and test mode are unchanged.
- Structured data stays limited to visible facts: Organization (locality only, no street address, hours or ratings), WebSite, WebPage, BreadcrumbList, Service on the four service pages, Offer for the R$ 697 landing page, Product for the R$ 47 guide, FAQPage mirroring the visible questions, ItemList on the portfolio and CreativeWork on case pages. `public/llms.txt` summarizes the same facts for AI assistants.
- Confirmed by Carlos on 2026-10-23: landing page live in up to 2 business days after materials; R$ 697 paid as 2 × R$ 348,50 (half when hiring, half on delivery); includes an SEO- and GEO-optimized page with an offer and copy tailored to each business (mobile version, WhatsApp button, up to 5 sections and one revision round remain as stated; domain/hosting excluded); more than 22 years in software engineering, 14 as a tech lead at Banco do Brasil; online service across Brazil and abroad; Essencial facts as in the guide PDF (31 pages, edition 02, plain-text templates and CSV tracker) with an optional Word CV/cover letter order bump at checkout (active on Kiwify); Acompanhado is individual coaching with three 45-minute online sessions in 30 days, based on the Essencial files and the Word templates, with no limit on spots, at R$ 397 launch price and R$ 497 regular price (not announced yet). Carlos also wants to sell iOS and Android app development: present it as quoted per project on the home, website page, footer and portfolio, without a new route or Analytics scope change.

### Final version chosen on 2026-10-23 (branch `redesign-2026-10-final`)

- Carlos compared versions 1 and 2 and chose version 1 as the base (offer, price and WhatsApp in the home opening with the Infinity Car Studio capture; movement on links and buttons), with three elements from version 2: navy `#000C19` on every section (no light sections; the price note is the only light object), the motion-kit scroll reveal from the top to the end of every page, and the brand-profile fonts (Inter for headings and text, Michroma for the wordmark and labels).
- Motion: `src/reveal-kit.mjs` plus the inline head script in `index.html` (hides `[data-reveal]` only while it can reveal; shows everything after 3 s otherwise); sticky header that gains a background and shrinks after 24 px without moving the page; hover only under `(hover:hover) and (pointer:fine)`; version 1 button and link motion. Approved motion kept: finite hero circuit pulses, hero media entrance (headline and call to action never wait), method steps with the cyan bar and tint on hover (approved on 19/10), and the one-time closing circuit sweep (approved on 17/10). Reduced motion shows everything still. The `tt-consumado` signature from version 2 is not used.
- Approved by Carlos on 23/10: the home Instagram section stays only on `/projetos/`, the back-to-top control is removed, and the home opening is the offer layout above.
- Nothing is published until Carlos authorizes the merge of the pull request into `main`.
- Adjustments requested by Carlos on 23/10 after the merge: the copy says Tetelestai works online with businesses across Brazil (and abroad), not only in Brasília; Brasília stays as the company's base (footer, address in the Organization data, FAQ answer). Cards, method steps, people and the price note get the version 1 hover movement back (cards and steps lift 4 px, the person photo grows, the price note straightens and lifts); the text never shifts inside a card.
