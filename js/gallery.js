/* Gallery pages: list one portfolio-media folder (body[data-folder]) and
   render a responsive media grid. Images thumbnail directly; videos preview
   muted on hover and play full-size in the shared lightbox on click. */
(function () {
  if (!window.supa) return;

  const BUCKET = "portfolio-media";
  const IMG_EXT = /\.(jpe?g|png|webp|gif)$/i;
  const VID_EXT = /\.(mp4|webm)$/i;

  const folder = document.body.dataset.folder;
  const grid = document.getElementById("gallery-grid");
  const statusEl = document.querySelector(".gallery-status");
  const countEl = document.querySelector(".gallery-count");

  const labelFor = (filename) =>
    filename.replace(/\.[a-z0-9]+$/i, "").replace(/[-_]/g, " ");

  const publicUrl = (path) =>
    window.supa.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;

  (async () => {
    const { data: files, error } = await window.supa.storage
      .from(BUCKET)
      .list(folder, { limit: 200, sortBy: { column: "name", order: "asc" } });

    if (error) {
      statusEl.textContent = "// couldn't load the gallery — " + error.message;
      return;
    }

    const usable = (files || []).filter(
      (f) => IMG_EXT.test(f.name) || VID_EXT.test(f.name)
    );
    if (!usable.length) {
      statusEl.textContent = "// nothing here yet";
      return;
    }

    statusEl.remove();
    if (countEl) countEl.textContent = `${usable.length} item${usable.length === 1 ? "" : "s"}`;

    usable.forEach((f, i) => {
      const url = publicUrl(`${folder}/${f.name}`);
      const label = labelFor(f.name);
      const isVideo = VID_EXT.test(f.name);

      const card = document.createElement("figure");
      card.className = "g-card";
      card.setAttribute("data-hover", "");
      card.setAttribute("data-cursor-label", isVideo ? "PLAY" : "VIEW");
      card.setAttribute("tabindex", "0");
      card.setAttribute("role", "button");
      card.style.animationDelay = Math.min(i * 45, 500) + "ms";

      const media = document.createElement("div");
      media.className = "g-media";
      if (isVideo) {
        const v = document.createElement("video");
        v.src = url;
        v.muted = true;
        v.loop = true;
        v.playsInline = true;
        v.preload = "metadata";
        media.appendChild(v);
        const badge = document.createElement("span");
        badge.className = "g-play mono";
        badge.setAttribute("aria-hidden", "true");
        badge.textContent = "▶";
        media.appendChild(badge);
        card.addEventListener("mouseenter", () => v.play().catch(() => {}));
        card.addEventListener("mouseleave", () => v.pause());
      } else {
        const img = document.createElement("img");
        img.src = url;
        img.alt = label;
        img.loading = "lazy";
        media.appendChild(img);
      }

      const cap = document.createElement("figcaption");
      cap.className = "mono";
      cap.textContent = label;

      card.append(media, cap);
      grid.appendChild(card);

      const open = () =>
        window.lightbox.open({ url, label, kind: isVideo ? "video" : "img" });
      card.addEventListener("click", open);
      card.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); }
      });
    });
  })();
})();
