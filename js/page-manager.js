/**
 * PageManager - SPA-style navigation manager with WebGL transitions
 * Handles internal link interception, history management, and page lifecycle
 */

import { PageTransition } from './transitions.js';

export class PageManager {
  constructor(options = {}) {
    this.options = {
      transitionSelector: '[data-transition]',
      internalLinkAttribute: 'data-internal-link',
      contentSelector: '#page-content',
      preserveScroll: false,
      prefetch: true,
      ...options
    };

    this.transition = new PageTransition();
    this.currentPage = null;
    this.isNavigating = false;
    this.pages = new Map();
    this.beforeTransitionCallbacks = [];
    this.afterTransitionCallbacks = [];
    this.abortController = null;

    // Bind methods
    this.handleClick = this.handleClick.bind(this);
    this.handlePopState = this.handlePopState.bind(this);
  }

  /**
   * Initialize the page manager
   */
  init() {
    this.currentPage = {
      url: window.location.href,
      pathname: window.location.pathname,
      title: document.title
    };

    // Register current page
    this.pages.set(window.location.pathname, {
      url: window.location.href,
      title: document.title,
      config: {}
    });

    // Set up event listeners
    this.setupEventListeners();

    // Initialize transition system
    this.transition.init();

    return this;
  }

  /**
   * Set up event delegation for link handling
   */
  setupEventListeners() {
    // Intercept all clicks for internal navigation
    document.addEventListener('click', this.handleClick, { capture: true });

    // Handle browser back/forward
    window.addEventListener('popstate', this.handlePopState);
  }

  /**
   * Remove all event listeners
   */
  destroy() {
    document.removeEventListener('click', this.handleClick, { capture: true });
    window.removeEventListener('popstate', this.handlePopState);

    if (this.abortController) {
      this.abortController.abort();
    }

    this.transition.destroy();
  }

  /**
   * Handle click events for internal navigation
   */
  handleClick(event) {
    const link = event.target.closest('a');
    if (!link) return;

    // Check if this is an internal link
    if (!this.isInternalLink(link)) return;

    // Don't intercept if modifier keys are pressed
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

    // Don't intercept if link has specific attributes
    if (link.hasAttribute('download')) return;
    if (link.getAttribute('target') === '_blank') return;

    event.preventDefault();

    const url = link.href;
    const pathname = new URL(url).pathname;

    // Get page-specific config if registered
    const pageConfig = this.pages.get(pathname) || {};

    // Navigate with transition
    this.navigateTo(url, {
      trigger: 'click',
      element: link,
      ...pageConfig.options
    });
  }

  /**
   * Check if a link is internal (same origin)
   */
  isInternalLink(link) {
    // Check explicit internal link attribute
    if (link.hasAttribute(this.options.internalLinkAttribute)) {
      return true;
    }

    const href = link.getAttribute('href');
    if (!href) return false;

    // Skip anchor-only links (handled separately)
    if (href.startsWith('#')) return false;

    // Skip external links
    if (href.startsWith('http') || href.startsWith('//')) {
      const linkUrl = new URL(href, window.location.origin);
      return linkUrl.origin === window.location.origin;
    }

    // Relative links are internal
    return true;
  }

  /**
   * Navigate to a URL with WebGL transition
   */
  async navigateTo(url, options = {}) {
    if (this.isNavigating) {
      console.warn('Navigation already in progress');
      return;
    }

    this.isNavigating = true;
    const urlObj = new URL(url, window.location.origin);
    const pathname = urlObj.pathname;

    // Run before transition hooks
    await this.runBeforeTransitionCallbacks({
      from: this.currentPage,
      to: { url, pathname },
      ...options
    });

    // Start transition animation
    await this.transition.start({
      direction: options.direction || 'forward',
      intensity: options.intensity || 'normal'
    });

    try {
      // Determine navigation strategy
      if (options.spaMode !== false && this.supportsSPAMode(pathname)) {
        // SPA mode: fetch and swap content
        await this.loadContentSPA(url, pathname, options);
      } else {
        // Full page navigation with overlay
        await this.loadContentFullPage(url, pathname, options);
      }

      // Update current page reference
      this.currentPage = {
        url,
        pathname,
        title: document.title
      };

      // Update history
      if (options.pushState !== false) {
        window.history.pushState(
          { pathname, url, timestamp: Date.now() },
          document.title,
          url
        );
      }

      // Scroll handling
      this.handleScroll(options);

      // Re-initialize page effects
      await this.reinitializePage();

      // End transition
      await this.transition.end();

      // Run after transition hooks
      await this.runAfterTransitionCallbacks({
        from: { url, pathname },
        to: this.currentPage,
        ...options
      });

    } catch (error) {
      console.error('Navigation failed:', error);
      // Fallback to standard navigation
      window.location.href = url;
    } finally {
      this.isNavigating = false;
    }
  }

