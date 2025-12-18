(() => {
  // ---- roll-out animation (all pages) ----
  function rollOut() {
    const nodes = Array.from(document.querySelectorAll('[data-reveal]'));
    nodes.forEach((el, i) => {
      el.classList.add('reveal');
      const delay = Math.min(900, i * 70);
      setTimeout(() => el.classList.add('on'), delay);
    });
  }

  // ---- index intro overlay ----
  function runIntroIfIndex() {
    const isIndex = document.body.dataset.page === 'index';
    if (!isIndex) return;

    // show once per tab session
    if (sessionStorage.getItem('introShown') === '1') return;
    sessionStorage.setItem('introShown', '1');

    const overlay = document.createElement('div');
    overlay.className = 'intro-overlay intro-animate';
    overlay.innerHTML = `
      <div class="intro-inner">
        <div class="intro-hi"><span class="soft-link">Hi, i’m Brody</span></div>
        <div class="intro-sub">data + AI · building repeatable growth</div>
      </div>
    `;
    document.body.appendChild(overlay);

    // lock scroll during intro
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // dismiss after beat, then restore
    setTimeout(() => {
      overlay.classList.add('intro-dismiss');
      setTimeout(() => {
        overlay.remove();
        document.body.style.overflow = prevOverflow || '';
      }, 560);
    }, 1050);
  }

  document.addEventListener('DOMContentLoaded', () => {
    runIntroIfIndex();
    rollOut();
  });
})();
