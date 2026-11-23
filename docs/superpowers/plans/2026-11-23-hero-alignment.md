# Hero Alignment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move the hero bio, “Say hello” CTA, and availability line to the container's left edge so they align with “What I've Done,” while keeping the portrait + name row unchanged.

**Architecture:** `src/index.html` keeps `.hero-header` as a two-column grid containing only the portrait and name. A new `.hero-intro` block below it spans the full container width and holds the bio markers, CTA, and availability line. `theme.css` drops `.hero-content` and widens the bio measure to 640px. `npm run build` regenerates `index.html`.

**Tech Stack:** Vanilla HTML/CSS, Node build script (`build.js`), no test framework.

**Spec:** `docs/superpowers/specs/2026-11-23-hero-alignment-design.md`

## Global Constraints

- All CSS lives in `theme.css`; use existing design tokens, no hardcoded colors.
- Never edit generated `index.html` or `works/*.html` by hand — edit `src/` and run `npm run build`.
- Keep `<!-- AUTOMATED_BIO_START -->` / `<!-- AUTOMATED_BIO_END -->` markers exactly, once each.
- Bio max measure: 640px.
- Preserve `.fade-in` classes so the IntersectionObserver still animates the intro.
- Do not commit: the working tree already contains the user's uncommitted hero edits.

## Review Focus

- Narrow viewport (320–390px): bio, CTA, and availability must not overflow horizontally.
- Long bio injected from `content/data.yml`: the 640px cap must not clip or truncate it.
- Build idempotence: the injected bio must remain between its markers after a second build.
- Fade-in ordering: intro elements must not stay invisible if the observer misses them.

---

### Task 1: Restructure the hero markup

**Files:**
- Modify: `src/index.html:100-116`

**Interfaces:**
- Produces: `.hero-header` (portrait + `h1.hero-name` only) and sibling `.hero-intro` (bio markers, `a.hero-cta`, `p.hero-availability`).

- [ ] **Step 1: Replace the hero block**

The result must be exactly this shape (keep the current image attributes and bio text):

```html
<div class="hero-header">
  <img class="hero-avatar fade-in" src="images/profile-avatar.jpg" alt="Portrait of Tadtapong Chuenchumsaeng" width="256" height="256" loading="eager" fetchpriority="high">
  <h1 class="hero-name fade-in">Tadtapong<br><em>Chuenchumsaeng.</em></h1>
</div>
<div class="hero-intro">
  <!-- AUTOMATED_BIO_START -->
  <p class="hero-bio fade-in">
    …existing bio…
  </p>
  <!-- AUTOMATED_BIO_END -->
  <a class="hero-cta fade-in email-link" data-user="6832083321" data-domain="student.chula.ac.th" href="#">
    Say hello <span class="arrow">→</span>
  </a>
  <p class="hero-availability fade-in">Let's build something together · Bangkok / Remote</p>
</div>
```

- [ ] **Step 2: Verify the markers and classes**

Run: `Select-String -Path src/index.html -Pattern 'AUTOMATED_BIO_START|AUTOMATED_BIO_END|hero-intro|hero-content'`
Expected: one bio start, one bio end, one `.hero-intro`, zero `.hero-content`.

### Task 2: Update hero CSS

**Files:**
- Modify: `theme.css:784-851`

**Interfaces:**
- Consumes: `.hero-intro` from Task 1.
- Produces: intro block sits flush with `.container`'s left edge; bio measure 640px.

- [ ] **Step 1: Remove the old content-column rule**

Delete `.hero-content { min-width: 0; }`. No `.hero-intro` width rule is needed — as a direct child of `.container` it inherits the container's left edge.

- [ ] **Step 2: Widen the bio measure**

Change `.hero-bio`’s `max-width` from `540px` to `640px`. Leave every other hero rule (name, CTA, availability, avatar, mobile breakpoints) untouched.

- [ ] **Step 3: Verify no stale references remain**

Run: `Select-String -Path theme.css -Pattern 'hero-content'`
Expected: no output.

- [ ] **Step 4: Regenerate the site**

Run: `npm run build`
Expected: exit code 0 and regenerated `index.html`.

### Task 3: Verify alignment and responsiveness

**Files:**
- Verify only: generated `index.html`

- [ ] **Step 1: Check generated structure**

Run: `Select-String -Path index.html -Pattern 'hero-intro|hero-content'`
Expected: one `.hero-intro`, zero `.hero-content`, bio still between its markers.

- [ ] **Step 2: Serve and measure left edges at desktop width**

Serve the site locally, open it at ≥1024px, and evaluate in the console:

```js
const l = s => document.querySelector(s).getBoundingClientRect().left;
[l('.hero-bio'), l('.hero-cta'), l('.hero-availability'), l('.section-heading h2')]
```

Expected: all four values are equal within 1px.

- [ ] **Step 3: Check narrow width**

At 390px, evaluate:

```js
document.documentElement.scrollWidth <= window.innerWidth
```

Expected: `true`; the same four left edges remain aligned.

- [ ] **Step 4: Visual check**

Confirm the portrait + name row looks identical to before, the intro sits below it, and the fade-in reveals each element.
