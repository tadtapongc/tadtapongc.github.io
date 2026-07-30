const fs = require('fs');
const path = require('path');
const { marked } = require('marked');
const yaml = require('js-yaml');

const CONTENT_DIR = path.join(__dirname, 'content', 'works');
const WORKS_DIR = path.join(__dirname, 'works');
const TEMPLATE_FILE = path.join(WORKS_DIR, 'project-template.html');
const INDEX_FILE = path.join(__dirname, 'index.html');

// Read the template
const templateHtml = fs.readFileSync(TEMPLATE_FILE, 'utf-8');

// Ensure works directory exists
if (!fs.existsSync(WORKS_DIR)) {
  fs.mkdirSync(WORKS_DIR, { recursive: true });
}

// Get all markdown files
const files = fs.existsSync(CONTENT_DIR) ? fs.readdirSync(CONTENT_DIR).filter(f => f.endsWith('.md')) : [];

const projects = [];

files.forEach(file => {
  const content = fs.readFileSync(path.join(CONTENT_DIR, file), 'utf-8');
  const match = content.match(/---\n([\s\S]+?)\n---/);
  
  if (!match) return;

  const frontmatterStr = match[1];
  const markdownBody = content.substring(match[0].length);
  
  const data = yaml.load(frontmatterStr);
  const slug = file.replace('.md', '');
  data.slug = slug;
  
  // Parse markdown
  const htmlBody = marked.parse(markdownBody);

  projects.push({ data, htmlBody });

  // Render project HTML
  let projectHtml = templateHtml
    .replace(/\[Project Title\]/g, data.title || '')
    .replace(/\[Short 1-2 sentence description of your project or activity for search engines and social sharing\.\]/g, data.short_description || '')
    .replace(/\[Category · Specialization Area\]/g, data.header_tag || '')
    .replace(/\[Main Project or Activity Title\]/g, data.title || '')
    .replace(/\[Write a crisp, high-impact 1-2 sentence summary of what this project accomplished, the problem it solved, or your leadership role\.\]/g, data.subtitle || '')
    .replace(/<span class="showcase-icon">.*?<\/span>/s, `<span class="showcase-icon">${data.icon || '🚀'}</span>`)
    .replace(/<img src="\.\.\/images\/\[your-image\.jpg\]" alt="\[Project Screenshot or Photo\]"/g, `<img src="${data.banner || ''}" alt="${data.title || ''}"`);

  // Handle meta items (replace the whole meta-grid block)
  if (data.meta_items && data.meta_items.length > 0) {
    const metaItemsHtml = data.meta_items.map(item => `
        <div class="meta-item">
          <h4>${item.label}</h4>
          <p>${item.link ? `<a href="${item.link}" target="_blank" rel="noopener noreferrer" style="color: var(--accent);">${item.value}</a>` : item.value}</p>
        </div>`).join('');
    
    projectHtml = projectHtml.replace(/<div class="meta-grid fade-in">[\s\S]*?<\/div>\s*<\/div>\s*<\/section>/, 
      `<div class="meta-grid fade-in">${metaItemsHtml}</div></div></section>`);
  }

  // Handle body
  projectHtml = projectHtml.replace(/<div class="markdown-body fade-in">[\s\S]*?<\/div>/, 
    `<div class="markdown-body fade-in">\n${htmlBody}\n      </div>`);

  // Write the file
  fs.writeFileSync(path.join(WORKS_DIR, `${slug}.html`), projectHtml);
});

// Update index.html
projects.sort((a, b) => {
  const dateA = a.data.date || '1970-01';
  const dateB = b.data.date || '1970-01';
  return dateB.localeCompare(dateA);
});

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

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + '-01');
  if (isNaN(d.getTime())) return dateStr;
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
}

const cardsTechnical = projects.filter(p => p.data.category === 'technical').map(generateCard).join('\n');
const cardsActivities = projects.filter(p => p.data.category === 'activities').map(generateCard).join('\n');
const cardsAwards = projects.filter(p => p.data.category === 'awards').map(generateCard).join('\n');

let indexHtml = fs.readFileSync(INDEX_FILE, 'utf-8');

// Replace sections in index.html (we will use comments as markers)
indexHtml = indexHtml.replace(/<!-- AUTOMATED_PROJECTS_START_TECHNICAL -->[\s\S]*?<!-- AUTOMATED_PROJECTS_END_TECHNICAL -->/, 
  `<!-- AUTOMATED_PROJECTS_START_TECHNICAL -->\n${cardsTechnical}\n<!-- AUTOMATED_PROJECTS_END_TECHNICAL -->`);

indexHtml = indexHtml.replace(/<!-- AUTOMATED_PROJECTS_START_ACTIVITIES -->[\s\S]*?<!-- AUTOMATED_PROJECTS_END_ACTIVITIES -->/, 
  `<!-- AUTOMATED_PROJECTS_START_ACTIVITIES -->\n${cardsActivities}\n<!-- AUTOMATED_PROJECTS_END_ACTIVITIES -->`);

indexHtml = indexHtml.replace(/<!-- AUTOMATED_PROJECTS_START_AWARDS -->[\s\S]*?<!-- AUTOMATED_PROJECTS_END_AWARDS -->/, 
  `<!-- AUTOMATED_PROJECTS_START_AWARDS -->\n${cardsAwards}\n<!-- AUTOMATED_PROJECTS_END_AWARDS -->`);

fs.writeFileSync(INDEX_FILE, indexHtml);
console.log('Build complete!');
