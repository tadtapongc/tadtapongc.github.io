const fs = require('fs');
const path = require('path');

const CONTENT_DIR = path.join(__dirname, 'content', 'works');
const files = fs.readdirSync(CONTENT_DIR).filter(f => f.endsWith('.md'));

files.forEach(file => {
  const mdFile = path.join(CONTENT_DIR, file);
  let content = fs.readFileSync(mdFile, 'utf-8');
  
  const match = content.match(/---\r?\n([\s\S]+?)\r?\n---/);
  if (!match) {
    console.log(`Failed to match frontmatter in ${file}`);
    return;
  }

  const frontmatterStr = match[0];
  let body = content.substring(match[0].length);

  // 1. Remove <article> wrappers
  body = body.replace(/<article[^>]*>/g, '');
  body = body.replace(/<\/article>/g, '');
  
  // 2. Convert <div class="highlight-card"> to blockquote
  body = body.replace(/<div class="highlight-card[^>]*>([\s\S]*?)<\/div>/g, (match, inner) => {
    let cleanInner = inner
      .replace(/<h4>(.*?)<\/h4>/g, '#### $1')
      .replace(/<p>([\s\S]*?)<\/p>/g, '$1')
      .trim();
      
    return cleanInner.split('\n').map(line => {
      let l = line.trim();
      return l ? '> ' + l : '>';
    }).join('\n') + '\n';
  });

  // 3. Convert h3 and p
  body = body.replace(/<h3>(.*?)<\/h3>/g, '### $1');
  body = body.replace(/<p>([\s\S]*?)<\/p>/g, (m, p1) => p1.trim() + '\n');
  body = body.replace(/<ul>([\s\S]*?)<\/ul>/g, (m, u1) => u1.trim() + '\n');
  body = body.replace(/<li><strong>(.*?)<\/strong>:(.*?)<\/li>/g, '- **$1**:$2');
  body = body.replace(/<li>(.*?)<\/li>/g, '- $1');

  // Fix multiple empty lines
  body = body.replace(/\n{3,}/g, '\n\n');

  fs.writeFileSync(mdFile, `${frontmatterStr}\n\n${body.trim()}\n`);
  console.log(`Cleaned ${file}`);
});
