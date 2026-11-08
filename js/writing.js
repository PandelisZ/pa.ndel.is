(function initWritingPageRenderer() {
  const ARTICLE_DATA_URL = './articles.json';

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"']/g, char => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    })[char]);
  }

  function formatDate(dateString) {
    const date = new Date(`${dateString}T00:00:00`);
    if (Number.isNaN(date.getTime())) return escapeHtml(dateString);

    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).toUpperCase();
  }

  function getDomain(url) {
    try {
      return new URL(url).hostname.replace(/^www\./, '').toUpperCase();
    } catch (error) {
      return 'EXTERNAL';
    }
  }

  function getArticleHref(article) {
    if (article.externalLink) return article.externalLink;
    return `/article/${encodeURIComponent(article.slug)}`;
  }

  function renderTags(tags = []) {
    return tags.slice(0, 3).map(tag => (
      `<span class="writing-card__tag">${escapeHtml(tag)}</span>`
    )).join('');
  }

  function renderArticleCard(article, index) {
    const href = getArticleHref(article);
    const isExternal = Boolean(article.externalLink);
    const linkAttributes = isExternal
      ? 'target="_blank" rel="noopener"'
      : 'data-internal-link';
    const linkLabel = isExternal
      ? `READ ON ${getDomain(article.externalLink)}`
      : 'READ PIECE';

    return `
      <article class="article-card writing-card glitch-target" data-cursor="hover" style="--card-index: ${index}">
        <div class="writing-card__rail">
          <span>${String(index + 1).padStart(2, '0')}</span>
          <span>${escapeHtml(article.readTime || article.category || 'WRITING')}</span>
        </div>
        <div class="writing-card__meta">
          <span class="article-date">${formatDate(article.date)}</span>
          <div class="article-tags">${renderTags(article.tags)}</div>
        </div>
        <h2 class="writing-card__title">
          <a href="${escapeHtml(href)}" ${linkAttributes}>${escapeHtml(article.title)}</a>
        </h2>
        <p class="writing-card__excerpt">${escapeHtml(article.excerpt)}</p>
        <a href="${escapeHtml(href)}" ${linkAttributes} class="read-more writing-card__link" data-cursor="hover">
          ${linkLabel} &rarr;
        </a>
      </article>
    `;
  }

  async function renderWritingPage(root = document) {
    const articleGrid = root.querySelector('#article-grid');
    const pageInfo = root.querySelector('#page-info');

    if (!articleGrid) return;

    articleGrid.dataset.state = 'loading';
    articleGrid.innerHTML = '<div class="writing-state">LOADING WRITING INDEX</div>';

    try {
      const response = await fetch(ARTICLE_DATA_URL);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();
      const articles = (data.articles || [])
        .filter(article => article && article.title && (article.slug || article.externalLink))
        .sort((a, b) => new Date(b.date) - new Date(a.date));

      if (!articles.length) {
        articleGrid.dataset.state = 'empty';
        articleGrid.innerHTML = '<div class="writing-state">NO WRITING FOUND</div>';
        if (pageInfo) pageInfo.textContent = 'SHOWING 0 OF 0';
        return;
      }

      articleGrid.dataset.state = 'ready';
      articleGrid.innerHTML = articles.map(renderArticleCard).join('');

      if (pageInfo) {
        pageInfo.textContent = `SHOWING 1-${articles.length} OF ${articles.length}`;
      }

      document.dispatchEvent(new CustomEvent('contentloaded', {
        detail: { type: 'writing', count: articles.length }
      }));
    } catch (error) {
      console.error('[Writing] Error loading articles', error);
      articleGrid.dataset.state = 'error';
      articleGrid.innerHTML = '<div class="writing-state">ERROR LOADING WRITING</div>';
      if (pageInfo) pageInfo.textContent = 'WRITING INDEX UNAVAILABLE';
    }
  }

  window.renderWritingPage = renderWritingPage;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => renderWritingPage());
  } else {
    renderWritingPage();
  }
})();
