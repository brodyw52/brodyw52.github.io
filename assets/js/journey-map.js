(function () {
  const world = document.getElementById("world");
  const marker = document.getElementById("marker");
  const stage = document.querySelector(".jmap-stage");
  const steps = Array.from(document.querySelectorAll(".step"));

  if (!world || !marker || !stage || steps.length === 0) return;

  // Scene targets in WORLD coordinates (px) + scale
  const scenes = [
    { x: 600,  y: 520,  s: 1.05, mx: 600,  my: 520 },   // piano
    { x: 1760, y: 500,  s: 1.10, mx: 1760, my: 500 },   // soccer
    { x: 850,  y: 1480, s: 1.12, mx: 850,  my: 1480 },  // research/build
    { x: 2100, y: 1480, s: 1.08, mx: 2100, my: 1480 },  // investing/today
    { x: 1500, y: 1100, s: 0.92, mx: 1500, my: 1100 }   // finale zoom-out
  ];

  // Ensure predictable coordinate system
  world.style.left = "0px";
  world.style.top = "0px";
  world.style.transformOrigin = "0 0";

  function clamp(n, a, b) { return Math.max(a, Math.min(b, n)); }

  function setCamera(target, immediate = false) {
    const rect = stage.getBoundingClientRect();
    const cx = rect.width / 2;
    const cy = rect.height / 2;

    const s = target.s;
    const tx = cx - target.x * s;
    const ty = cy - target.y * s;

    world.style.transition = immediate ? "none" : "transform 650ms cubic-bezier(.2,.8,.2,1)";
    world.style.transform = `translate3d(${tx}px, ${ty}px, 0) scale(${s})`;

    marker.style.transition = immediate ? "none" : "left 650ms cubic-bezier(.2,.8,.2,1), top 650ms cubic-bezier(.2,.8,.2,1)";
    marker.style.left = `${target.mx}px`;
    marker.style.top = `${target.my}px`;
  }

  function getActiveStepIndex() {
    const viewportMid = window.innerHeight * 0.42;
    let bestIdx = 0;
    let bestDist = Infinity;

    for (let i = 0; i < steps.length; i++) {
      const r = steps[i].getBoundingClientRect();
      const stepMid = (r.top + r.bottom) / 2;
      const d = Math.abs(stepMid - viewportMid);
      if (d < bestDist) {
        bestDist = d;
        bestIdx = i;
      }
    }
    return bestIdx;
  }

  let currentIdx = -1;
  let ticking = false;

  function update() {
    ticking = false;
    const idx = getActiveStepIndex();
    if (idx === currentIdx) return;

    currentIdx = idx;

    steps.forEach(s => s.classList.remove("is-active"));
    steps[idx].classList.add("is-active");

    const scene = scenes[clamp(idx, 0, scenes.length - 1)];
    setCamera(scene, false);
  }

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  }

  // Init
  setCamera(scenes[0], true);
  steps[0].classList.add("is-active");
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", () => {
    const scene = scenes[clamp(currentIdx < 0 ? 0 : currentIdx, 0, scenes.length - 1)];
    setCamera(scene, true);
  });

  // First pass
  update();
})();
