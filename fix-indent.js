const fs = require('fs');
const path = require('path');

const CONTENT_DIR = path.join(__dirname, 'content', 'works');
const files = fs.readdirSync(CONTENT_DIR).filter(f => f.endsWith('.md'));

files.forEach(file => {
  const mdFile = path.join(CONTENT_DIR, file);
  let content = fs.readFileSync(mdFile, 'utf-8');
  
  const match = content.match(/---\r?\n([\s\S]+?)\r?\n---/);
  if (!match) return;

  const frontmatterStr = match[0];
  let body = content.substring(match[0].length);

  // Split by line and trim leading whitespace from each line
  let lines = body.split(/\r?\n/);
  lines = lines.map(line => line.trimStart());
  
  // Rejoin and fix multiple blank lines
  body = lines.join('\n').replace(/\n{3,}/g, '\n\n');

  fs.writeFileSync(mdFile, `${frontmatterStr}\n\n${body.trim()}\n`);
  console.log(`Cleaned indentation for ${file}`);
});
