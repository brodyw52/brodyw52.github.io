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

  // ---- Subtle parallax on main content ----
  function initParallax() {
    const main = document.querySelector('main');
    if (!main) return;

    let ticking = false;
    function updateParallax() {
      const scrolled = window.scrollY;
      const rate = scrolled * 0.02; // Very subtle parallax
      main.style.transform = `translateY(${rate}px)`;
      ticking = false;
    }

    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(updateParallax);
        ticking = true;
      }
    }, { passive: true });
  }

  // ---- Journey page specific animations ----
  function initJourneyAnimations() {
    const isJourney = window.location.pathname.includes('journey') || 
                      document.title.includes('journey');
    if (!isJourney) return;

    const sections = document.querySelectorAll('.journey-section');
    
    // Add staggered reveal on scroll
    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
          }, index * 100);
          sectionObserver.unobserve(entry.target);
        }
      });
    }, {
      rootMargin: '0px 0px -50px 0px',
      threshold: 0.1
    });

    sections.forEach(section => {
      sectionObserver.observe(section);
    });

    // Add floating effect to markers
    const markers = document.querySelectorAll('.journey-marker');
    markers.forEach((marker, index) => {
      const delay = index * 0.3;
      marker.style.animation = `floatMarker 4s ease-in-out infinite`;
      marker.style.animationDelay = `${delay}s`;
    });
  }

  // Add floating marker animation
  if (!document.querySelector('#journey-animations')) {
    const style = document.createElement('style');
    style.id = 'journey-animations';
    style.textContent = `
      @keyframes floatMarker {
        0%, 100% { transform: translateY(-8px) translateX(0); }
        50% { transform: translateY(-12px) translateX(2px); }
      }
    `;
    document.head.appendChild(style);
  }

  // ---- Smooth reveal for journey sections ----
  function initSmoothReveals() {
    const sections = document.querySelectorAll('.journey-section[data-reveal]');
    sections.forEach((section, index) => {
      // Initially hidden
      section.style.opacity = '0';
      section.style.transform = 'translateY(20px)';
    });
  }

  // Initialize on DOM ready
  document.addEventListener('DOMContentLoaded', () => {
    runIntroIfIndex();
    initMagneticCursor();
    initScrollProgress();
    initParallax();
    initJourneyAnimations();
    initSmoothReveals();
  });
})();
