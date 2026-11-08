const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, '..', 'dist');
const articleTemplate = path.join(distDir, 'article.html');
const articlesJson = path.join(distDir, 'articles.json');
const articleDir = path.join(distDir, 'article');

if (!fs.existsSync(articleTemplate)) {
  throw new Error(`Missing built article template at ${articleTemplate}`);
}

if (!fs.existsSync(articlesJson)) {
  throw new Error(`Missing built article data at ${articlesJson}`);
}

const data = JSON.parse(fs.readFileSync(articlesJson, 'utf8'));
const articles = Array.isArray(data.articles) ? data.articles : [];
const template = fs.readFileSync(articleTemplate, 'utf8');

fs.rmSync(articleDir, { recursive: true, force: true });

for (const article of articles) {
  if (!article || !article.slug || article.externalLink) continue;

  const routeDir = path.join(articleDir, article.slug);
  fs.mkdirSync(routeDir, { recursive: true });
  fs.writeFileSync(path.join(routeDir, 'index.html'), template);
}

console.log(`Generated ${articles.filter(article => article && article.slug && !article.externalLink).length} article routes`);
