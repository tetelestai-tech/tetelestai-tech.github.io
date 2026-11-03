// Instagram content shown on /projetos/ and /en/projects/ ("Conteúdos no Instagram").
// Empty since 2026-11-03: the three Reels selected on 2026-10-15 (DecE4Orp25n, Dec2uGYp463,
// DeeuzhYJ-_i) were archived on 2026-11-02 when the profile was repositioned, and the profile
// handle changed from ia.napratica.videos to ia.napratica.negocios. While this list is empty,
// the section is not rendered. Re-populate it with new Reels (published from 2026-11-09) using
// https://www.instagram.com/ia.napratica.negocios/reel/<code>/ and update the section copy in
// src/portfolio-content.mjs and src/localized-content.mjs (no "remix" wording for the new content).
//
// Item shape kept for the next release:
// { id, url, title, titleEn, description, descriptionEn,
//   credit?, audio?, coverClass?, coverLines?, coverLinesEn?,   // typographic cover
//   image? }                                                    // authorized cover image
export const INSTAGRAM_CONTENTS = [];
