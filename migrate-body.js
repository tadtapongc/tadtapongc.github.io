const fs = require('fs');
const path = require('path');

const WORKS_DIR = path.join(__dirname, 'works');
const CONTENT_DIR = path.join(__dirname, 'content', 'works');

const files = fs.readdirSync(WORKS_DIR).filter(f => f.endsWith('.html') && f !== 'project-template.html');

files.forEach(file => {
  const html = fs.readFileSync(path.join(WORKS_DIR, file), 'utf-8');
  
  const match = html.match(/<!-- ── MAIN CONTENT SECTION ────────────────────────────── -->[\s\S]*?<div class="container">\s*([\s\S]*?)<!-- Return Navigation -->/);
  
  if (match) {
    let body = match[1].trim();
    
    const mdFile = path.join(CONTENT_DIR, file.replace('.html', '.md'));
    if (fs.existsSync(mdFile)) {
      let mdContent = fs.readFileSync(mdFile, 'utf-8');
      
      const parts = mdContent.split('---');
      if (parts.length >= 3) {
        const frontmatter = parts[1];
        fs.writeFileSync(mdFile, `---\n${frontmatter.trim()}\n---\n\n${body}\n`);
        console.log(`Updated body for ${file}`);
      }
    }
  } else {
    console.log(`Could not find body for ${file}`);
  }
});
