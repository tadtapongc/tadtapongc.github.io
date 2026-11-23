# Hero alignment — design

**Date:** 2026-11-23
**Status:** Approved 2026-11-23 — implemented

## Why

The hero bio, “Say hello,” and availability line currently sit in a column to the right of the portrait. That indents them roughly 150px from the container edge, while section headings such as “What I've Done” start at the edge. The intro reads as detached from the page's underlying grid.

## Chosen approach (option B)

Keep the compact portrait + name header exactly as it is: portrait in a narrow left column, name beside it. Move the bio, CTA, and availability line into a new full-width `.hero-intro` block below that header, so all three start at the container edge and line up with every section heading.

## Alternatives considered

- **A — portrait on the right:** all copy at the left edge, portrait balancing the right. Rejected: larger compositional change, and it separates the portrait from the name.
- **C — portrait above the name:** everything stacked at the left edge. Rejected: taller hero, loses the compact header.
- **B — chosen:** smallest change that fixes alignment while preserving the existing top row.

## What changes

- `src/index.html` — keep `.hero-header` for the portrait and name; wrap the bio markers, CTA, and availability line in `.hero-intro` directly under the header. The `AUTOMATED_BIO_START/END` markers stay intact for `build.js`.
- `theme.css` — replace the `.hero-content` rule with `.hero-intro`; set the intro width and bio measure; keep the existing availability dot and small-screen type rules. Mobile stacking (portrait, then name, then intro) continues to work.
- Run `npm run build` to regenerate `index.html`, then check desktop and narrow widths.

## Non-goals

No copy edits, no portrait crop changes, no section or navigation changes.

## My calls

- Cap the bio at roughly 640px rather than the full ~780px container width, so the line length stays readable.
- Keep the current “Say hello” button and availability dot styling unchanged.
- Size the portrait and its grid column from the name: two lines × 1.05 line-height = 2.1 × the name font size. At desktop widths the portrait diameter therefore equals the two-line name height exactly; below 760px the portrait stays at its 104px mobile size above the stacked name.
- Put the CTA and availability line in one wrapping flex row. The status sits beside the button when it fits and drops below it with the same 0.85rem gap on narrow screens.

## Success

- The left edges of the bio, button, and availability line align with “What I've Done” at desktop and mobile widths.
- The portrait + name row looks unchanged.
- Fade-in and reduced-motion behavior still work.
