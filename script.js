(() => {
  'use strict';

  // ---- index intro overlay with zoom effect ----
  function runIntroIfIndex() {
    const isIndex = document.body.dataset.page === 'index';
    if (!isIndex) return;

    // show once per tab session
    if (sessionStorage.getItem('introShown') === '1') return;
    sessionStorage.setItem('introShown', '1');

    const overlay = document.createElement('div');
    overlay.className = 'intro-overlay';
    overlay.innerHTML = `
      <div class="intro-inner">
        <div class="intro-hi"><span class="soft-link">Hey, I'm Brody — entrepreneur, builder, athlete, creative, musician</span></div>
      </div>
    `;
    document.body.appendChild(overlay);

    // lock scroll during intro
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Initial pop-in animation
    setTimeout(() => {
      overlay.querySelector('.intro-hi').style.animation = 'introPop 0.75s cubic-bezier(.2,.9,.2,1) forwards';
    }, 50);

    // Zoom out after 1.5-2 seconds (randomized between 1500-2000ms)
    const zoomDelay = 1500 + Math.random() * 500;
    setTimeout(() => {
      overlay.classList.add('intro-zoom');
      setTimeout(() => {
        overlay.remove();
        document.body.style.overflow = prevOverflow || '';
      }, 800);
    }, zoomDelay);
  }

  // ---- Magnetic cursor hover effect ----
  function initMagneticCursor() {
    const magneticElements = document.querySelectorAll('.soft-link, a:not(.no-magnetic), button:not(.no-magnetic)');
    
    magneticElements.forEach(el => {
      el.addEventListener('mousemove', (e) => {
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        
        const distance = Math.sqrt(x * x + y * y);
        const maxDistance = 8; // 6-10px range, using 8px
        
        if (distance < maxDistance) {
          const moveX = (x / maxDistance) * maxDistance * 0.5;
          const moveY = (y / maxDistance) * maxDistance * 0.5;
          el.style.transform = `translate(${moveX}px, ${moveY}px)`;
        }
      });
      
      el.addEventListener('mouseleave', () => {
        el.style.transform = '';
      });
    });
  }

  // ---- Scroll progress bar ----
  function initScrollProgress() {
    const progressBar = document.createElement('div');
    progressBar.className = 'scroll-progress';
    document.body.appendChild(progressBar);

    function updateProgress() {
      const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = (window.scrollY / windowHeight) * 100;
      progressBar.style.width = `${scrolled}%`;
    }

    window.addEventListener('scroll', updateProgress, { passive: true });
    updateProgress(); // Initial update
  }

  // Initialize on DOM ready
  document.addEventListener('DOMContentLoaded', () => {
    runIntroIfIndex();
    initMagneticCursor();
    initScrollProgress();
  });
})();
