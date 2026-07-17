/* Admin inbox: signInWithPassword gate → contact_messages list.
   RLS ("select … to authenticated") is what actually protects the data;
   this file is just the door handle. */
(function () {
  const supa = window.supa;
  const loginView = document.getElementById("login-view");
  const inboxView = document.getElementById("inbox-view");
  const loginForm = document.getElementById("login-form");
  const status = loginForm.querySelector(".form-status");
  const btnLabel = loginForm.querySelector(".btn-label");
  const signoutBtn = document.getElementById("signout-btn");
  const refreshBtn = document.getElementById("refresh-btn");
  const msgList = document.getElementById("msg-list");
  const msgEmpty = msgList.querySelector(".msg-empty");
  const inboxCount = document.querySelector(".inbox-count");

  function showLogin() {
    loginView.hidden = false;
    inboxView.hidden = true;
    signoutBtn.hidden = true;
    loginForm.reset();
    // don't leave message content in the DOM after sign-out
    msgList.querySelectorAll(".msg-card").forEach((el) => el.remove());
    inboxCount.textContent = "";
  }

  async function showInbox() {
    loginView.hidden = true;
    inboxView.hidden = false;
    signoutBtn.hidden = false;
    await loadMessages();
  }

  /* ---------- boot: gate first, data only after a valid session ---------- */
  (async () => {
    const { data: { session } } = await supa.auth.getSession();
    if (session) await showInbox();
    else showLogin();
  })();

  /* ---------- login ---------- */
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    btnLabel.textContent = "Signing in…";
    status.textContent = "";
    status.classList.remove("is-error");

    const { error } = await supa.auth.signInWithPassword({
      email: loginForm.email.value.trim(),
      password: loginForm.password.value,
    });

    btnLabel.textContent = "Sign In";
    if (error) {
      status.textContent = "// " + (error.message || "sign-in failed");
      status.classList.add("is-error");
      return;
    }
    await showInbox();
  });

  /* ---------- sign out ---------- */
  signoutBtn.addEventListener("click", async () => {
    await supa.auth.signOut();
    showLogin();
  });

  refreshBtn.addEventListener("click", loadMessages);

  /* ---------- messages ---------- */
  async function loadMessages() {
    const { data, error } = await supa
      .from("contact_messages")
      .select("*")
      .order("created_at", { ascending: false });

    msgList.querySelectorAll(".msg-card").forEach((el) => el.remove());

    if (error) {
      msgEmpty.hidden = false;
      msgEmpty.classList.add("is-error");
      msgEmpty.textContent = "// couldn't load messages — " + (error.message || "unknown error") + " (try refresh)";
      inboxCount.textContent = "";
      return;
    }

    inboxCount.textContent = `${data.length} message${data.length === 1 ? "" : "s"} · ${data.filter((m) => !m.read).length} unread`;
    msgEmpty.hidden = data.length > 0;
    msgEmpty.classList.remove("is-error");
    msgEmpty.textContent = "// no messages yet — the form is out there working";

    data.forEach((m) => msgList.appendChild(renderCard(m)));
  }

  function renderCard(m) {
    const card = document.createElement("article");
    card.className = "msg-card" + (m.read ? "" : " msg-unread");

    const head = document.createElement("div");
    head.className = "msg-head";

    const who = document.createElement("div");
    who.className = "msg-who";
    const name = document.createElement("h3");
    name.textContent = m.name;
    const mail = document.createElement("a");
    mail.className = "mono";
    mail.href = "mailto:" + encodeURIComponent(m.email);
    mail.textContent = m.email;
    mail.setAttribute("data-hover", "");
    who.append(name, mail);

    const meta = document.createElement("div");
    meta.className = "msg-meta";
    const when = document.createElement("time");
    when.className = "mono";
    when.dateTime = m.created_at;
    when.textContent = relTime(m.created_at);
    when.title = new Date(m.created_at).toLocaleString();
    const toggle = document.createElement("button");
    toggle.className = "mono link-btn";
    toggle.setAttribute("data-hover", "");
    toggle.textContent = m.read ? "mark unread" : "mark read ✓";
    toggle.addEventListener("click", async () => {
      const next = !m.read;
      const { error } = await supa
        .from("contact_messages")
        .update({ read: next })
        .eq("id", m.id);
      if (error) return;
      m.read = next;
      card.classList.toggle("msg-unread", !next);
      toggle.textContent = next ? "mark unread" : "mark read ✓";
      const unread = document.querySelectorAll(".msg-card.msg-unread").length;
      const total = document.querySelectorAll(".msg-card").length;
      inboxCount.textContent = `${total} message${total === 1 ? "" : "s"} · ${unread} unread`;
    });
    meta.append(when, toggle);
    head.append(who, meta);

    const body = document.createElement("p");
    body.className = "msg-body";
    body.textContent = m.message; // textContent — message HTML is never interpreted

    card.append(head, body);
    return card;
  }

  function relTime(iso) {
    const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
    if (s < 60) return "just now";
    const m = Math.floor(s / 60);
    if (m < 60) return `${m} min ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h} hr${h === 1 ? "" : "s"} ago`;
    const d = Math.floor(h / 24);
    if (d < 7) return `${d} day${d === 1 ? "" : "s"} ago`;
    return new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
  }
})();
