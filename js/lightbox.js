/* Shared lightbox — used by the certificate accordions and the gallery pages.
   Injects its own DOM on first open; supports images, inline PDF, and video.
   Close: backdrop, Esc, or the close button. */
window.lightbox = (function () {
  let el, media, title, openLink;

  function ensure() {
    if (el) return;
    el = document.createElement("div");
    el.id = "lightbox";
    el.hidden = true;
    el.setAttribute("aria-modal", "true");
    el.setAttribute("role", "dialog");
    el.setAttribute("aria-label", "Media preview");
    el.innerHTML = `
      <div class="lb-backdrop" data-lb-close></div>
      <figure class="lb-frame">
        <button class="lb-close mono" data-lb-close data-hover aria-label="Close preview">esc ✕</button>
        <div class="lb-media"></div>
        <figcaption class="mono">
          <span class="lb-title"></span>
          <a class="lb-open" href="#" target="_blank" rel="noopener" data-hover>open in new tab ↗</a>
        </figcaption>
      </figure>`;
    document.body.appendChild(el);
    media = el.querySelector(".lb-media");
    title = el.querySelector(".lb-title");
    openLink = el.querySelector(".lb-open");
    el.querySelectorAll("[data-lb-close]").forEach((c) =>
      c.addEventListener("click", close)
    );
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !el.hidden) close();
    });
  }

  /* kind: "img" | "pdf" | "video" */
  function open({ url, label, kind }) {
    ensure();
    if (kind === "pdf") {
      media.innerHTML = `<embed src="${url}#toolbar=0" type="application/pdf" />`;
    } else if (kind === "video") {
      media.innerHTML = `<video src="${url}" controls autoplay playsinline></video>`;
    } else {
      media.innerHTML = `<img src="${url}" alt="${label}" />`;
    }
    title.textContent = label;
    openLink.href = url;
    el.hidden = false;
    requestAnimationFrame(() => el.classList.add("open"));
    document.body.style.overflow = "hidden";
  }

  function close() {
    el.classList.remove("open");
    document.body.style.overflow = "";
    setTimeout(() => {
      el.hidden = true;
      media.innerHTML = ""; // also stops any playing video
    }, 250);
  }

  return { open, close };
})();
