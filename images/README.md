# Portfolio Images

Images in this folder are used by the homepage cards and social preview images. The build script normalizes paths, so frontmatter may use `/images/foo.jpg`, `images/foo.jpg`, or `../images/foo.jpg`.

## Current assets

### Portraits and social cards
- `profile-avatar.jpg` — circular hero portrait (256×256)
- `profile.jpg` — larger portrait used by Person JSON-LD (1000×1000)
- `og-card.jpg` — homepage social card (1200×630)

### RapidFOAM
- `rapidfoam-studio-card.webp` — homepage card
- `rapidfoam-studio.webp` — source screenshot (archive, not displayed)
- `rapidfoam-studio-og.jpg` — social preview image (1200×630)

### FSAE / TSAE2027
- `tsae-front-wing-complete-card.jpg` — homepage card, project page, and social preview (landscape crop of the completed front wing)
- `tsae-front-wing-complete.jpg` — full-resolution archive of the completed front wing
- `1000002015.jpg` — alternate carbon-part photo (archive, not currently used)
- `formula.jpg` — team banner (archive, not currently used)
- `tsae-foam-plug.jpg` — front-wing foam plug with flange boards
- `tsae-mold-gelcoat.jpg` — pigmented gelcoat on the front-wing plug
- `tsae-mold-csm.jpg` — early one-piece CSM layup that trapped air (mistake example)
- `tsae-mold-layup.jpg` — fiberglass tooling layup
- `tsae-mold-halves.jpg` — front-wing mold halves before final trimming
- `tsae-rear-wing-mold.jpg` — rear-wing mold half, before trimming
- `tsae-rear-wing-infusion.jpg` — rear-wing skin under vacuum during infusion
- `tsae-rear-wing-skin.jpg` — demoulded rear-wing carbon skin, before trimming
- `tsae-cnc-endplate.jpg` — CNC cutting an endplate skin to shape
- `tsae-front-wing-structure.jpg` — front-wing internal ribs and spar
- `tsae-front-wing-weight.jpg` — dry-fit front-wing assembly on the scale
- `tsae-front-wing-complete.jpg` — complete front-wing assembly with all elements fitted
- `tsae-sidepod-foam.jpg` — shaped sidepod foam form
- `tsae-sidepod-filler.jpg` — sidepod surface filler

### CPxCEDT Openhouse 2025
- `camp.jpg` — homepage card
- `camp-detail.jpg` — social preview image (not displayed on the page)

### TOI20
- `1000002198.jpg` — homepage card and social preview image

## Unused legacy assets

These remain from earlier versions of the portfolio and are not referenced:
- `meme-generator.jpg`
- `study-tracker.jpg`
- `fastmath.jpg`
- `qrcode.jpg`
- `openfoam.webp`

## Adding images

1. Use a descriptive name, preferably `{slug}-card.webp` and `{slug}-social.webp` for new projects.
2. Card images: roughly 600–900px wide, landscape, compressed.
3. Social images: roughly 1200px wide, landscape, compressed.
4. Set `thumbnail:` and, optionally, `banner:` in the project frontmatter. The thumbnail appears on the homepage card; `banner` is used only for the social preview and falls back to the thumbnail.
5. Run `npm test`; it verifies that every local image reference exists.
