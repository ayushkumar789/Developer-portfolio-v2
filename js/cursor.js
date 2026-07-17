/* Custom cursor: instant dot + spring-lagged ring.
   Disabled on touch devices and under prefers-reduced-motion. */
(function () {
  const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!fine || reduced) return;

  document.body.classList.add("has-cursor");

  const dot = document.getElementById("cursor-dot");
  const ring = document.getElementById("cursor-ring");
  const label = document.getElementById("cursor-label");

  let mx = innerWidth / 2, my = innerHeight / 2; // target
  let rx = mx, ry = my;                          // ring (lerped)
  let dx = mx, dy = my;                          // dot (tighter lerp)

  addEventListener("mousemove", (e) => { mx = e.clientX; my = e.clientY; }, { passive: true });
  addEventListener("mousedown", () => ring.classList.add("is-down"));
  addEventListener("mouseup", () => ring.classList.remove("is-down"));

  // hover states via event delegation
  document.addEventListener("mouseover", (e) => {
    const t = e.target.closest("[data-hover]");
    if (!t) return;
    ring.classList.add("is-hover");
    const text = t.closest("[data-cursor-label]")?.dataset.cursorLabel || t.dataset.cursorLabel;
    if (text) { ring.classList.add("has-label"); label.textContent = text; }
  });
  document.addEventListener("mouseout", (e) => {
    if (!e.target.closest("[data-hover]")) return;
    ring.classList.remove("is-hover", "has-label");
    label.textContent = "";
  });

  const lerp = (a, b, t) => a + (b - a) * t;

  (function tick() {
    dx = lerp(dx, mx, 0.55);
    dy = lerp(dy, my, 0.55);
    rx = lerp(rx, mx, 0.16);
    ry = lerp(ry, my, 0.16);
    dot.style.left = dx + "px";
    dot.style.top = dy + "px";
    ring.style.left = rx + "px";
    ring.style.top = ry + "px";
    requestAnimationFrame(tick);
  })();
})();
