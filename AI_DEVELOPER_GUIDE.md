# AI Developer Guide & Architecture Documentation

This document is the primary context for anyone (human or AI) working on this codebase. Read it before changing the site.

## 1. Project Overview

This is the personal portfolio website of Tadtapong Chuenchumsaeng.

- **Tech stack:** vanilla HTML, CSS, and JavaScript. Node.js with `marked` and `js-yaml` for the build pipeline.
- **Content:** Markdown files with YAML frontmatter in `content/works/`, plus site data in `content/data.yml`.
- **Build:** `npm run build` (or `node build.js`) generates `index.html`, `works/*.html`, and `sitemap.xml`.
- **Deploy:** `.github/workflows/deploy.yml` rebuilds and commits the generated files on changes to `main`. GitHub Pages serves the repository root.
- **Tests:** `npm test` builds the site and runs the Node test suite in `test/`.

## 2. File Structure

- `src/index.html` — **source template** for the landing page: Hero, Portfolio, Education, and Contact sections, plus the filter and email JavaScript. Content is injected between `<!-- AUTOMATED_*_START/END -->` markers.
- `src/project.html` — **source template** for individual project pages: hero, meta grid, Markdown body, previous/next pager, and return navigation.
- `index.html` — **generated** landing page. Do not edit directly.
- `works/` — **generated** project pages. Do not edit directly.
- `works/openfoam-generator.html` — hand-written legacy redirect to `works/rapidfoam.html`. This is the one file in `works/` that is not generated.
- `build.js` — reads content and templates, then generates the landing page, project pages, and sitemap.
- `content/data.yml` — site-wide bio and education data. Edited in Git, not through the CMS.
- `content/works/*.md` — one Markdown file per project with YAML frontmatter.
- `theme.css` — the single source of truth for all CSS: design tokens, layout, project pages, homepage, responsive rules, and accessibility helpers.
- `images/` — static images. See `images/README.md` for the current asset list and naming guidance.
- `admin/` — Sveltia CMS entry point and configuration.
- `test/build.test.js` — build-output tests for navigation, landmarks, metadata, and image references.

## 3. Core Mechanics

### A. Project pages are normal links

Project cards on the homepage are plain `<a>` elements pointing at `works/<slug>.html`. There is **no modal** and no click interception. The browser handles new tabs, Back/Forward, scroll restoration, sharing, and accessibility.

When adding a project, keep the `works/*.html` output self-contained: the template and build script inject the hero, meta grid, content, pager, and metadata.

### B. Filter state lives in the URL

The homepage filter tabs use `filterTab(category)` and update the URL with `history.replaceState`:

- `technical` → no `filter` parameter
- `activities` → `?filter=activities`
- `awards` → `?filter=awards`

On load, the active tab is read from the URL. Project back links include the category, so returning from a project restores the correct tab. Do not remove this behaviour.

### C. Project page structure and injection markers

`build.js` fills these marker pairs in `src/project.html`:

- `AUTOMATED_META_START/END` — meta grid items from `meta_items`
- `AUTOMATED_CONTENT_START/END` — rendered Markdown body
- `AUTOMATED_PAGER_START/END` — previous/next project navigation

The template also uses placeholders such as `[Project Title]`, `[PROJECT_SLUG]`, `[PROJECT_BACK_URL]`, and `[PROJECT_OG_IMAGE]`. Keep the marker comments intact; the build relies on them.

### D. Headings and landmarks

- Every page has a single `<main id="main">` and the skip link targets it.
- Project pages use `h1` for the project title, a visually hidden `h2` ("Project details") for the article, and `h3` pillars inside the Markdown. Meta labels use `<div class="meta-label">`, not headings.
- Do not put `fade-in` on a large content container such as `.markdown-body`. The IntersectionObserver threshold is 12%, so a container taller than roughly 8× the viewport can never become visible on small screens. The article body is intentionally always visible.

### E. Images

- `thumbnail` is used on the homepage card and as the social-image fallback.
- `banner` is used only for the social preview (`og:image` / Twitter card); it is not displayed on the page. If the banner is missing or its file does not exist, the build falls back to the thumbnail.
- Image paths in frontmatter may be `/images/foo.jpg`, `images/foo.jpg`, or `../images/foo.jpg`. The build normalizes them for each page and for social metadata.
- Do not reference an image that does not exist; `npm test` checks local image references.

### F. Email obfuscation

Email links in `src/index.html` use `data-user` and `data-domain`; JavaScript assembles the `mailto:` link and the copy-to-clipboard button. Keep this pattern.

### G. Animations

Elements with `.fade-in` start hidden and receive `.visible` from the IntersectionObserver. `prefers-reduced-motion` disables the animation and reveals the content. Do not place `.fade-in` on very tall containers (see headings above).

## 4. Design System (`theme.css`)

All styling is driven by CSS custom properties in `:root`:

- `--bg`, `--surface`, `--ink`, `--muted`, `--border`
- `--accent: #DE5C8E` — official Chula Pink, used for all pink text, labels, rules, and decorative accents.
- `--mono`, `--sans`
- `--gap`, `--radius`, `--transition`

**Rules:**

- Use the design tokens. Do not hardcode colors in CSS; use `var(--accent)` for pink accents.
- The bright pink is used everywhere by design. It does not meet WCAG AA contrast for small text on white or `--surface`; keep that in mind if accessibility becomes a priority.
- All CSS belongs in `theme.css`. Do not add `<style>` blocks to templates or generated pages.
- Use the `.sr-only` helper for visually hidden headings or labels.
- Avoid inline styles in templates when a class can do the job.

## 5. Adding a New Project

1. Create `content/works/<slug>.md`.
2. Add required frontmatter: `title`, `subtitle`, `short_description`, `date` (`YYYY-MM`), `category` (`technical`, `activities`, or `awards`), `card_tag`, `header_tag`, `icon`, `meta_items`.
3. Add `thumbnail` and, optionally, `banner` images. The thumbnail appears on the homepage card; the banner is only used for the social preview.
4. Write the Markdown body using the three-pillar structure (Challenge, Approach, Results).
5. Run `npm run build`.
6. Run `npm test`.
7. Verify the card → project page navigation, the back link, and the previous/next pager.

## 6. Build Pipeline

```
content/works/*.md  ──┐
content/data.yml    ──┤
src/index.html      ──┤──> node build.js ──> index.html
src/project.html    ──┤                  ──> works/*.html
                     │                  ──> sitemap.xml
theme.css / images ──┘
```

`npm test` runs the build and then `node --test`.

## 7. CMS Notes

- Sveltia CMS manages `content/works/*.md` and the `images/` media library.
- `content/data.yml` (bio and education) is not currently exposed as a CMS collection; edit it in Git and rebuild.
- The `banner` field feeds the social preview only; it is not displayed on the page. Uploads go to `images/` with the configured public path.
