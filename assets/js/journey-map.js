(() => {
  const items = Array.from(document.querySelectorAll(".journey-list li"));
  if (!items.length) return;

  const targetY = () => window.innerHeight * 0.5;

  const update = () => {
    const y = targetY();
    let best = null;
    let bestDist = Infinity;

    for (const li of items) {
      const r = li.getBoundingClientRect();
      const mid = (r.top + r.bottom) / 2;
      const d = Math.abs(mid - y);
      if (d < bestDist) { bestDist = d; best = li; }
      li.classList.remove("is-hot");
    }
    if (best) best.classList.add("is-hot");
  };

  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { ticking = false; update(); });
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", update);
  update();
})();
