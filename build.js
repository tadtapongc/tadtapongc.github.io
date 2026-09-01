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

function generateCard(project) {
  return `
          <a class="project-card" href="works/${project.data.slug}.html" data-date="${project.data.date || ''}">
            <div class="project-thumb">
              <span class="project-thumb-icon">${project.data.icon || ''}</span>
              <img src="${(project.data.thumbnail || '').replace('../', '')}" alt="${project.data.title || ''}" loading="lazy" onerror="this.style.display='none'">
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

  for (const project of projects) {
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

      let projectHtml = templateHtml
        .replace(/\[Project Title\]/g, data.title || '')
        .replace(/\[Short 1-2 sentence description of your project or activity for search engines and social sharing\.\]/g, data.short_description || '')
        .replace(/\[PROJECT_KEYWORDS\]/g, uniqueKeywords || data.title || '')
        .replace(/\[PROJECT_SLUG\]/g, data.slug)
        .replace(/\[Category · Specialization Area\]/g, data.header_tag || '')
        .replace(/\[Main Project or Activity Title\]/g, data.title || '')
        .replace(/\[Write a crisp, high-impact 1-2 sentence summary of what this project accomplished, the problem it solved, or your leadership role\.\]/g, data.subtitle || '');

      if (data.meta_items && data.meta_items.length > 0) {
        const metaItemsHtml = data.meta_items.map(item => `
        <div class="meta-item">
          <h4>${item.label}</h4>
          <p>${item.link ? `<a href="${item.link}" target="_blank" rel="noopener noreferrer" style="color: var(--accent);">${item.value}</a>` : item.value}</p>
        </div>`).join('');
        
        projectHtml = projectHtml.replace(/<div class="meta-grid fade-in">[\s\S]*?<\/div>\s*<\/div>\s*<\/section>/, 
          `<div class="meta-grid fade-in">${metaItemsHtml}</div></div></section>`);
      }

      projectHtml = projectHtml.replace(/<div class="markdown-body fade-in">[\s\S]*?<\/div>/, 
        `<div class="markdown-body fade-in">\n${htmlBody}\n      </div>`);

      fs.writeFileSync(path.join(WORKS_DIR, `${data.slug}.html`), projectHtml);
    } catch (err) {
      console.error(`Error building page for ${project.data.slug}:`, err.message);
    }
  }
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
        const eduHtml = siteData.education.map(edu => `
        <li class="exp-item fade-in">
          <span class="exp-period">${edu.period}</span>
          <div>
            <div class="exp-role">${edu.degree}</div>
            <div class="exp-company">${edu.school}</div>
            <p class="exp-desc">${edu.description}</p>
          </div>
        </li>`).join('\n');
        indexHtml = indexHtml.replace(/<!-- AUTOMATED_EDUCATION_START -->[\s\S]*?<!-- AUTOMATED_EDUCATION_END -->/, 
          `<!-- AUTOMATED_EDUCATION_START -->\n${eduHtml}\n<!-- AUTOMATED_EDUCATION_END -->`);
      }
    } catch (err) {
      console.error('Error processing data.yml:', err.message);
    }
  }

  fs.writeFileSync(INDEX_OUT, indexHtml);
}

function buildSitemap() {
  const today = new Date().toISOString().split('T')[0];
  
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${SITE_URL}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
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
