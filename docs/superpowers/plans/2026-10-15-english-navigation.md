# Complete English navigation implementation plan

**Goal:** Implement the seven English pages approved in this chat, restore all homepage service shortcuts and pair PT/EN destinations. Local preview only.

**Architecture:** Keep the existing React templates and Portuguese content. Add English content and explicit equivalent paths in a localization module; use the same mapping for templates, route metadata and prerendering. Preserve strict exact worker fallbacks and the existing six-page Analytics allowlist.

**Tech stack:** React, Vite, static HTML prerendering, existing asset worker, Node test runner.

**Spec:** User approval of 2026-10-15 following the separate read-only audit in this chat: four service translations, portfolio index, both client cases, equivalent language selector, full link review and preview before publication.

- [x] Add a regression test for the missing EN shortcuts, locale-preserving case links, reciprocal selector/metadata and seven exact worker routes. Observe failure before implementation.
- [x] Translate the existing verified service/case copy and all shared page labels. Preserve scope, names, original screenshots, contacts and existing Portuguese copy.
- [x] Wire localized templates, restored homepage shortcuts and equivalent selectors; distinguish external Portuguese client sites/content from internal English pages.
- [x] Emit seven English static pages and reciprocal hreflang, update schema URLs/language and sitemap. Retain malformed/unknown-route 404 and exclude new pages from Analytics.
- [x] Update obsolete tests for the now-real translations; build and run the full suite; audit every internal destination/anchor across 16 commercial pages. Check hydrated metadata, desktop/mobile navigation and visual geometry, save evidence and leave preview open. No publication, push or commit.

**Review focus:** No untranslated template labels, wrong-language internal links, invented service promises, wrong canonicals, false external-language expectations, missing anchors or expanded tracking. Unknown URLs must still be 404.
