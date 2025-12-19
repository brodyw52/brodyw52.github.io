(() => {
  'use strict';

  // Check for reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Word splitting utility - preserves spaces and inline flow
  function splitIntoWords(element) {
    if (element.dataset.processed === 'true') return;
    if (prefersReducedMotion) {
      element.dataset.processed = 'true';
      return;
    }

    const text = element.textContent.trim();
    if (!text) return;

    // Cap to max 40 words
    const words = text.split(/\s+/);
    if (words.length > 40) {
      element.dataset.processed = 'true';
      return;
    }

    // Clear element and rebuild with word spans
    const fragment = document.createDocumentFragment();
    words.forEach((word, index) => {
      const span = document.createElement('span');
      span.className = 'reveal-word';
      span.textContent = word;
      span.style.setProperty('--word-index', index);
      fragment.appendChild(span);
      
      // Add space after word (except last)
      if (index < words.length - 1) {
        fragment.appendChild(document.createTextNode(' '));
      }
    });

    element.textContent = '';
    element.appendChild(fragment);
    element.dataset.processed = 'true';
  }

  // Smart word splitting that handles inline links
  function splitIntoWordsWithLinks(element) {
    if (element.dataset.processed === 'true') return;
    if (prefersReducedMotion) {
      element.dataset.processed = 'true';
      return;
    }

    const text = element.textContent.trim();
    if (!text) return;

    // Cap to max 40 words
    const words = text.split(/\s+/);
    if (words.length > 40) {
      element.dataset.processed = 'true';
      return;
    }

    // If element has links, handle them specially
    const links = element.querySelectorAll('a');
    if (links.length > 0) {
      // Clone the element to preserve structure
      const clone = element.cloneNode(true);
      const walker = document.createTreeWalker(
        clone,
        NodeFilter.SHOW_TEXT,
        null,
        false
      );

      const textNodes = [];
      let node;
      while (node = walker.nextNode()) {
        if (node.textContent.trim()) {
          textNodes.push(node);
        }
      }

      textNodes.forEach(textNode => {
        const words = textNode.textContent.trim().split(/\s+/);
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
        textNode.parentNode.replaceChild(fragment, textNode);
      });

      // Replace original with processed clone
      element.innerHTML = clone.innerHTML;
      element.dataset.processed = 'true';
      return;
    }

    // Standard word splitting for elements without links
    splitIntoWords(element);
  }

  // Process elements that should animate - ALL text content
  function processElements() {
    // Primary selectors for text content
    const primarySelectors = [
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      '.hero-title', '.page-title', '.title',
      'p', 'li', 'span', 'a',
      '.reveal', '[data-reveal]'
    ];
    
    const elements = new Set();
    
    // Process primary selectors
    primarySelectors.forEach(selector => {
      try {
        document.querySelectorAll(selector).forEach(el => {
          if (el.dataset.processed === 'true' || 
              el.classList.contains('reveal-word') ||
              el.closest('[data-processed="true"]')) {
            return;
          }
          
          const text = el.textContent.trim();
          if (text) {
            elements.add(el);
          }
        });
      } catch (e) {
        // Skip invalid selectors
      }
    });
    
    // Also process divs with data-reveal or direct text
    document.querySelectorAll('div').forEach(el => {
      if (el.dataset.processed === 'true' || 
          el.classList.contains('reveal-word') ||
          el.closest('[data-processed="true"]')) {
        return;
      }
      
      // Skip wrapper divs (but journey-section paragraphs will be handled by p selector)
      const wrapperClasses = ['wrap', 'col', 'topline', 'nav', 'bracket', 'intro-overlay', 'intro-inner'];
      if (wrapperClasses.some(c => el.classList.contains(c))) {
        return;
      }
      
      // For journey-section, we want to process it if it has data-reveal
      // but the paragraphs inside will be processed separately via the p selector
      
      // Only process divs with data-reveal or direct text content
      const hasDirectText = Array.from(el.childNodes).some(node => 
        node.nodeType === Node.TEXT_NODE && node.textContent.trim()
      );
      
      if (el.hasAttribute('data-reveal') || hasDirectText) {
        const text = el.textContent.trim();
        if (text) {
          elements.add(el);
        }
      }
    });
    
    // Process all collected elements
    elements.forEach(el => {
      splitIntoWordsWithLinks(el);
    });
  }

  // Trigger animation for an element
  function triggerAnimation(element) {
    const words = element.querySelectorAll('.reveal-word');
    
    if (words.length > 0) {
      words.forEach((word, index) => {
        const stagger = parseInt(element.style.getPropertyValue('--stagger')) || 45;
        const delay = index * stagger;
        setTimeout(() => {
          word.classList.add('reveal-word-on');
        }, delay);
      });
    } else {
      // Fallback for non-word-split elements
      element.classList.add('reveal-on');
    }
  }

  // Check if element is in viewport
  function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    const windowHeight = window.innerHeight || document.documentElement.clientHeight;
    const threshold = windowHeight * 0.15; // 15% threshold
    return rect.top < windowHeight - threshold && rect.bottom > threshold;
  }

  // IntersectionObserver for scroll-triggered animations
  const observerOptions = {
    rootMargin: '0px 0px -10% 0px',
    threshold: 0.15
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        triggerAnimation(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Observe all reveal elements - ALL text content
  function observeElements() {
    const elements = document.querySelectorAll(
      'h1, h2, h3, h4, h5, h6, .hero-title, .page-title, .title, .reveal, [data-reveal], p, li, nav a, .nav a, .topline a, .bracket a'
    );
    elements.forEach(el => {
      // Skip if no reveal words and not a reveal element
      const hasWords = el.querySelectorAll('.reveal-word').length > 0;
      const isReveal = el.classList.contains('reveal') || el.hasAttribute('data-reveal');
      
      if (!hasWords && !isReveal) return;
      
      // If already in viewport, trigger immediately
      if (isInViewport(el)) {
        // Small delay to ensure DOM is ready
        setTimeout(() => triggerAnimation(el), 100);
      } else {
        observer.observe(el);
      }
    });
  }

  // Initialize on DOM ready
  function init() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        processElements();
        // Small delay to ensure word splitting is complete
        setTimeout(observeElements, 50);
      });
    } else {
      processElements();
      setTimeout(observeElements, 50);
    }
  }

  init();
})();

(() => {
  const els = document.querySelectorAll("[data-reveal]");
  if (!els.length) return;

  const makeObserver = (root) =>
    new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add("on");
        });
      },
      { root, threshold: 0.12 }
    );

  // apply your existing .reveal class
  els.forEach((el) => el.classList.add("reveal"));

  // observe both: window + snap container (if it exists)
  const snap = document.querySelector(".snap");
  const obWindow = makeObserver(null);
  els.forEach((el) => obWindow.observe(el));

  if (snap) {
    const obSnap = makeObserver(snap);
    els.forEach((el) => obSnap.observe(el));
  }
})();

