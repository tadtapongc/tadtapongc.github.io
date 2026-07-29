# AI Developer Guide & Architecture Documentation

This document serves as the primary context for any AI assistant or developer working on this codebase. Read this carefully to understand the structure, design patterns, and critical logic of the website before making modifications.

## 1. Project Overview
This is the personal portfolio website of Tadtapong Chuenchumsaeng.
- **Tech Stack:** Pure Vanilla HTML, CSS, and JavaScript. 
- **No Build Tools:** There is no Node.js, Webpack, Vite, or React. It is designed to be a lightweight, zero-dependency static site. Do **not** introduce frontend frameworks or build steps unless explicitly requested by the user.

## 2. File Structure
- `index.html`: The main landing page. Contains the layout for Hero, Portfolio, Skills, Education, and Contact sections, as well as the intricate Vanilla JS logic for the dynamic project modal.
- `theme.css`: The central stylesheet. Contains all CSS variables (design tokens), layout rules, typography, responsive media queries, and modal animations.
- `works/`: A directory containing individual project detail pages (e.g., `openfoam-generator.html`). Each file is a standalone HTML document.
- `images/`: Directory for all static image assets.
- `favicon.svg`, `robots.txt`, `sitemap.xml`: Standard SEO and metadata files.

## 3. Core Mechanics & Critical Logic

### A. The Dynamic Project Modal (CRITICAL)
The most complex part of this website is the project modal system located at the bottom of `index.html`. 
- **How it works:** When a user clicks a `.project-card`, the default navigation is prevented. Instead, the script uses `fetch()` to download the target HTML file from the `works/` directory.
- **DOM Parsing:** It parses the fetched HTML, specifically looking for `<section id="project-hero">`, `<section id="project-showcase">`, and the subsequent main `<section>` containing the content blocks.
- **Injection:** It strips out the target page's navigation and footer, and injects only the core content into the `#modal-content-container` overlay.
- **History API:** It uses `history.pushState` to update the browser URL (e.g., `?project=openfoam-generator`), allowing users to use the browser's back/forward buttons and share direct links to the modal view.

**⚠️ AI Rule for Modifying Projects:** When creating or editing files in the `works/` directory, you MUST maintain the `<section id="project-hero">` and `<section id="project-showcase">` structure, as the modal parsing logic in `index.html` relies on these IDs to render correctly.

### B. Scroll Animations
- Elements with the class `.fade-in` are hidden by default via `theme.css`.
- An `IntersectionObserver` in `index.html` watches these elements and adds the `.visible` class when they scroll into view, triggering a CSS transition.

### C. Portfolio Filtering
- The "What I've Done" section in `index.html` uses a simple JS filter system based on `data-filter` and `data-group` attributes.
- Cards are grouped into: `technical`, `activities`, and `awards`.
- On page load, the JS automatically sorts the `.project-card` elements by their `data-date` attribute in descending order.

## 4. Design System (`theme.css`)
All styling is driven by CSS Custom Properties (variables) defined in the `:root` pseudo-class. 
- **Colors:** The theme revolves around a "Chula Pink" accent (`#DF5D8D`).
  - `--bg`: Pure white background.
  - `--surface`: Soft rose-tinted surface for cards/modals.
  - `--ink`: Deep rich charcoal text.
  - `--muted`: Secondary text color.
  - `--accent`: Primary highlight color.
  - `--border`: Delicate rose-gray borders.
- **Typography:** Uses Google Fonts imported via `<link>` tags in HTML.
  - `--serif`: 'DM Serif Display'
  - `--mono`: 'DM Mono'
  - `--sans`: 'Space Grotesk'
- **Spacing/Radius:** Global layout properties are defined by `--gap` and `--radius`.

**⚠️ AI Rule for Styling:** Always use these CSS variables for colors, fonts, and spacing. Do not hardcode colors (e.g., `#DF5D8D`) directly into CSS rules; use `var(--accent)`. Do not use inline styles unless strictly necessary for dynamic JS behavior.

## 5. Standard Operating Procedure for Adding a New Project
When asked to add a new project, follow these exact steps:

1. **Duplicate Template:** Copy the `works/project-template.html` to a new file (e.g., `works/my-new-project.html`).
2. **Fill Content:** Update the `<title>`, `<meta>` descriptions, Hero section, Meta grid, and the 3-pillar content blocks inside the new HTML file.
3. **Update Home Page:** Open `index.html` and add a new `<a class="project-card">` element inside the appropriate `.filter-group`. 
4. **Card Attributes:** Ensure the new card has:
   - `href="works/my-new-project.html"`
   - `data-date="YYYY-MM"` (crucial for auto-sorting)
   - Proper thumbnail structure (`.project-thumb`) and text structure (`.project-content`).

## 6. Email Obfuscation
To prevent spam, email links in `index.html` use data attributes (`data-user` and `data-domain`). A script combines these into a `mailto:` link at runtime. Always maintain this pattern for contact links.
