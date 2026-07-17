/* Certificate accordions: on first expand, list portfolio-media/certs/{issuer}
   from Supabase storage and render a thumbnail card per file. Filenames follow
   a fixed convention — Title-Case-With-Hyphens.ext — so the label is derived
   directly from the filename (strip extension, hyphens → spaces). With no
   files the static name chips remain. Click a thumbnail → lightbox. */
(function () {
  if (!window.supa) return;

  const BUCKET = "portfolio-media";
  const IMG_EXT = /\.(jpe?g|png|webp|gif)$/i;
  const PDF_EXT = /\.pdf$/i;

  const labelFor = (filename) =>
    filename.replace(/\.[a-z0-9]+$/i, "").replace(/-/g, " ");

  const publicUrl = (path) =>
    window.supa.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;

  /* ---------- lazy fetch per accordion ---------- */
  document.querySelectorAll(".cert-group[data-issuer]").forEach((group) => {
    let loaded = false;
    group.addEventListener("toggle", async () => {
      if (!group.open || loaded) return;
      loaded = true;

      const issuer = group.dataset.issuer;
      const list = group.querySelector(".cert-items");
      const { data: files, error } = await window.supa.storage
        .from(BUCKET)
        .list(`certs/${issuer}`, { limit: 100 });

      if (error || !files) return; // chips stay as the graceful fallback

      const usable = files.filter((f) => IMG_EXT.test(f.name) || PDF_EXT.test(f.name));
      if (!usable.length) return;

      // files are the source of truth once they exist
      list.classList.add("has-thumbs");
      list.innerHTML = "";
      usable.forEach((f) => {
        const li = document.createElement("li");
        list.appendChild(li);
        upgrade(li, labelFor(f.name), `certs/${issuer}/${f.name}`, f.name);
      });
    });
  });

  function upgrade(li, label, path, filename) {
    const url = publicUrl(path);
    const isPdf = PDF_EXT.test(filename);
    li.classList.add("cert-thumb");
    li.setAttribute("data-hover", "");
    li.setAttribute("data-cursor-label", "VIEW");
    li.setAttribute("tabindex", "0");
    li.setAttribute("role", "button");
    li.innerHTML = `
      <span class="thumb-media">${
        isPdf
          ? `<span class="thumb-pdf mono" aria-hidden="true">PDF<em>⎙</em></span>`
          : `<img src="${url}" alt="${label}" loading="lazy" />`
      }</span>
      <span class="thumb-label">${label}</span>`;
    const open = () => window.lightbox.open({ url, label, kind: isPdf ? "pdf" : "img" });
    li.addEventListener("click", open);
    li.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); }
    });
  }
})();
