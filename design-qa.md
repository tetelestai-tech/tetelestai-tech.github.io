# Design QA — Tetelestai

## Comparison target

- Source visual truth: `design/reference-approved.png`
- Source dimensions: `1024 × 1536 px`; source density is not encoded and was treated as `1×` design pixels.
- Browser-rendered implementation: local QA capture (not versioned)
- Implementation screenshot dimensions: `1348 × 926 px`.
- Browser CSS viewport: `1363 × 936 CSS px`; `devicePixelRatio: 1`. The screenshot excludes the browser scrollbar area.
- Route and state: `/`, Portuguese, dark theme, default state, no hover, top of page.
- Browser-rendered page height: `5403 CSS px`; no horizontal document overflow was observed (`scrollWidth: 1348`, matching the content width without the scrollbar).

## Normalization and evidence

- Full-view comparison: local QA capture (not versioned).
- Focused hero comparison: local QA capture (not versioned).
- For the full view, the source was cropped to its top `1024 × 926 px` without scaling and placed beside the browser screenshot.
- For the focused comparison, both artifacts were cropped to `1024 × 625 px` beginning below the `96 px` header. The implementation crop was centered horizontally. This preserves `1×` density and makes the logo, wordmark, slogan and CTA legible in one comparison input.
- The selected cloud browser exposed a fixed desktop viewport, so the original fidelity pass reviewed the `900 px` and `620 px` responsive rules in code. The subsequent local browser recheck passed at a `400 px` mobile viewport in Portuguese and English, closing that follow-up gap.

## Required fidelity surfaces

- Fonts and typography: Michroma 400 is used locally for the display wordmark and numbering; Inter Variable is used locally for body and UI copy. The visual hierarchy, wrapping, line height and letter spacing remain coherent. Michroma is an acceptable open-font substitute for the unidentified display face in the raster reference.
- Spacing and layout rhythm: the `96 px` header, `625 px` hero, centered brand lockup, service-row height and horizontal section rhythm track the reference closely. The wider browser viewport intentionally allows more lateral space than the `1024 px` source.
- Colors and tokens: the deep navy background, cyan accent, warm-white text, muted secondary copy and cyan dividers match the approved direction. Contrast and focus tokens remain visible.
- Image quality and asset fidelity: the supplied cross/letter-T symbol is preserved as a real transparent PNG. It is sharp at the rendered sizes, has no checkerboard background or visible transparency halo, and is not replaced by CSS or inline SVG art. The circuit asset is a real transparent image and expands across the wider viewport.
- Copy and content: the approved slogan is exact. The CTA was intentionally changed from “Agendar uma conversa” to “Conversar com a Tetelestai” because this version offers direct WhatsApp contact rather than a scheduling system. The three offers remain distinct and the career consulting limits are stated in the FAQ.
- Icons: all functional and decorative icons use the Phosphor icon family with consistent light strokes and optical sizing.
- Accessibility: the main heading now contains the brand and visible proposition, skip links exist on content routes, focus styles and reduced-motion handling are present, and English accessible names are localized.

## Findings — final pass

No actionable P0, P1 or P2 visual or interaction findings remain.

Acceptable differences from the raster reference:

- The display font is Michroma rather than the unidentified/custom reference face.
- The circuit field fills the wider viewport instead of reproducing the reference's single center axis.
- The CTA wording reflects the available WhatsApp workflow rather than implying a calendar integration.

Follow-up polish (P3):

- A future vector master of the cross/T symbol would improve very small favicon rendering, but the current transparent source is visually clean at website sizes.

## Comparison history

### Pass 1

- Browser screenshot: local QA capture (not versioned).
- Full comparison: local QA capture (not versioned).
- Focused comparison: local QA capture (not versioned).
- P1 findings: provisional/indexable privacy content, wrong canonical/OG metadata on localized routes, unknown HTML paths falling back with status 200, and an unverified “more than 22 years” claim.
- P2 findings: Portuguese accessible names on English pages, missing privacy skip link, language switch not preserving the privacy route, scheduling language without a scheduler, potential wordmark clipping at high zoom, and a brand-only H1.

### Fixes applied

- Added exact route resolution and a production worker allowlist so unknown HTML routes remain `404`.
- Generated localized static HTML shells with route-specific language, title, description, canonical, hreflang, Open Graph and robots metadata.
- Removed privacy routes from the sitemap and marked privacy/not-found routes `noindex,nofollow`.
- Rewrote the privacy notice around the site's actual behavior at that checkpoint: no form, analytics or non-essential cookies; outside-site contact; purpose/retention; hosting logs; and an interim privacy channel.
- Removed the unverified years-of-experience claim.
- Localized navigation, menu and language accessible names; added the privacy skip link; preserved the current page across PT/EN switching.
- Replaced scheduling language with a truthful contact CTA, made the proposition part of H1, and reduced the smallest responsive wordmark size.

### Pass 2

- Post-fix visual evidence: local QA captures (not versioned).
- No new P0/P1/P2 visual differences were introduced by the fixes.
- Production build completed successfully; `53` modules transformed.
- Sites worker and packaging suite passed `5/5` tests, including localized shells and unknown-route `404` behavior.

## Primary interactions tested in the cloud browser

- Hero CTA updated the URL to `#contact` and positioned the contact section at approximately `109.5 CSS px` below the sticky header.
- PT/EN navigation loaded the correct language, title, slogan and `html[lang]` value.
- `/en/privacy/` exposed `Privacy | Tetelestai`, `noindex,nofollow`, English accessible names, a skip link and a PT counterpart at `/privacidade/`.
- An unknown `/en/unknown-page` rendered an English not-found view with a descriptive title and `noindex,nofollow`; the production worker test independently verifies HTTP `404` behavior.
- A FAQ disclosure opened and exposed its answer.
- The Pass 2 browser run recorded three telephone links using `tel:+5561998821206`; this historical evidence was superseded by the approved WhatsApp change below.

