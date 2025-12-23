(() => {
  'use strict';

  // ---- config ----
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // If a snap container exists, it is the scroller + viewport for reveal purposes.
  const SNAP_ROOT = document.querySelector('.snap') || null;

  // ---- word splitting ----
  function splitIntoWords(element) {
    if (element.dataset.processed === 'true') return;
    if (prefersReducedMotion) {
      element.dataset.processed = 'true';
      return;
    }

    const text = element.textContent.trim();
    if (!text) return;

    const words = text.split(/\s+/);
    if (words.length > 40) {
      element.dataset.processed = 'true';
      return;
    }

    const fragment = document.createDocumentFragment();
    words.forEach((word, index) => {
      const span = document.createElement('span');
      span.className = 'reveal-word';
      span.textContent = word;
      span.style.setProperty('--word-index', index);
      fragment.appendChild(span);

      if (index < words.length - 1) {
        fragment.appendChild(document.createTextNode(' '));
      }
    });

    element.textContent = '';
    element.appendChild(fragment);
    element.dataset.processed = 'true';
  }

  function splitIntoWordsWithLinks(element) {
    if (element.dataset.processed === 'true') return;
    if (prefersReducedMotion) {
      element.dataset.processed = 'true';
      return;
    }

    const text = element.textContent.trim();
    if (!text) return;

    const words = text.split(/\s+/);
    if (words.length > 40) {
      element.dataset.processed = 'true';
      return;
    }

    const links = element.querySelectorAll('a');
    if (links.length > 0) {
      const clone = element.cloneNode(true);
      const walker = document.createTreeWalker(clone, NodeFilter.SHOW_TEXT, null, false);

      const textNodes = [];
      let node;
      while ((node = walker.nextNode())) {
        if (node.textContent.trim()) textNodes.push(node);
      }

      // keep a single global running index so stagger order is consistent
      let globalIndex = 0;

      textNodes.forEach((textNode) => {
        const w = textNode.textContent.trim().split(/\s+/);
        const fragment = document.createDocumentFragment();

        w.forEach((word) => {
          const span = document.createElement('span');
          span.className = 'reveal-word';
          span.textContent = word;
          span.style.setProperty('--word-index', globalIndex++);
          fragment.appendChild(span);
          fragment.appendChild(document.createTextNode(' '));
        });

        // remove trailing extra space
        if (fragment.lastChild) fragment.removeChild(fragment.lastChild);
        textNode.parentNode.replaceChild(fragment, textNode);
      });

      element.innerHTML = clone.innerHTML;
      element.dataset.processed = 'true';
      return;
    }

    splitIntoWords(element);
  }

  // ---- processing targets ----
  function processElements() {
    const primarySelectors = [
      'h1','h2','h3','h4','h5','h6',
      '.hero-title','.page-title','.title',
      'p','li','a',
      '.reveal','[data-reveal]'
    ];

    const elements = new Set();

    primarySelectors.forEach((selector) => {
      try {
        document.querySelectorAll(selector).forEach((el) => {
          if (
            el.dataset.processed === 'true' ||
            el.classList.contains('reveal-word') ||
            el.closest('[data-processed="true"]')
          ) return;

          const t = el.textContent.trim();
          if (t) elements.add(el);
        });
      } catch (_) {}
    });

    // Only split text on divs if they explicitly opt-in via data-reveal
    document.querySelectorAll('div[data-reveal]').forEach((el) => {
      if (el.dataset.processed === 'true') return;
      const t = el.textContent.trim();
      if (t) elements.add(el);
    });

    elements.forEach((el) => splitIntoWordsWithLinks(el));
  }

  // ---- animation trigger ----
  function triggerAnimation(element) {
    if (element.dataset.revealed === 'true') return;
    element.dataset.revealed = 'true';

    const words = element.querySelectorAll('.reveal-word');
    if (words.length > 0) {
      const stagger = parseInt(element.style.getPropertyValue('--stagger')) || 45;
      words.forEach((word, index) => {
        const delay = index * stagger;
        setTimeout(() => {
          word.classList.add('reveal-word-on');
          // Ensure parent link also gets proper styling if word is inside a link
          const parentLink = word.closest('a.soft-link');
          if (parentLink) {
            parentLink.style.color = 'inherit';
          }
        }, delay);
      });
    } else {
      element.classList.add('reveal-on');
    }
  }

  // viewport test relative to snap root if present
  function isInViewport(el) {
    const rect = el.getBoundingClientRect();

    if (!SNAP_ROOT) {
      const windowHeight = window.innerHeight || document.documentElement.clientHeight;
      const threshold = windowHeight * 0.15;
      return rect.top < windowHeight - threshold && rect.bottom > threshold;
    }

    const rootRect = SNAP_ROOT.getBoundingClientRect();
    const rootHeight = rootRect.height;
    const threshold = rootHeight * 0.15;

    // element is considered visible if it intersects the snap viewport band
    return rect.top < rootRect.bottom - threshold && rect.bottom > rootRect.top + threshold;
  }

  // ---- observers ----
  function observeElements() {
    const targets = document.querySelectorAll(
      'h1, h2, h3, h4, h5, h6, .hero-title, .page-title, .title, .reveal, [data-reveal], p, li, .topline a, .bracket a'
    );

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            triggerAnimation(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        root: SNAP_ROOT,                 // KEY FIX
        rootMargin: '0px 0px -10% 0px',
        threshold: 0.15
      }
    );

    targets.forEach((el) => {
      const hasWords = el.querySelectorAll('.reveal-word').length > 0;
      const isReveal = el.classList.contains('reveal') || el.hasAttribute('data-reveal');

      // Always observe elements with data-reveal or reveal class, even if they don't have words
      if (!hasWords && !isReveal) return;
      
      // Skip if already revealed
      if (el.dataset.revealed === 'true') return;

      if (isInViewport(el)) {
        setTimeout(() => triggerAnimation(el), 60);
      } else {
        observer.observe(el);
      }
    });
    
    // Also observe paragraphs with data-reveal that might have been skipped (e.g., >40 words)
    // This ensures ALL paragraphs with data-reveal get animated, even if they weren't split
    const allParagraphs = document.querySelectorAll('p[data-reveal], .p[data-reveal]');
    const targetsSet = new Set(targets);
    
    allParagraphs.forEach((el) => {
      // Skip if already revealed
      if (el.dataset.revealed === 'true') return;
      
      // Check if this element is already in the targets list
      const alreadyObserved = targetsSet.has(el);
      
      if (!alreadyObserved) {
        const hasWords = el.querySelectorAll('.reveal-word').length > 0;
        
        // If no words but has data-reveal, ensure it gets the reveal-on class
        if (!hasWords) {
          if (isInViewport(el)) {
            setTimeout(() => {
              el.classList.add('reveal-on');
              el.dataset.revealed = 'true';
            }, 60);
          } else {
            observer.observe(el);
          }
        } else {
          // Has words but might not have been observed - ensure it's observed
          if (!isInViewport(el)) {
            observer.observe(el);
          } else {
            setTimeout(() => triggerAnimation(el), 60);
          }
        }
      }
    });

    // If using snap root, re-check on snap scroll for cases where IO misses fast snapping.
    if (SNAP_ROOT) {
      let ticking = false;
      SNAP_ROOT.addEventListener('scroll', () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
          ticking = false;
          targets.forEach((el) => {
            if (el.dataset.revealed === 'true') return;
            const hasWords = el.querySelectorAll('.reveal-word').length > 0;
            const isReveal = el.classList.contains('reveal') || el.hasAttribute('data-reveal');
            if (!hasWords && !isReveal) return;
            if (isInViewport(el)) triggerAnimation(el);
          });
        });
      }, { passive: true });
    }
  }

  // ---- init ----
  function init() {
    const run = () => {
      processElements();
      setTimeout(observeElements, 50);
    };

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', run);
    } else {
      run();
    }
  }

  init();
})();


