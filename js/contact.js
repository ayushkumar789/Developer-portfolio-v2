/* Contact form → contact_messages (Supabase, anon insert via RLS). */
(function () {
  const form = document.getElementById("contact-form");
  if (!form || !window.supa) return;

  const btn = form.querySelector("button[type=submit]");
  const btnLabel = btn.querySelector(".btn-label");
  const status = form.querySelector(".form-status");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (btn.disabled) return;

    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const message = form.message.value.trim();
    if (!name || !email || !message) return;

    btn.disabled = true;
    btnLabel.textContent = "Sending…";
    status.textContent = "";
    status.classList.remove("is-error");

    const { error } = await window.supa
      .from("contact_messages")
      .insert({ name, email, message });

    if (error) {
      btn.disabled = false;
      btnLabel.textContent = "Send Message";
      status.textContent = "// couldn't send — " + (error.message || "try again in a moment");
      status.classList.add("is-error");
      return;
    }

    form.reset();
    btnLabel.textContent = "Message sent ✓";
    status.textContent = "// thanks — I'll get back to you soon";
    setTimeout(() => {
      btnLabel.textContent = "Send Message";
      btn.disabled = false;
      status.textContent = "";
    }, 4000);
  });
})();