## Approved WhatsApp update

- Option A was approved: the contact card keeps only one WhatsApp button, and the displayed telephone number was removed from both the card and footer.
- The Portuguese and English labels are `Conversar pelo WhatsApp` and `Chat on WhatsApp`.
- The single external contact destination is `https://wa.me/5561998821206`.
- The Portuguese and English privacy notices identify WhatsApp as the interim privacy channel.
- Production regression coverage rejects the former `tel:` link and displayed telephone number.
- The regenerated production bundle contains the confirmed WhatsApp destination and the routing/contact suite passes `6/6` tests.
- The local browser visual recheck passed for the Portuguese and English contact and privacy routes at desktop and 400 px mobile widths, with no browser console errors.
- Browser console errors/warnings filtered to `terminal.local`: none.

## Deployment decisions and remaining gates

- Resolved: GitHub Pages is the hosting provider; the privacy notice identifies GitHub, Inc. and states that GitHub logs and stores visitor IP addresses for security.
- Resolved: the approved WhatsApp contact card passed the local browser visual recheck in Portuguese and English, with no displayed telephone number.
- Resolved: repository ownership is the `tetelestai-tech` organization with the public repository `tetelestai-tech/tetelestai-tech.github.io`.

## Implementation checklist

- [x] Match the approved hero and service-index visual direction.
- [x] Preserve the explicit Christian cross / letter-T symbol.
- [x] Use local fonts and a consistent icon family.
- [x] Implement PT and EN routes.
- [x] Make the main conversion path functional without inventing a channel.
- [x] Add accessibility and reduced-motion support.
- [x] Generate route-specific metadata and strict production routing.
- [x] Build, package and test the prototype.
- [x] Repeat browser and visual comparison after P1/P2 fixes.

final result: WhatsApp build/test and local visual recheck passed

## Approved visual adjustment round

- The hero CTA is removed while the confirmed WhatsApp button remains the primary conversion in the contact section.
- The circuit introduction and detailed solution cards each end with an accessible back-to-top link; method, about, FAQ and contact keep theirs in normal desktop flow. Desktop spacing above and below each control is equal, and all six are hidden without residual space at `900 px` and below.
- The company-information group and localized verse are centered while the slogan and privacy link remain separate.
- At `620 px` and below, the existing circuit image remains an image element and becomes a low-opacity, contained decorative layer behind the solutions introduction.
- The protected symbol asset remains unchanged. The whole wordmark remains Michroma 400; the appearance of the `S` comes from the font glyph and receives no isolated styling.
- Build: approved (`npm run build`, `55` modules transformed, exit `0`).
- Configured test suite: approved (`npm run test:sites`, exit `0`).
- Individual six-test verification: approved (`6/6` passed, `0` failed, exit `0`).
- The Codex browser automation remained unavailable, but the subsequent manual visual inspection passed for PT and EN at desktop, `412 × 858 px` and `320 × 740 px`. At `320 × 740 px`, the tested hero, contact card, footer and mobile navigation showed no horizontal overflow or lateral clipping; the open English menu fit the viewport and preserved a visible focus state.

final result: build, configured tests and manual visual inspection passed

## Approved automation and digital solutions round

- Solution 02 now uses the localized titles `Automação e soluções digitais` and `Automation and digital solutions`; its summaries, detailed descriptions, identifiers and FAQ copy replace the previous AI model training and evaluation offer.
- The localized metadata now describes international career consulting, business automation and digital solutions, and practical AI training.
- Production build: approved (`npm run build`, `55` modules transformed, exit `0`).
- Configured test suite: approved (`npm run test:sites`, `6/6` tests passed, `0` failed, exit `0`).
- The local preview served the PT and EN routes with status `200` from the expected production bundle. The corrected PT and EN microcopy was present, while `design aplicado`, `with applied design` and `customer-service automation` were absent.
- Manual visual inspection passed for the PT and EN service index and detailed cards at desktop and mobile widths. The eight accepted captures showed no horizontal overflow, internal clipping, overlap or misplaced CTA.
- The localized FAQ disclosures and mobile menu were reported as working during the manual interaction check. These states, keyboard focus, hover behavior and exact CSS viewport dimensions are not independently demonstrated by the submitted screenshots.
- The screenshots are local QA evidence and are not versioned.

final result: localized digital-solutions build, tests, preview and manual visual inspection passed

## Approved purpose and marketing-role copy round

- The localized introduction now reads `Tecnologia com direção. Propósito em cada solução.` and `Technology with direction. Purpose in every solution.`, replacing the previous people-centered wording.
- Gabriela Rosa is identified consistently as responsible for marketing and social media in the PT and EN profile cards and company footer.
- Production build: approved (`npm run build`, `55` modules transformed, exit `0`).
- Configured test suite: approved (`npm run test:sites`, `6/6` tests passed, `0` failed, exit `0`).
- The regenerated production bundle contains the new localized introduction, role and biography copy while the superseded introduction and administrator biography are absent.
- Manual visual inspection passed across twelve PT and EN captures covering the introduction, profile cards and footer at desktop and `412 × 740 px`. No visible clipping, overlap, broken wrapping or hierarchy regression was observed.
- The screenshots do not independently verify DOM semantics, keyboard behavior, accessible names, exact contrast ratios, zoom reflow or behavior at `320 px`.
- The screenshots are local QA evidence and are not versioned.

final result: localized purpose and marketing-role build, tests and manual visual inspection passed