  /**
   * Check if SPA mode is supported for a pathname
   */
  supportsSPAMode(pathname) {
    // Check if page is registered with SPA support
    const pageConfig = this.pages.get(pathname);
    if (pageConfig && pageConfig.config.spaMode === false) {
      return false;
    }

    // Supported pages
    const supportedPaths = [
      '/',
      '/index.html',
      '/writing.html',
      '/article.html'
    ];

    return supportedPaths.some(path => pathname === path || pathname.endsWith(path));
  }

  /**
   * Load content in SPA mode (fetch and swap)
   */
  async loadContentSPA(url, pathname, options) {
    this.abortController = new AbortController();

    try {
      const response = await fetch(url, {
        signal: this.abortController.signal,
        headers: { 'X-Requested-With': 'PageManager' }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const html = await response.text();
      const parser = new DOMParser();
      const newDoc = parser.parseFromString(html, 'text/html');

      // Extract and update content
      const contentSelector = options.contentSelector || this.options.contentSelector;
      const newContent = newDoc.querySelector(contentSelector);
      const currentContent = document.querySelector(contentSelector);

      if (newContent && currentContent) {
        currentContent.innerHTML = newContent.innerHTML;
      } else {
        // Fallback: replace body content
        document.body.innerHTML = newDoc.body.innerHTML;
      }

      // Update title
      if (newDoc.title) {
        document.title = newDoc.title;
      }

      // Update meta tags
      this.updateMetaTags(newDoc);

    } finally {
      this.abortController = null;
    }
  }

  /**
   * Load content via full page navigation (with overlay)
   */
  async loadContentFullPage(url, pathname, options) {
    // Create a hidden iframe to preload the page
    const iframe = document.createElement('iframe');
    iframe.style.cssText = 'position:fixed;visibility:hidden;pointer-events:none;width:0;height:0;';
    document.body.appendChild(iframe);

    // Preload via iframe
    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Navigation timeout'));
      }, 10000);

      iframe.onload = () => {
        clearTimeout(timeout);
        resolve();
      };

      iframe.onerror = () => {
        clearTimeout(timeout);
        reject(new Error('Failed to load page'));
      };

      iframe.src = url;
    });

    // Allow browser to navigate
    window.location.href = url;

    // Cleanup
    document.body.removeChild(iframe);
  }

  /**
   * Update meta tags from new document
   */
  updateMetaTags(newDoc) {
    const metaSelectors = [
      'meta[name="description"]',
      'meta[property^="og:"]',
      'meta[name="twitter:"]',
      'link[rel="canonical"]'
    ];

    metaSelectors.forEach(selector => {
      const newMeta = newDoc.querySelector(selector);
      const currentMeta = document.querySelector(selector);

      if (newMeta && currentMeta) {
        currentMeta.content = newMeta.content;
      } else if (newMeta) {
        document.head.appendChild(newMeta.cloneNode(true));
      }
    });
  }

  /**
   * Handle scroll position after navigation
   */
  handleScroll(options) {
    if (options.preserveScroll || this.options.preserveScroll) {
      return;
    }

    if (options.scrollTo) {
      window.scrollTo({
        top: options.scrollTo,
        behavior: options.scrollBehavior || 'auto'
      });
    } else if (window.location.hash) {
      const target = document.querySelector(window.location.hash);
      if (target) {
        target.scrollIntoView({ behavior: 'auto' });
      }
    } else {
      window.scrollTo(0, 0);
    }
  }

  /**
   * Handle browser back/forward buttons
   */
  async handlePopState(event) {
    if (!event.state) return;

    const { pathname, url } = event.state;
    const direction = this.getNavigationDirection(pathname);

    await this.navigateTo(url, {
      pushState: false,
      direction,
      spaMode: this.supportsSPAMode(pathname)
    });
  }

  /**
   * Determine navigation direction for transitions
   */
  getNavigationDirection(newPathname) {
    const pageOrder = ['/index.html', '/writing.html', '/article.html'];
    const currentIndex = pageOrder.indexOf(this.currentPage?.pathname || '/index.html');
    const newIndex = pageOrder.indexOf(newPathname);

    if (newIndex > currentIndex) return 'forward';
    if (newIndex < currentIndex) return 'backward';
    return 'forward';
  }

  /**
   * Re-initialize page effects after navigation
   */
  async reinitializePage() {
    // Re-run main.js initializers
    this.reinitializeVisitorNames();
    this.reinitializeGridItems();
    this.reinitializeCustomCursor();
    this.reinitializeScrollProgress();
    this.reinitializeTextReveal();
    this.reinitializeLinkScramble();
    this.reinitializeRandomGlitch();
    this.reinitializeKeyboardNav();

    // Re-initialize WebGL hero if present
    this.reinitializeWebGLHero();

    // Dispatch custom event for other components
    window.dispatchEvent(new CustomEvent('page:loaded', {
      detail: { page: this.currentPage }
    }));
  }

  /**
   * Re-initialize visitor name inputs
   */
  reinitializeVisitorNames() {
    const visitorNameNodes = document.querySelectorAll('.visitorName');
    if (!visitorNameNodes.length) return;

    visitorNameNodes.forEach(div => {
      const setVisitorName = sessionStorage.getItem('visitorName');
      if (typeof setVisitorName === 'string' && setVisitorName !== 'undefined' && setVisitorName !== '') {
        div.innerHTML = setVisitorName;
      }
    });
  }

  /**
   * Re-initialize grid items
   */
  reinitializeGridItems() {
    const gridItems = document.querySelectorAll('.grid__item.readme');
    const modalTemplate = document.querySelector('.modalTemplate');
    const modalCode = document.querySelector('.modalTemplate > div.markdown');

    if (!gridItems.length || !modalTemplate) return;

    const readmes = {};
    let reverse = false;

    gridItems.forEach(div => {
      // Remove old listeners by cloning
      const newDiv = div.cloneNode(true);
      div.parentNode.replaceChild(newDiv, div);

      newDiv.addEventListener('mousemove', (e) => {
        let left = e.pageX + 3;
        if (left >= (window.innerWidth - 400) || reverse) {
          left = left - 403;
          reverse = true;
        }
        if (left <= 400 && reverse) {
          left = e.pageX + 3;
          reverse = false;
        }
        modalTemplate.style.left = `${left}px`;
        modalTemplate.style.top = `${e.pageY + 10}px`;
      });

      newDiv.addEventListener('mouseover', async (e) => {
        const readmeUrl = e.target.closest('.grid__item')?.dataset.readme;
        if (!readmeUrl) return;

        if (readmes[readmeUrl]) {
          modalCode.innerHTML = readmes[readmeUrl];
        } else {
          try {
            const response = await fetch(readmeUrl);
            const readme = await response.text();
            readmes[readmeUrl] = readme;
            modalCode.innerHTML = readme;
          } catch (err) {
            console.error('Failed to load README:', err);
          }
        }
        modalTemplate.style.display = 'block';
      });

      newDiv.addEventListener('mouseout', () => {
        modalTemplate.style.display = 'none';
      });
    });
  }

  /**
   * Re-initialize custom cursor
   */
  reinitializeCustomCursor() {
    const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (isTouchDevice || prefersReducedMotion) return;

    // Remove existing cursors
    document.querySelectorAll('.custom-cursor, .custom-cursor-depth').forEach(el => el.remove());

    // Re-create cursor elements
    const cursor = document.createElement('div');
    cursor.className = 'custom-cursor';
    document.body.appendChild(cursor);

    const cursorDepth = document.createElement('div');
    cursorDepth.className = 'custom-cursor-depth';
    document.body.appendChild(cursorDepth);

    // Initialize cursor position
    cursor.style.cssText = 'opacity:1;visibility:visible;display:block;';
    cursorDepth.style.cssText = 'opacity:1;visibility:visible;display:block;';

    // Re-attach hover listeners
    const hoverSelectors = ['a', 'button', '.grid__item', 'input', 'textarea', '.title'];
    hoverSelectors.forEach(selector => {
      document.querySelectorAll(selector).forEach(el => {
        el.addEventListener('mouseenter', () => {
          cursor.classList.add('hover');
          cursorDepth.classList.add('hover');
        });
        el.addEventListener('mouseleave', () => {
          cursor.classList.remove('hover');
          cursorDepth.classList.remove('hover');
        });
      });
    });
  }

  /**
   * Re-initialize scroll progress indicator
   */
  reinitializeScrollProgress() {
    const existing = document.querySelector('.scroll-progress');
    if (existing) existing.remove();

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const progressContainer = document.createElement('div');
    progressContainer.className = 'scroll-progress';

    const progressBar = document.createElement('div');
    progressBar.className = 'scroll-progress-bar';

    progressContainer.appendChild(progressBar);
    document.body.appendChild(progressContainer);

    let progressTicking = false;
    function updateScrollProgress() {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      progressBar.style.width = scrollPercent + '%';
      progressTicking = false;
    }

    window.addEventListener('scroll', () => {
      if (!progressTicking) {
        requestAnimationFrame(updateScrollProgress);
        progressTicking = true;
      }
    });

    updateScrollProgress();
  }

  /**
   * Re-initialize text reveal animations
   */
  reinitializeTextReveal() {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const revealElements = document.querySelectorAll('[data-text-reveal]');
    revealElements.forEach(el => {
      el.classList.remove('visible');

      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.5 });

      observer.observe(el);
    });
  }

  /**
   * Re-initialize link scramble effect
   */
  reinitializeLinkScramble() {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const charset = '!<>-_\\/[]{}—=+*^?#________';

    class TextScramble {
      constructor(el) {
        this.el = el;
        this.originalText = el.innerText;
        this.frame = 0;
        this.queue = [];
        this.isAnimating = false;
        this.frameRequest = null;
      }

      scramble() {
        if (this.isAnimating) return;
        this.isAnimating = true;

        const length = this.originalText.length;
        this.queue = [];
        const totalFrames = 24;

        for (let i = 0; i < length; i++) {
          const revealFrame = Math.floor((i / length) * totalFrames);
          this.queue.push({
            char: this.originalText[i],
            revealFrame: revealFrame,
            currentChar: this.randomChar()
          });
        }

        this.frame = 0;
        this.update();
      }

      update() {
        let output = '';
        let complete = 0;

        for (let i = 0; i < this.queue.length; i++) {
          const item = this.queue[i];
          if (this.frame >= item.revealFrame) {
            output += item.char;
            complete++;
          } else {
            if (Math.random() < 0.3) {
              item.currentChar = this.randomChar();
            }
            output += item.currentChar;
          }
        }

        this.el.innerText = output;

        if (complete === this.queue.length) {
          this.isAnimating = false;
          this.el.innerText = this.originalText;
          if (this.frameRequest) {
            cancelAnimationFrame(this.frameRequest);
            this.frameRequest = null;
          }
        } else {
          this.frame++;
          this.frameRequest = requestAnimationFrame(() => this.update());
        }
      }

      randomChar() {
        return charset[Math.floor(Math.random() * charset.length)];
      }
    }

    document.querySelectorAll('a').forEach(link => {
      if (!link.innerText.trim()) return;
      const scrambler = new TextScramble(link);
      link.addEventListener('mouseenter', () => scrambler.scramble());
    });
  }

  /**
   * Re-initialize random glitch effects
   */
  reinitializeRandomGlitch() {
    // Clear existing glitch intervals if any
    if (window._glitchInterval) {
      clearInterval(window._glitchInterval);
    }

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;
    const glitchSelectors = ['.grid__item', '.title h1', '.profile p', 'a'];

    function getRandomElement() {
      const allElements = [];
      glitchSelectors.forEach(selector => {
        document.querySelectorAll(selector).forEach(el => allElements.push(el));
      });
      if (allElements.length === 0) return null;
      return allElements[Math.floor(Math.random() * allElements.length)];
    }

    function triggerGlitch() {
      const numElements = Math.random() < 0.7 ? 1 : 2;
      for (let i = 0; i < numElements; i++) {
        const element = getRandomElement();
        if (!element) continue;

        const isIntense = Math.random() < 0.3;
        element.classList.add('glitch-active');
        if (isIntense) element.classList.add('glitch-intense');

        const duration = isIntense ? 250 : 200;
        setTimeout(() => {
          element.classList.remove('glitch-active', 'glitch-intense');
        }, duration);
      }

      const minDelay = isTouchDevice ? 8000 : 3000;
      const maxDelay = isTouchDevice ? 12000 : 6000;
      const delay = minDelay + Math.random() * (maxDelay - minDelay);
      window._glitchInterval = setTimeout(triggerGlitch, delay);
    }

    window._glitchInterval = setTimeout(triggerGlitch, 2000);
  }

  /**
   * Re-initialize keyboard navigation
   */
  reinitializeKeyboardNav() {
    const sections = ['.hero-brutalist', '#profile', '#projects', '#social'];

    function getSectionElements() {
      return sections.map(selector => document.querySelector(selector)).filter(el => el !== null);
    }

    let currentSectionIndex = 0;

    function scrollToSection(index) {
      const sectionElements = getSectionElements();
      if (index < 0 || index >= sectionElements.length) return;
      currentSectionIndex = index;
      const target = sectionElements[index];
      target.scrollIntoView({ behavior: 'auto' });
      target.style.outline = '4px solid #f3cd05';
      setTimeout(() => {
        target.style.outline = '';
      }, 300);
    }

    function findCurrentSection() {
      const sectionElements = getSectionElements();
      const scrollPos = window.scrollY + window.innerHeight / 2;

      for (let i = 0; i < sectionElements.length; i++) {
        const rect = sectionElements[i].getBoundingClientRect();
        const sectionTop = rect.top + window.scrollY;
        const sectionBottom = sectionTop + rect.height;
        if (scrollPos >= sectionTop && scrollPos < sectionBottom) {
          return i;
        }
      }
      return 0;
    }

    // Remove existing listener and add new one
    document.removeEventListener('keydown', this._keyboardNavHandler);
    this._keyboardNavHandler = (e) => {
      const sectionElements = getSectionElements();
      if (sectionElements.length === 0) return;

      currentSectionIndex = findCurrentSection();

      switch (e.key) {
        case 'ArrowDown':
        case 'PageDown':
          e.preventDefault();
          if (currentSectionIndex < sectionElements.length - 1) {
            scrollToSection(currentSectionIndex + 1);
          }
          break;
        case 'ArrowUp':
        case 'PageUp':
          e.preventDefault();
          if (currentSectionIndex > 0) {
            scrollToSection(currentSectionIndex - 1);
          }
          break;
        case 'Home':
          e.preventDefault();
          scrollToSection(0);
          break;
        case 'End':
          e.preventDefault();
          scrollToSection(sectionElements.length - 1);
          break;
      }
    };
    document.addEventListener('keydown', this._keyboardNavHandler);
  }

  /**
   * Re-initialize WebGL hero
   */
  reinitializeWebGLHero() {
    const canvas = document.getElementById('hero-canvas');
    if (!canvas) return;

    // Check if THREE is available
    if (typeof THREE === 'undefined') return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;
    if (isTouchDevice) return;

    // The main.js initialization should handle this
    // We just need to ensure the canvas exists
    if (canvas && typeof initHeroWebGL === 'function') {
      initHeroWebGL();
    }
  }

  /**
   * Register a hook to run before transition starts
   */
  onBeforeTransition(callback) {
    this.beforeTransitionCallbacks.push(callback);
    return () => {
      const index = this.beforeTransitionCallbacks.indexOf(callback);
      if (index > -1) this.beforeTransitionCallbacks.splice(index, 1);
    };
  }

  /**
   * Register a hook to run after transition completes
   */
  onAfterTransition(callback) {
    this.afterTransitionCallbacks.push(callback);
    return () => {
      const index = this.afterTransitionCallbacks.indexOf(callback);
      if (index > -1) this.afterTransitionCallbacks.splice(index, 1);
    };
  }

  /**
   * Run before transition callbacks
   */
  async runBeforeTransitionCallbacks(context) {
    for (const callback of this.beforeTransitionCallbacks) {
      await callback(context);
    }
  }

  /**
   * Run after transition callbacks
   */
  async runAfterTransitionCallbacks(context) {
    for (const callback of this.afterTransitionCallbacks) {
      await callback(context);
    }
  }

  /**
   * Register page-specific configuration
   */
  registerPage(url, config = {}) {
    const pathname = new URL(url, window.location.origin).pathname;
    this.pages.set(pathname, {
      url,
      config,
      options: config.options || {}
    });
    return this;
  }

  /**
   * Unregister a page
   */
  unregisterPage(url) {
    const pathname = new URL(url, window.location.origin).pathname;
    this.pages.delete(pathname);
    return this;
  }

  /**
   * Prefetch a page for faster navigation
   */
  async prefetch(url) {
    if (!this.options.prefetch) return;

    const pathname = new URL(url, window.location.origin).pathname;
    if (this.pages.has(pathname)) return;

    try {
      const response = await fetch(url, {
        headers: { 'X-Requested-With': 'PageManager-Prefetch' }
      });

      if (response.ok) {
        this.pages.set(pathname, {
          url,
          prefetched: true,
          html: await response.text()
        });
      }
    } catch (err) {
      // Silently fail prefetch
    }
  }
}

export default PageManager;
