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

const SITE = 'Pandelis Zembashis';
const ORIGIN = 'https://pa.ndel.is';

const escapeHtml = value => String(value == null ? '' : value)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;');

// Use function replacers so "$" sequences in content are never interpreted.
const replaceOnce = (html, pattern, replacement) => html.replace(pattern, () => replacement);

function navLink(direction, article) {
  return `<span class="nav-direction">${direction}</span> <a href="/article/${encodeURIComponent(article.slug)}" data-internal-link class="nav-article-title" data-cursor="hover">${article.title}</a>`;
}

function renderArticle(template, article, index, list) {
  const title = `${article.title} | ${SITE}`;
  const url = `${ORIGIN}/article/${encodeURIComponent(article.slug)}`;
  const description = article.excerpt || '';
  const firstImage = (article.content || '').match(/<img[^>]+src="(\/[^"]+)"/);
  const image = article.image
    ? (/^https?:/.test(article.image) ? article.image : ORIGIN + article.image)
    : firstImage ? ORIGIN + firstImage[1] : `${ORIGIN}/social-banner.png`;
  const tags = article.tags && article.tags.length ? article.tags : [article.category || 'ARTICLE'];

  let html = template;
  html = replaceOnce(html, /<title>[\s\S]*?<\/title>/, `<title>${escapeHtml(title)}</title>`);
  html = replaceOnce(html, /<meta property="og:title"[^>]*>/, `<meta property="og:title" content="${escapeHtml(title)}">`);
  html = replaceOnce(html, /<meta property="og:url"[^>]*>/, `<meta property="og:url" content="${escapeHtml(url)}">`);
  html = replaceOnce(html, /<meta property="og:description"[^>]*>/, `<meta property="og:description" content="${escapeHtml(description)}">`);
  html = replaceOnce(html, /<meta property="og:image"[^>]*>/, `<meta property="og:image" content="${escapeHtml(image)}">`);

  const extraHead = [
    `<meta name="description" content="${escapeHtml(description)}">`,
    `<link rel="canonical" href="${escapeHtml(url)}">`,
    `<meta name="twitter:card" content="summary_large_image">`,
    `<meta name="twitter:title" content="${escapeHtml(title)}">`,
    `<meta name="twitter:description" content="${escapeHtml(description)}">`,
    `<meta name="twitter:image" content="${escapeHtml(image)}">`,
    article.date ? `<meta property="article:published_time" content="${escapeHtml(article.date)}">` : ''
  ].filter(Boolean).join('');
  html = replaceOnce(html, /<\/head>/, `${extraHead}</head>`);

  html = html.replace(/(id="article-slug">)[^<]*/, (m, open) => open + escapeHtml(article.slug));
  html = html.replace(/(<h1[^>]*id="article-title"[^>]*>)[^<]*/, (m, open) => open + escapeHtml(article.title));
  html = html.replace(/(id="article-date">)[^<]*/, (m, open) => open + escapeHtml(article.date || '-'));
  html = html.replace(/(id="article-readtime">)[^<]*/, (m, open) => open + escapeHtml(article.readTime ? article.readTime.toUpperCase() : '-'));
  html = html.replace(/(id="article-tags">)\s*(?=<\/)/, (m, open) => open + tags.map(t => `<span class="tag">${escapeHtml(String(t).toUpperCase())}</span>`).join(''));
  html = html.replace(/(<div[^>]*id="article-body"[^>]*>)[\s\S]*?(<\/div>\s*<nav class="article-nav-footer")/, (m, open, close) =>
    open + (article.content || `<p class="article-lead">${escapeHtml(description)}</p>`) + close);
  html = html.replace(/(id="article-nav-prev"[^>]*>)\s*(?=<\/div>)/, (m, open) => open + (index > 0 ? navLink('← PREVIOUS', list[index - 1]) : ''));
  html = html.replace(/(id="article-nav-next"[^>]*>)\s*(?=<\/div>)/, (m, open) => open + (index < list.length - 1 ? navLink('NEXT →', list[index + 1]) : ''));
  return html;
}

fs.rmSync(articleDir, { recursive: true, force: true });

for (let i = 0; i < articles.length; i++) {
  const article = articles[i];
  if (!article || !article.slug || article.externalLink) continue;

  const routeDir = path.join(articleDir, article.slug);
  fs.mkdirSync(routeDir, { recursive: true });
  fs.writeFileSync(path.join(routeDir, 'index.html'), renderArticle(template, article, i, articles));
}

console.log(`Generated ${articles.filter(article => article && article.slug && !article.externalLink).length} article routes`);
