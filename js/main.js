/* Scroll orchestration (GSAP + ScrollTrigger), per-section micro-interactions,
   nav behaviour, tilt cards, archive toggle. */
(function () {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hasGsap = typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined";

  /* ---------- nav: hide on scroll down, show on scroll up ---------- */
  const nav = document.getElementById("site-nav");
  let lastY = scrollY;
  addEventListener("scroll", () => {
    const y = scrollY;
    nav.classList.toggle("nav-hidden", y > lastY && y > 300);
    lastY = y;
  }, { passive: true });

  /* ---------- scroll progress bar ---------- */
  const bar = document.getElementById("scroll-progress");
  addEventListener("scroll", () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    bar.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
  }, { passive: true });

  /* ---------- mobile menu ---------- */
  const burger = document.getElementById("nav-burger");
  const menu = document.getElementById("mobile-menu");
  burger.addEventListener("click", () => {
    const open = burger.getAttribute("aria-expanded") === "true";
    burger.setAttribute("aria-expanded", String(!open));
    menu.hidden = open;
    document.body.style.overflow = open ? "" : "hidden";
  });
  menu.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => {
      burger.setAttribute("aria-expanded", "false");
      menu.hidden = true;
      document.body.style.overflow = "";
    })
  );

  /* ---------- active nav link ---------- */
  const sections = [...document.querySelectorAll("section[id]")];
  const navLinks = [...document.querySelectorAll("#site-nav nav a")];
  const spy = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      navLinks.forEach((l) =>
        l.classList.toggle("active", l.getAttribute("href") === "#" + en.target.id)
      );
    });
  }, { rootMargin: "-40% 0px -55% 0px" });
  sections.forEach((s) => spy.observe(s));

  /* ---------- archive toggle ---------- */
  const archToggle = document.getElementById("archive-toggle");
  const archGrid = document.getElementById("archive-grid");
  archToggle.addEventListener("click", () => {
    const open = archToggle.getAttribute("aria-expanded") === "true";
    archToggle.setAttribute("aria-expanded", String(!open));
    archGrid.hidden = open;
    if (!open && hasGsap && !reduced) {
      gsap.fromTo(archGrid.children,
        { opacity: 0, y: 18 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.045, ease: "power3.out", clearProps: "all" });
      ScrollTrigger.refresh();
    }
  });

  /* ---------- 3D tilt on flagship project cards ---------- */
  const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  if (fine && !reduced) {
    document.querySelectorAll(".proj-card.tilt").forEach((card) => {
      let raf = null;
      card.addEventListener("mousemove", (e) => {
        if (raf) return;
        raf = requestAnimationFrame(() => {
          const r = card.getBoundingClientRect();
          const px = (e.clientX - r.left) / r.width;
          const py = (e.clientY - r.top) / r.height;
          card.style.transform =
            `perspective(900px) rotateY(${(px - 0.5) * 8}deg) rotateX(${(0.5 - py) * 8}deg) translateZ(4px)`;
          card.style.setProperty("--gx", px * 100 + "%");
          card.style.setProperty("--gy", py * 100 + "%");
          raf = null;
        });
      });
      card.addEventListener("mouseleave", () => {
        card.style.transition = "transform 0.5s cubic-bezier(0.22, 1, 0.36, 1)";
        card.style.transform = "perspective(900px) rotateY(0deg) rotateX(0deg)";
        setTimeout(() => (card.style.transition = ""), 500);
      });
    });

    /* ---------- hero ID card parallax tilt ---------- */
    const idcard = document.getElementById("hero-idcard");
    const stage = document.querySelector(".hero-stage");
    if (idcard && stage) {
      stage.addEventListener("mousemove", (e) => {
        const r = stage.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        idcard.style.transform =
          `translate(${px * -14}px, ${py * -10}px) rotateY(${px * 10}deg) rotateX(${py * -8}deg)`;
      });
      stage.addEventListener("mouseleave", () => {
        idcard.style.transition = "transform 0.6s cubic-bezier(0.22, 1, 0.36, 1)";
        idcard.style.transform = "";
        setTimeout(() => (idcard.style.transition = ""), 600);
      });
    }
  }

  /* ---------- scroll-triggered reveals ---------- */
  if (!hasGsap || reduced) return; // CSS keeps everything visible without GSAP

  document.body.classList.add("anim-ready");
  gsap.registerPlugin(ScrollTrigger);

  const variants = {
    line:    { from: { opacity: 0, y: 26 },            dur: 0.8 },
    heading: { from: { opacity: 0, x: -30 },            dur: 0.7 },
    left:    { from: { opacity: 0, x: -40 },            dur: 0.8 },
    right:   { from: { opacity: 0, x: 40 },             dur: 0.8 },
    up:      { from: { opacity: 0, y: 30 },             dur: 0.7 },
    xp:      { from: { opacity: 0, x: -24, y: 12 },     dur: 0.7 },
    proj:    { from: { opacity: 0, y: 44, scale: 0.97 },dur: 0.85 },
    chips:   { from: {},                                dur: 0 }, // handled below
  };

  // hero lines: run on load, staggered — not scroll-bound
  gsap.fromTo("#hero [data-reveal]",
    { opacity: 0, y: 26 },
    { opacity: 1, y: 0, duration: 0.9, stagger: 0.12, ease: "power3.out", delay: 0.15, clearProps: "transform" });

  // everything else: scroll-triggered with per-section variants
  gsap.utils.toArray("[data-reveal]").forEach((el) => {
    if (el.closest("#hero")) return;
    const kind = el.dataset.reveal;

    if (kind === "chips") {
      const chips = el.querySelectorAll(".chip");
      gsap.set(el, { opacity: 1 });
      gsap.fromTo(chips,
        { opacity: 0, y: 20, rotate: () => gsap.utils.random(-5, 5) },
        {
          opacity: 1, y: 0, rotate: 0,
          duration: 0.55, stagger: 0.05, ease: "back.out(1.8)",
          clearProps: "all",
          scrollTrigger: { trigger: el, start: "top 85%" },
        });
      return;
    }

    const v = variants[kind] || variants.up;
    gsap.fromTo(el, v.from, {
      opacity: 1, x: 0, y: 0, scale: 1,
      duration: v.dur, ease: "power3.out",
      clearProps: "transform",
      scrollTrigger: { trigger: el, start: "top 85%" },
    });
  });

  /* ---------- experience: line draws with scroll, nodes light up ---------- */
  const xpFill = document.querySelector(".xp-line-fill");
  if (xpFill) {
    gsap.to(xpFill, {
      scaleY: 1,
      ease: "none",
      scrollTrigger: {
        trigger: "#xp-timeline",
        start: "top 70%",
        end: "bottom 55%",
        scrub: 0.6,
      },
    });
    document.querySelectorAll(".xp-item").forEach((item) => {
      ScrollTrigger.create({
        trigger: item,
        start: "top 62%",
        onEnter: () => item.classList.add("node-lit"),
        onLeaveBack: () => item.classList.remove("node-lit"),
      });
    });
  }

  /* ---------- gaming timeline: connective line draws in ---------- */
  const gt = document.getElementById("game-timeline");
  if (gt) {
    gsap.fromTo(gt, { "--gt-progress": 0 }, {
      "--gt-progress": 1,
      duration: 1.4,
      ease: "power2.inOut",
      scrollTrigger: { trigger: gt, start: "top 80%" },
    });
    gsap.fromTo(gt.querySelectorAll(".gt-node"),
      { opacity: 0, x: -14 },
      {
        opacity: 1, x: 0, duration: 0.5, stagger: 0.12, ease: "power3.out",
        clearProps: "opacity,transform",
        scrollTrigger: { trigger: gt, start: "top 80%" },
      });
  }
})();
