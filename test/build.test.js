const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const read = (relative) => fs.readFileSync(path.join(root, relative), 'utf8');
const projectSlugs = ['rapidfoam', 'tsae2027', 'cpxcedt2025', 'toi20'];

test('homepage uses real project links and has no modal', () => {
  const source = read('src/index.html');
  const output = read('index.html');

  assert.doesNotMatch(source, /project-modal-overlay/);
  assert.doesNotMatch(source, /openModal/);
  assert.match(source, /<main id="main"/);
  assert.match(output, /<a class="project-card" href="works\/[^"]+\.html"/);
});

test('homepage uses the Selected Work heading', () => {
  const output = read('index.html');

  assert.match(output, /<h2>Selected Work<\/h2>/);
  assert.doesNotMatch(output, /<h2>What I've Done<\/h2>/);
});

test('homepage filter state is reflected in the URL', () => {
  const source = read('src/index.html');

  assert.match(source, /url\.searchParams\.set\('filter'/);
  assert.match(source, /new URLSearchParams\(window\.location\.search\)\.get\('filter'\)/);
});

test('project pages have landmarks, pager, and social metadata but no showcase banner', () => {
  for (const slug of projectSlugs) {
    const html = read(`works/${slug}.html`);

    assert.match(html, /<main id="main"/, slug);
    assert.doesNotMatch(html, /id="project-showcase"/, slug);
    assert.doesNotMatch(html, /class="showcase-banner"/, slug);
    assert.match(html, /class="project-pager[^"]*"/, slug);
    assert.match(html, /class="project-divider"/, slug);
    assert.match(html, /← All work/, slug);
    assert.match(html, /class="project-all-link"/, slug);
    assert.doesNotMatch(html, /Explore More Work/, slug);
    assert.match(html, /property="og:title"/, slug);
    assert.match(html, /property="og:image"/, slug);
    assert.match(html, /name="twitter:card"/, slug);
    assert.match(html, /class="meta-label"/, slug);
    assert.doesNotMatch(html, /<div class="meta-item">\s*<h4>/, slug);
    assert.match(html, /<h2 class="sr-only">Project details<\/h2>/, slug);
    assert.doesNotMatch(html, /markdown-body fade-in/, slug);
  }
});

test('TSAE page includes the manufacturing gallery', () => {
  const html = read('works/tsae2027.html');

  assert.match(html, /class="project-gallery"/);
  assert.match(html, /tsae-foam-plug\.jpg/);
  assert.match(html, /tsae-mold-gelcoat\.jpg/);
  assert.match(html, /tsae-mold-csm\.jpg/);
  assert.match(html, /tsae-mold-halves\.jpg/);
  assert.match(html, /tsae-sidepod-foam\.jpg/);
  assert.match(html, /tsae-rear-wing-infusion\.jpg/);
  assert.match(html, /tsae-rear-wing-mold\.jpg/);
  assert.match(html, /tsae-rear-wing-skin\.jpg/);
  assert.match(html, /tsae-front-wing-weight\.jpg/);
  assert.match(html, /tsae-front-wing-complete\.jpg/);
  assert.match(html, /tsae-cnc-endplate\.jpg/);
  assert.match(html, /tsae-front-wing-structure\.jpg/);
  assert.doesNotMatch(html, /tsae-carbon-weave\.jpg/);
  assert.doesNotMatch(html, /tsae-wing-split-cad\.png/);
  assert.doesNotMatch(html, /CAD check of the split line/);
});

test('TSAE card and social image use the complete front wing', () => {
  const home = read('index.html');
  const page = read('works/tsae2027.html');

  assert.match(home, /tsae-front-wing-complete-card\.jpg/);
  assert.match(page, /property="og:image" content="https:\/\/tadtapongc\.github\.io\/images\/tsae-front-wing-complete\.jpg"/);
});

test('RapidFOAM social image uses the JPEG OG card', () => {
  const page = read('works/rapidfoam.html');

  assert.match(page, /property="og:image" content="https:\/\/tadtapongc\.github\.io\/images\/rapidfoam-studio-og\.jpg"/);
});

test('pink accents use the shared bright token', () => {
  const css = read('theme.css');

  assert.doesNotMatch(css, /--accent-text:/);
  assert.match(css, /--accent:\s*#DE5C8E;/i);
  assert.match(css, /\.project-tag\s*\{[^}]*color:\s*var\(--accent\)/s);
  assert.match(css, /\.project-header-tag\s*\{[^}]*color:\s*var\(--accent\)/s);
  assert.match(css, /\.markdown-body blockquote h4\s*\{[^}]*color:\s*var\(--accent\)/s);
  assert.match(css, /\.markdown-body blockquote\s*\{[^}]*border-left:\s*3px solid var\(--accent\)/s);
  assert.match(css, /\.hero-availability::before\s*\{[^}]*background:\s*var\(--accent\)/s);
});

test('every referenced local image exists', () => {
  const pages = [
    'index.html',
    ...fs.readdirSync(path.join(root, 'works'))
      .filter((file) => file.endsWith('.html'))
      .map((file) => `works/${file}`),
  ];

  for (const page of pages) {
    const html = read(page);
    const refs = [...html.matchAll(/(?:src|href)="((?:\.\.\/)?images\/[^"?#]+)"/g)].map((match) => match[1]);

    for (const ref of refs) {
      const file = path.resolve(path.dirname(path.join(root, page)), ref);
      assert.ok(fs.existsSync(file), `${page} references missing ${ref}`);
    }
  }
});
