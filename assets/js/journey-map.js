(function () {
  const world = document.getElementById("world");
  const marker = document.getElementById("marker");
  if (!world) return;

  // Scene targets in "world" coordinates (px) + scale
  // These are centered roughly on each zone.
  const scenes = [
    { x: 600,  y: 500,  s: 1.05, mx: 600,  my: 500 },   // piano
    { x: 1750, y: 480,  s: 1.10, mx: 1750, my: 480 },   // soccer
    { x: 850,  y: 1450, s: 1.12, mx: 850,  my: 1450 },  // research/build
    { x: 2100, y: 1450, s: 1.08, mx: 2100, my: 1450 },  // investing/today
    { x: 1500, y: 1100, s: 0.92, mx: 1500, my: 1100 }   // zoom-out finale
  ];

  const steps = Array.from(document.querySelectorAll(".step"));
  const stage = document.querySelector(".jmap-stage");

  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

  function setCamera(target, immediate=false) {
    const rect = stage.getBoundingClientRect();

    // We keep "world" positioned from its top-left at (0,0) in its own space.
    // Camera transform moves world so that (target.x, target.y) sits at stage center.
    const cx = rect.width / 2;
    const cy = rect.height / 2;

    const s = target.s;
    const tx = cx - target.x * s;
    const ty = cy - target.y * s;

    world.style.transition = immediate ? "none" : "transform 900ms cubic-bezier(.2,.8,.2,1)";
    world.style.transform = `translate(${tx}px, ${ty}px) scale(${s})`;

    // marker follows the target point
    marker.style.transition = immediate ? "none" : "transform 900ms cubic-bezier(.2,.8,.2,1), left 900ms cubic-bezier(.2,.8,.2,1), top 900ms cubic-bezier(.2,.8,.2,1)";
    marker.style.left = `${target.mx}px`;
    marker.style.top = `${target.my}px`;
  }

  // Place world in normal coordinate system (top-left origin)
  // Overwrite CSS centering so transforms are predictable
  world.style.left = "0px";
  world.style.top = "0px";
  world.style.transformOrigin = "0 0";

  // Start on first scene
  setCamera(scenes[0], true);

  // IntersectionObserver to activate steps
  const io = new IntersectionObserver((entries) => {
    // pick the most visible entry
    const visible = entries
      .filter(e => e.isIntersecting)
      .sort((a,b) => b.intersectionRatio - a.intersectionRatio)[0];

    if (!visible) return;

    const idx = parseInt(visible.target.getAttribute("data-step"), 10);
    const scene = scenes[clamp(idx, 0, scenes.length - 1)];
    setCamera(scene, false);

    steps.forEach(s => s.classList.remove("is-active"));
    visible.target.classList.add("is-active");
  }, { root: null, threshold: [0.25, 0.35, 0.5, 0.65] });

  steps.forEach(s => io.observe(s));

  // Re-center on resize
  window.addEventListener("resize", () => {
    const active = document.querySelector(".step.is-active");
    const idx = active ? parseInt(active.getAttribute("data-step"), 10) : 0;
    setCamera(scenes[clamp(idx, 0, scenes.length - 1)], true);
  });
})();
