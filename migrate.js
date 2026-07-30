const fs = require('fs');
const path = require('path');

const WORKS_DIR = path.join(__dirname, 'works');
const CONTENT_DIR = path.join(__dirname, 'content', 'works');

const files = ['cpxcedt2025.html', 'fastmath.html', 'meme-generator.html', 'qrcode.html', 'study-tracker.html', 'toi20.html', 'tsae2027.html'];

files.forEach(file => {
  const html = fs.readFileSync(path.join(WORKS_DIR, file), 'utf-8');
  
  // Extract fields
  const titleMatch = html.match(/<h1 class="project-main-title[^>]*>([^<]+)<\/h1>/);
  const subtitleMatch = html.match(/<p class="project-subtitle[^>]*>\s*([\s\S]*?)\s*<\/p>/);
  const headerTagMatch = html.match(/<div class="project-header-tag[^>]*>([^<]+)<\/div>/);
  const iconMatch = html.match(/<span class="showcase-icon">([^<]+)<\/span>/);
  const bannerMatch = html.match(/<img src="\.\.\/images\/([^"]+)" alt/);
  
  const title = titleMatch ? titleMatch[1].trim() : '';
  const subtitle = subtitleMatch ? subtitleMatch[1].trim() : '';
  const header_tag = headerTagMatch ? headerTagMatch[1].trim() : '';
  const icon = iconMatch ? iconMatch[1].trim() : '🚀';
  const banner = bannerMatch ? `../images/${bannerMatch[1]}` : '';

  // Extract meta grid
  const metaItems = [];
  const metaRegex = /<div class="meta-item">\s*<h4>([^<]+)<\/h4>\s*<p>(.*?)<\/p>\s*<\/div>/g;
  let m;
  while ((m = metaRegex.exec(html)) !== null) {
    const label = m[1].trim();
    let valueHtml = m[2].trim();
    let value = valueHtml;
    let link = '';
    const linkMatch = valueHtml.match(/<a href="([^"]+)"[^>]*>([^<]+)<\/a>/);
    if (linkMatch) {
      link = linkMatch[1];
      value = linkMatch[2];
    }
    metaItems.push(`  - label: "${label}"\n    value: "${value}"` + (link ? `\n    link: "${link}"` : ''));
  }

  // Determine category and date from index.html (hardcoding here for simplicity based on what we saw)
  let category = 'technical';
  if (file === 'cpxcedt2025.html') category = 'activities';
  if (file === 'toi20.html') category = 'awards';

  let date = '2026-05';
  if (file === 'tsae2027.html') date = '2026-06';
  if (file === 'fastmath.html') date = '2025-10';
  if (file === 'qrcode.html') date = '2025-08';
  if (file === 'cpxcedt2025.html') date = '2024-11';
  if (file === 'toi20.html') date = '2024-05';

  // Extract body
  const bodyMatch = html.match(/<!-- ✏️ Pillar 1: Background & Objective -->([\s\S]*?)<!-- Return Navigation -->/);
  let body = bodyMatch ? bodyMatch[1] : '';
  // Convert basic HTML tags to markdown if possible, but for now just raw HTML works in markdown
  
  const frontmatter = `---
title: "${title}"
subtitle: "${subtitle}"
short_description: "${title}"
date: "${date}"
category: "${category}"
card_tag: "${header_tag}"
header_tag: "${header_tag}"
icon: "${icon}"
thumbnail: "${banner.replace('-detail', '')}"
banner: "${banner}"
meta_items:
${metaItems.join('\n')}
---

${body}
`;

  fs.writeFileSync(path.join(CONTENT_DIR, file.replace('.html', '.md')), frontmatter);
});
console.log('Migration complete!');
