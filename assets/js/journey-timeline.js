(() => {
  'use strict';

  const track = document.getElementById('timelineTrack');
  const prevBtn = document.getElementById('timelinePrev');
  const nextBtn = document.getElementById('timelineNext');
  const dotsContainer = document.getElementById('timelineDots');

  if (!track || !prevBtn || !nextBtn) return;

  const steps = Array.from(track.querySelectorAll('.timeline-step'));
  if (steps.length === 0) return;

  let currentIndex = 0;
  
  function getStepWidth() {
    return track.offsetWidth;
  }

  // Create dots
  steps.forEach((_, index) => {
    const dot = document.createElement('div');
    dot.className = 'timeline-dot';
    if (index === 0) dot.classList.add('active');
    dot.addEventListener('click', () => goToStep(index));
    dotsContainer.appendChild(dot);
  });

  const dots = Array.from(dotsContainer.querySelectorAll('.timeline-dot'));

  function updateButtons() {
    prevBtn.disabled = currentIndex === 0;
    nextBtn.disabled = currentIndex === steps.length - 1;
  }

  function updateDots() {
    dots.forEach((dot, index) => {
      dot.classList.toggle('active', index === currentIndex);
    });
  }

  function goToStep(index) {
    if (index < 0 || index >= steps.length) return;
    
    currentIndex = index;
    const stepWidth = getStepWidth();
    const scrollPosition = stepWidth * index;
    
    track.scrollTo({
      left: scrollPosition,
      behavior: 'smooth'
    });

    updateButtons();
    updateDots();

    // Trigger reveal animation for the new step
    const step = steps[currentIndex];
    const revealElements = step.querySelectorAll('[data-reveal]');
    revealElements.forEach((el, i) => {
      setTimeout(() => {
        if (el.querySelectorAll('.reveal-word').length > 0) {
          const words = el.querySelectorAll('.reveal-word');
          words.forEach((word, wordIndex) => {
            setTimeout(() => {
              word.classList.add('reveal-word-on');
            }, wordIndex * 40);
          });
        } else {
          el.classList.add('reveal-on');
        }
      }, i * 100);
    });
  }

  prevBtn.addEventListener('click', () => {
    if (currentIndex > 0) {
      goToStep(currentIndex - 1);
    }
  });

  nextBtn.addEventListener('click', () => {
    if (currentIndex < steps.length - 1) {
      goToStep(currentIndex + 1);
    }
  });

  // Handle scroll events to update current index
  let scrollTimeout;
  track.addEventListener('scroll', () => {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      const stepWidth = getStepWidth();
      const newIndex = Math.round(track.scrollLeft / stepWidth);
      if (newIndex !== currentIndex && newIndex >= 0 && newIndex < steps.length) {
        currentIndex = newIndex;
        updateButtons();
        updateDots();
      }
    }, 100);
  }, { passive: true });

  // Handle keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft' && currentIndex > 0) {
      e.preventDefault();
      goToStep(currentIndex - 1);
    } else if (e.key === 'ArrowRight' && currentIndex < steps.length - 1) {
      e.preventDefault();
      goToStep(currentIndex + 1);
    }
  });

  // Handle window resize
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      goToStep(currentIndex);
    }, 250);
  }, { passive: true });

  // Initialize
  updateButtons();
  updateDots();

  // Trigger initial reveal for first step
  setTimeout(() => {
    goToStep(0);
  }, 300);
})();

