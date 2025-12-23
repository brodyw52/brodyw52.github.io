(() => {
  'use strict';

  // ---- index intro overlay with zoom effect ----
  function runIntroIfIndex() {
    const isIndex = document.body.dataset.page === 'index';
    if (!isIndex) return;

    const overlay = document.createElement('div');
    overlay.className = 'intro-overlay';
    overlay.innerHTML = `
      <div class="intro-inner">
        <div class="intro-hi">
          <span class="intro-name">Brody Weinfurtner</span>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    // lock scroll during intro
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Zoom out and reveal website after name is shown
    setTimeout(() => {
      overlay.classList.add('intro-zoom');
      setTimeout(() => {
        overlay.remove();
        document.body.style.overflow = prevOverflow || '';
      }, 1500);
    }, 2500); // Total: ~4 seconds (1.5s reveal + 1s hold + 1.5s zoom)
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

  // ---- Liquid Glass Effects for Journey Page - EXACT CODE FROM USER ----
  function initLiquidGlass() {
    const isJourney = window.location.pathname.includes('journey') || 
                      document.title.includes('journey');
    if (!isJourney) return;

    // Get all glass elements - using journey-item as glass-card equivalent
    const glassElements = document.querySelectorAll('.journey-item, .journey-hover-card');
    
    if (!glassElements.length) return;
    
    // Add mousemove effect for each glass element - EXACT CODE FROM USER
    glassElements.forEach(element => {
      element.addEventListener('mousemove', handleMouseMove);
      element.addEventListener('mouseleave', handleMouseLeave);
    });
    
    // Handle mouse movement over glass elements - EXACT CODE FROM USER
    function handleMouseMove(e) {
      const rect = this.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      // Update filter turbulence based on mouse position - FIXED: filter is in SVG at document level
      const filter = document.querySelector('#glass-distortion feDisplacementMap');
      if (filter) {
        const scaleX = (x / rect.width) * 100;
        const scaleY = (y / rect.height) * 100;
        filter.setAttribute('scale', Math.min(scaleX, scaleY));
      }
      
      // Add highlight effect
      const specular = this.querySelector('.journey-item-glass-specular, .journey-hover-card-glass-specular');
      if (specular) {
        specular.style.background = `radial-gradient(
          circle at ${x}px ${y}px,
          rgba(255,255,255,0.15) 0%,
          rgba(255,255,255,0.05) 30%,
          rgba(255,255,255,0) 60%
        )`;
      }
    }
    
    // Reset effects when mouse leaves - EXACT CODE FROM USER
    function handleMouseLeave() {
      const filter = document.querySelector('#glass-distortion feDisplacementMap');
      if (filter) {
        filter.setAttribute('scale', '77');
      }
      
      const specular = this.querySelector('.journey-item-glass-specular, .journey-hover-card-glass-specular');
      if (specular) {
        specular.style.background = 'none';
      }
    }
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

  // ---- Make current page link bold in navigation ----
  function initCurrentPageBold() {
    const currentPath = window.location.pathname;
    let currentPage = currentPath.split('/').pop();
    
    // Handle index/home page
    if (!currentPage || currentPage === '' || currentPage === 'index.html') {
      currentPage = 'index.html';
    }
    
    // Find all nav links
    const navLinks = document.querySelectorAll('.nav.bracket a.soft-link, .bracket a.soft-link');
    
    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (!href) return;
      
      // Normalize href - remove leading slash and handle index.html
      let linkPage = href.replace(/^\//, ''); // Remove leading slash
      if (!linkPage || linkPage === '' || linkPage === '/') {
        linkPage = 'index.html';
      }
      
      // Also check for "home" link pointing to index
      if (linkPage === 'index.html' && currentPage === 'index.html') {
        link.classList.add('current-page');
        return;
      }
      
      // Check if this link matches the current page
      if (linkPage === currentPage) {
        link.classList.add('current-page');
      }
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
    initLiquidGlass();
    initCurrentPageBold();
  });
})();
