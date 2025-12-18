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

  // Process elements that should animate
  function processElements() {
    const selectors = [
      'h1', 'h2', 'h3',
      '.hero-title', '.page-title',
      '.reveal',
      '[data-reveal]',
      'nav a',
      '.nav a',
      '.topline a',
      'p.p:first-of-type'
    ];

    const elements = new Set();
    selectors.forEach(selector => {
      document.querySelectorAll(selector).forEach(el => {
        // Skip if already processed or inside a processed parent
        if (!el.closest('[data-processed="true"]')) {
          elements.add(el);
        }
      });
    });

    elements.forEach(el => {
      // Don't split if it contains interactive elements or images
      if (el.querySelector('a, button, img, svg')) {
        // Mark as processed but don't split
        el.dataset.processed = 'true';
        return;
      }
      splitIntoWords(el);
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

  // Observe all reveal elements
  function observeElements() {
    const elements = document.querySelectorAll(
      'h1, h2, h3, .hero-title, .page-title, .reveal, [data-reveal], nav a, .nav a, .topline a'
    );
    elements.forEach(el => {
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

