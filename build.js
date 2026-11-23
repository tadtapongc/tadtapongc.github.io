const fs = require('fs');
const path = require('path');
const { marked } = require('marked');
const yaml = require('js-yaml');

const CONTENT_DIR = path.join(__dirname, 'content', 'works');
const WORKS_DIR = path.join(__dirname, 'works');
const SRC_DIR = path.join(__dirname, 'src');
const TEMPLATE_FILE = path.join(SRC_DIR, 'project.html');
const INDEX_TEMPLATE = path.join(SRC_DIR, 'index.html');
const INDEX_OUT = path.join(__dirname, 'index.html');
const SITEMAP_OUT = path.join(__dirname, 'sitemap.xml');
const SITE_URL = 'https://tadtapongc.github.io';

const REQUIRED_FIELDS = ['title', 'date', 'category', 'card_tag', 'header_tag', 'icon'];

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + '-01T00:00:00');
  if (isNaN(d.getTime())) return dateStr;
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
}

function escapeAttr(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function localImagePath(value) {
  if (!value) return '';
  return value.replace(/^\.\.\//, '').replace(/^\//, '');
}

function isRemoteImage(value) {
  return /^(https?:)?\/\//.test(value) || value.startsWith('data:');
}

function imageExists(value) {
  if (!value) return false;
  if (isRemoteImage(value)) return true;
  return fs.existsSync(path.join(__dirname, localImagePath(value)));
}

function imageSrc(value, prefix = '') {
  if (!value) return '';
  if (isRemoteImage(value)) return value;
  return prefix + localImagePath(value);
}

function absoluteImageUrl(value) {
  if (!value) return `${SITE_URL}/images/og-card.jpg`;
  if (isRemoteImage(value)) return value;
  return `${SITE_URL}/${localImagePath(value)}`;
}

function socialImageUrl(value) {
  const url = absoluteImageUrl(value);
  // Open Graph images are most reliable as JPEG or PNG. Fall back to the
  // branded homepage card when a project only has a WebP showcase image.
  return /\.(jpe?g|png)$/i.test(url) ? url : `${SITE_URL}/images/og-card.jpg`;
}

function pickSocialImage(data) {
  if (data.banner && imageExists(data.banner)) return data.banner;
  if (data.thumbnail && imageExists(data.thumbnail)) return data.thumbnail;
  return '';
}

function generateCard(project) {
  const thumbnail = project.data.thumbnail && imageExists(project.data.thumbnail)
    ? imageSrc(project.data.thumbnail)
    : '';
  const imageTag = thumbnail
    ? `\n              <img src="${escapeAttr(thumbnail)}" alt="${escapeAttr(project.data.title)}" loading="lazy" decoding="async" onerror="this.style.display='none'">`
    : '';

  return `
          <a class="project-card" href="works/${project.data.slug}.html" data-date="${project.data.date || ''}">
            <div class="project-thumb">
              <span class="project-thumb-icon">${project.data.icon || ''}</span>${imageTag}
            </div>
            <div class="project-content">
              <span class="project-tag">${project.data.card_tag || ''}</span>
              <h3 class="project-title">${project.data.title || ''}</h3>
              <p class="project-desc">
                ${project.data.short_description || ''}
              </p>
              <div class="project-footer">
                <span>${formatDate(project.data.date)}</span>
                <span class="project-link">View details →</span>
              </div>
            </div>
          </a>`;
}

function generateMetaItems(data) {
  if (!data.meta_items || data.meta_items.length === 0) return '';

  return data.meta_items.map((item) => {
    const value = item.link
      ? `<a class="meta-link" href="${escapeAttr(item.link)}" target="_blank" rel="noopener noreferrer">${item.value}</a>`
      : item.value;

    return `
          <div class="meta-item">
            <div class="meta-label">${item.label}</div>
            <p>${value}</p>
          </div>`;
  }).join('');
}

function generatePager(projects, index) {
  const previous = projects[index - 1];
  const next = projects[index + 1];
  const items = [];

  if (previous) {
    items.push(`
          <a class="project-pager-item" href="${previous.data.slug}.html" rel="prev">
            <span class="project-pager-label">← Previous project</span>
            <span class="project-pager-title">${previous.data.title}</span>
          </a>`);
  }

  if (next) {
    items.push(`
          <a class="project-pager-item project-pager-next" href="${next.data.slug}.html" rel="next">
            <span class="project-pager-label">Next project →</span>
            <span class="project-pager-title">${next.data.title}</span>
          </a>`);
  }

  if (items.length === 0) return '';

  return `
        <nav class="project-pager fade-in" aria-label="More projects">
          ${items.join('\n')}
        </nav>`;
}

function validateFrontmatter(data, filename) {
  const warnings = [];
  for (const field of REQUIRED_FIELDS) {
    if (!data[field]) {
      warnings.push(`  ⚠ Missing required field "${field}" in ${filename}`);
    }
  }
  if (data.category && !['technical', 'activities', 'awards'].includes(data.category)) {
    warnings.push(`  ⚠ Invalid category "${data.category}" in ${filename} (must be technical, activities, or awards)`);
  }
  if (data.date && !/^\d{4}-\d{2}$/.test(data.date)) {
    warnings.push(`  ⚠ Invalid date format "${data.date}" in ${filename} (expected YYYY-MM)`);
  }
  if (data.banner && !imageExists(data.banner)) {
    warnings.push(`  ⚠ Social image not found "${data.banner}" in ${filename}`);
  }
  if (warnings.length > 0) {
    console.warn(`\nWarnings for ${filename}:`);
    warnings.forEach(w => console.warn(w));
  }
  return warnings.length === 0;
}

function readProjects() {
  if (!fs.existsSync(CONTENT_DIR)) {
    console.warn('Content directory not found:', CONTENT_DIR);
    return [];
  }

  const files = fs.readdirSync(CONTENT_DIR).filter(f => f.endsWith('.md'));
  const projects = [];

  for (const file of files) {
    try {
      const content = fs.readFileSync(path.join(CONTENT_DIR, file), 'utf-8');
      const match = content.match(/---\r?\n([\s\S]+?)\r?\n---/);
      if (!match) {
        console.warn(`Skipping ${file}: no frontmatter found`);
        continue;
      }

      const data = yaml.load(match[1]);
      data.slug = file.replace('.md', '');

      validateFrontmatter(data, file);

      const markdownBody = content.substring(match[0].length);
      const htmlBody = marked.parse(markdownBody);

      projects.push({ data, htmlBody });
    } catch (err) {
      console.error(`Error processing ${file}:`, err.message);
    }
  }

  // Sort descending by date
  return projects.sort((a, b) => (b.data.date || '1970-01').localeCompare(a.data.date || '1970-01'));
}

function buildProjectPages(projects) {
  if (!fs.existsSync(WORKS_DIR)) {
    fs.mkdirSync(WORKS_DIR, { recursive: true });
  }

  let templateHtml;
  try {
    templateHtml = fs.readFileSync(TEMPLATE_FILE, 'utf-8');
  } catch (err) {
    console.error('Failed to read project template:', err.message);
    process.exit(1);
  }

  projects.forEach((project, index) => {
    try {
      const { data, htmlBody } = project;

      // Derive keywords from card_tag and header_tag
      const keywordParts = [data.card_tag, data.header_tag]
        .filter(Boolean)
        .join(', ')
        .replace(/·/g, ',')
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);
      const uniqueKeywords = [...new Set(keywordParts)].join(', ');

      const backUrl = data.category === 'technical'
        ? '../index.html'
        : `../index.html?filter=${encodeURIComponent(data.category)}`;
      const ogImage = socialImageUrl(pickSocialImage(data));

      let projectHtml = templateHtml
        .replace(/\[Project Title\]/g, escapeAttr(data.title))
        .replace(/\[Short 1-2 sentence description of your project or activity for search engines and social sharing\.\]/g, escapeAttr(data.short_description))
        .replace(/\[PROJECT_KEYWORDS\]/g, escapeAttr(uniqueKeywords || data.title))
        .replace(/\[PROJECT_SLUG\]/g, data.slug)
        .replace(/\[Category · Specialization Area\]/g, escapeAttr(data.header_tag))
        .replace(/\[Main Project or Activity Title\]/g, escapeAttr(data.title))
        .replace(/\[Write a crisp, high-impact 1-2 sentence summary of what this project accomplished, the problem it solved, or your leadership role\.\]/g, escapeAttr(data.subtitle))
        .replace(/\[PROJECT_BACK_URL\]/g, backUrl)
        .replace(/\[PROJECT_OG_IMAGE\]/g, ogImage);

      projectHtml = projectHtml.replace(
        /<!-- AUTOMATED_META_START -->[\s\S]*?<!-- AUTOMATED_META_END -->/,
        `<!-- AUTOMATED_META_START -->${generateMetaItems(data)}\n        <!-- AUTOMATED_META_END -->`
      );

      projectHtml = projectHtml.replace(
        /<!-- AUTOMATED_CONTENT_START -->[\s\S]*?<!-- AUTOMATED_CONTENT_END -->/,
        `<!-- AUTOMATED_CONTENT_START -->\n${htmlBody}\n        <!-- AUTOMATED_CONTENT_END -->`
      );

      projectHtml = projectHtml.replace(
        /<!-- AUTOMATED_PAGER_START -->[\s\S]*?<!-- AUTOMATED_PAGER_END -->/,
        `<!-- AUTOMATED_PAGER_START -->${generatePager(projects, index)}\n        <!-- AUTOMATED_PAGER_END -->`
      );

      fs.writeFileSync(path.join(WORKS_DIR, `${data.slug}.html`), projectHtml);
    } catch (err) {
      console.error(`Error building page for ${project.data.slug}:`, err.message);
    }
  });
}

function buildIndexPage(projects) {
  const cardsTechnical = projects.filter(p => p.data.category === 'technical').map(generateCard).join('\n');
  const cardsActivities = projects.filter(p => p.data.category === 'activities').map(generateCard).join('\n');
  const cardsAwards = projects.filter(p => p.data.category === 'awards').map(generateCard).join('\n');

  let indexHtml;
  try {
    indexHtml = fs.readFileSync(INDEX_TEMPLATE, 'utf-8');
  } catch (err) {
    console.error('Failed to read index template:', err.message);
    process.exit(1);
  }

  indexHtml = indexHtml.replace(/<!-- AUTOMATED_PROJECTS_START_TECHNICAL -->[\s\S]*?<!-- AUTOMATED_PROJECTS_END_TECHNICAL -->/,
    `<!-- AUTOMATED_PROJECTS_START_TECHNICAL -->\n${cardsTechnical}\n<!-- AUTOMATED_PROJECTS_END_TECHNICAL -->`);

  indexHtml = indexHtml.replace(/<!-- AUTOMATED_PROJECTS_START_ACTIVITIES -->[\s\S]*?<!-- AUTOMATED_PROJECTS_END_ACTIVITIES -->/,
    `<!-- AUTOMATED_PROJECTS_START_ACTIVITIES -->\n${cardsActivities}\n<!-- AUTOMATED_PROJECTS_END_ACTIVITIES -->`);

  indexHtml = indexHtml.replace(/<!-- AUTOMATED_PROJECTS_START_AWARDS -->[\s\S]*?<!-- AUTOMATED_PROJECTS_END_AWARDS -->/,
    `<!-- AUTOMATED_PROJECTS_START_AWARDS -->\n${cardsAwards}\n<!-- AUTOMATED_PROJECTS_END_AWARDS -->`);

  // Load static data from data.yml
  const dataYmlPath = path.join(__dirname, 'content', 'data.yml');
  if (fs.existsSync(dataYmlPath)) {
    try {
      const siteData = yaml.load(fs.readFileSync(dataYmlPath, 'utf-8'));

      // Inject Bio
      if (siteData.bio) {
        const bioHtml = `<p class="hero-bio fade-in">\n        ${siteData.bio}\n      </p>`;
        indexHtml = indexHtml.replace(/<!-- AUTOMATED_BIO_START -->[\s\S]*?<!-- AUTOMATED_BIO_END -->/,
          `<!-- AUTOMATED_BIO_START -->\n      ${bioHtml}\n      <!-- AUTOMATED_BIO_END -->`);
      }

      // Inject Education
      if (siteData.education) {
        const eduHtml = siteData.education.map(edu => {
          const details = [
            `<div class="exp-role">${edu.degree}</div>`,
            `<div class="exp-school-line"><span class="exp-company">${edu.school}</span>${edu.curriculum_url ? `<span class="exp-sep">·</span><a class="exp-link" href="${edu.curriculum_url}" target="_blank" rel="noopener noreferrer">Standard curriculum ↗</a>` : ''}</div>`,
            edu.description ? `<p class="exp-desc">${edu.description}</p>` : '',
            edu.electives && edu.electives.length > 0 ? `<p class="exp-electives"><span class="exp-electives-label">Electives:</span> ${edu.electives.join(', ')}</p>` : '',
          ].filter(Boolean).join('\n            ');

          return `
        <li class="exp-item fade-in">
          <span class="exp-period">${edu.period}</span>
          <div>
            ${details}
          </div>
        </li>`;
        }).join('\n');
        indexHtml = indexHtml.replace(/<!-- AUTOMATED_EDUCATION_START -->[\s\S]*?<!-- AUTOMATED_EDUCATION_END -->/,
          `<!-- AUTOMATED_EDUCATION_START -->\n${eduHtml}\n<!-- AUTOMATED_EDUCATION_END -->`);
      }
    } catch (err) {
      console.error('Error processing data.yml:', err.message);
    }
  }

  fs.writeFileSync(INDEX_OUT, indexHtml);
}

function buildSitemap(projects) {
  const today = new Date().toISOString().split('T')[0];
  const projectUrls = (projects || []).map(p => `  <url>
    <loc>${SITE_URL}/works/${p.data.slug}.html</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`).join('\n');

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${SITE_URL}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
${projectUrls}
</urlset>
`;

  fs.writeFileSync(SITEMAP_OUT, sitemap);
}

function main() {
  console.log('Starting build...');

  const projects = readProjects();
  console.log(`Found ${projects.length} project(s)`);

  buildProjectPages(projects);
  console.log(`Generated ${projects.length} project page(s) in works/`);

  buildIndexPage(projects);
  console.log('Generated index.html');

  buildSitemap(projects);
  console.log('Generated sitemap.xml');

  console.log('\nBuild complete!');
}

main();
