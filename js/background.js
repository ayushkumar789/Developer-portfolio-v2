/* Living background: dependency-graph node field.
   One cohesive concept for the whole page — nodes drift slowly, edges connect
   near neighbours, and the field bends away from the cursor. A soft pointer
   glow (CSS vars --mx/--my) rides along. Reduced motion → single static frame.
   Small screens → fewer nodes. */
(function () {
  const canvas = document.getElementById("bg-net");
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let W, H, dpr, nodes = [];
  const mouse = { x: -9999, y: -9999 };
  const CYAN = "83, 200, 255";
  const AMBER = "255, 180, 84";

  function nodeCount() {
    if (W < 640) return 26;
    if (W < 1100) return 48;
    return 70;
  }
  const LINK_DIST = () => (W < 640 ? 110 : 150);
  const REPEL_R = 160;

  function resize() {
    dpr = Math.min(devicePixelRatio || 1, 2);
    W = innerWidth; H = innerHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width = W + "px";
    canvas.style.height = H + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    seed();
  }

  function seed() {
    const n = nodeCount();
    nodes = Array.from({ length: n }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.22,
      vy: (Math.random() - 0.5) * 0.22,
      r: 1 + Math.random() * 1.6,
      amber: Math.random() < 0.12, // a few amber "hub" nodes
    }));
  }

  addEventListener("mousemove", (e) => {
    mouse.x = e.clientX; mouse.y = e.clientY;
    document.documentElement.style.setProperty("--mx", e.clientX + "px");
    document.documentElement.style.setProperty("--my", e.clientY + "px");
  }, { passive: true });
  addEventListener("mouseleave", () => { mouse.x = -9999; mouse.y = -9999; });

  function step() {
    for (const p of nodes) {
      // gentle repulsion from cursor
      const ddx = p.x - mouse.x, ddy = p.y - mouse.y;
      const d2 = ddx * ddx + ddy * ddy;
      if (d2 < REPEL_R * REPEL_R && d2 > 0.01) {
        const d = Math.sqrt(d2);
        const f = ((REPEL_R - d) / REPEL_R) * 0.35;
        p.vx += (ddx / d) * f;
        p.vy += (ddy / d) * f;
      }
      p.vx *= 0.96; p.vy *= 0.96; // damping
      // keep a slow baseline drift
      if (Math.abs(p.vx) < 0.05) p.vx += (Math.random() - 0.5) * 0.02;
      if (Math.abs(p.vy) < 0.05) p.vy += (Math.random() - 0.5) * 0.02;
      p.x += p.vx; p.y += p.vy;
      if (p.x < -20) p.x = W + 20; else if (p.x > W + 20) p.x = -20;
      if (p.y < -20) p.y = H + 20; else if (p.y > H + 20) p.y = -20;
    }
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    const ld = LINK_DIST();

    for (let i = 0; i < nodes.length; i++) {
      const a = nodes[i];
      for (let j = i + 1; j < nodes.length; j++) {
        const b = nodes[j];
        const ddx = a.x - b.x, ddy = a.y - b.y;
        const d2 = ddx * ddx + ddy * ddy;
        if (d2 > ld * ld) continue;
        const alpha = (1 - Math.sqrt(d2) / ld) * 0.16;
        ctx.strokeStyle = `rgba(${a.amber || b.amber ? AMBER : CYAN}, ${alpha})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
    }
    for (const p of nodes) {
      ctx.fillStyle = p.amber
        ? `rgba(${AMBER}, 0.55)`
        : `rgba(${CYAN}, 0.4)`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  let raf;
  function loop() {
    step();
    draw();
    raf = requestAnimationFrame(loop);
  }

  // pause when tab hidden
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) cancelAnimationFrame(raf);
    else if (!reduced) loop();
  });

  addEventListener("resize", () => {
    cancelAnimationFrame(raf);
    resize();
    if (reduced) draw(); else loop();
  });

  resize();
  if (reduced) draw(); // single static frame
  else loop();
})();
