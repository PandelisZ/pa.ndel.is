/**
 * PageManager - internal navigation wrapper.
 *
 * Navigation intentionally stays as real document loads. The transition engine
 * provides the exit/entry animation around those loads, while page-specific
 * scripts continue to run normally on each destination.
 */

class PageManager {
  constructor(options = {}) {
    this.options = {
      internalLinkAttribute: 'data-internal-link',
      prefetch: true,
      prefetchDelay: 90,
      ...options
    };

    this.isNavigating = false;
    this.prefetched = new Set();
    this.prefetchTimer = null;
    this.handleClick = this.handleClick.bind(this);
    this.handlePointerOver = this.handlePointerOver.bind(this);
  }

  init() {
    document.addEventListener('click', this.handleClick, { capture: true });

    if (this.options.prefetch) {
      document.addEventListener('pointerover', this.handlePointerOver, { capture: true });
    }

    return this;
  }

  destroy() {
    document.removeEventListener('click', this.handleClick, { capture: true });
    document.removeEventListener('pointerover', this.handlePointerOver, { capture: true });
    clearTimeout(this.prefetchTimer);
  }

  handleClick(event) {
    const link = event.target.closest('a');
    if (!link || !this.shouldHandleLink(link, event)) return;

    const url = new URL(link.href, window.location.href);

    if (this.isSameDocumentHash(url)) {
      return;
    }

    event.preventDefault();
    this.navigateTo(url.href, { trigger: 'click', element: link });
  }

  handlePointerOver(event) {
    const link = event.target.closest('a');
    if (!link || !this.isInternalLink(link)) return;

    const url = new URL(link.href, window.location.href);
    if (this.isSameDocumentHash(url)) return;

    clearTimeout(this.prefetchTimer);
    this.prefetchTimer = setTimeout(() => this.prefetch(url.href), this.options.prefetchDelay);
  }

  shouldHandleLink(link, event) {
    if (!this.isInternalLink(link)) return false;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return false;
    if (link.hasAttribute('download')) return false;
    if (link.getAttribute('target') === '_blank') return false;
    return true;
  }

  isInternalLink(link) {
    const href = link.getAttribute('href');
    if (!href || href.startsWith('javascript:') || href.startsWith('mailto:') || href.startsWith('tel:')) {
      return false;
    }

    if (href.startsWith('#')) return false;

    const url = new URL(href, window.location.href);
    const isSameOrigin = url.origin === window.location.origin;
    const isMarkedInternal = link.hasAttribute(this.options.internalLinkAttribute);

    return isSameOrigin && (isMarkedInternal || this.isLocalDocument(url));
  }

  isLocalDocument(url) {
    const pathname = url.pathname;
    return pathname === '/' || pathname.endsWith('.html') || !pathname.split('/').pop().includes('.');
  }

  isSameDocumentHash(url) {
    return url.pathname === window.location.pathname &&
      url.search === window.location.search &&
      Boolean(url.hash);
  }

  async navigateTo(url, options = {}) {
    if (this.isNavigating) return;

    this.isNavigating = true;

    try {
      const transition = this.getTransition();

      if (transition && transition.ready && typeof transition.transitionTo === 'function') {
        await transition.transitionTo(url, options);
        return;
      }

      window.location.href = url;
    } catch (error) {
      console.error('[PageManager] Navigation failed, falling back to hard navigation', error);
      window.location.href = url;
    }
  }

  getTransition() {
    if (window.pageTransition && window.pageTransition.ready) {
      return window.pageTransition;
    }

    if (typeof window.initPageTransitions === 'function') {
      return window.initPageTransitions();
    }

    return null;
  }

  async prefetch(url) {
    if (this.prefetched.has(url)) return;
    this.prefetched.add(url);

    try {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = url;
      document.head.appendChild(link);
    } catch (error) {
      this.prefetched.delete(url);
    }
  }
}

window.PageManager = PageManager;
window.pageManager = new PageManager().init();
