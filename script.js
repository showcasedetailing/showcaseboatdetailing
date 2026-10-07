// Showcase Boat Detailing — interactions
document.addEventListener("DOMContentLoaded", () => {
  // Mobile nav
  const toggle = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".nav");
  if (toggle && nav) {
    toggle.addEventListener("click", () => nav.classList.toggle("open"));
  }

  // Active nav link
  const page = document.body.dataset.page;
  if (page) {
    document.querySelectorAll(".nav a[data-nav]").forEach(a => {
      if (a.dataset.nav === page) a.classList.add("active");
    });
  }

  // Gallery (gallery.html)
  const grid = document.getElementById("gallery-grid");
  if (grid) initGallery(grid);

  // Quote form -> compose a text message to the business
  const form = document.getElementById("quote-form");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const data = new FormData(form);
      const lines = [
        "Hi Showcase Boat Detailing! I'd like a quote.",
        `Name: ${data.get("name")}`,
        `My phone: ${data.get("phone")}`,
        data.get("email") ? `Email: ${data.get("email")}` : null,
        `Boat: ${data.get("boat") || "—"}`,
        `Service: ${data.get("service")}`,
        data.get("message") ? `Details: ${data.get("message")}` : null
      ].filter(Boolean);
      const sms = `sms:+13863153633?body=${encodeURIComponent(lines.join("\n"))}`;
      const done = document.getElementById("quote-done");
      const link = document.getElementById("sms-link");
      if (link) link.href = sms;
      if (done) {
        done.hidden = false;
        done.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    });
  }

  // Footer year
  const yr = document.getElementById("year");
  if (yr) yr.textContent = new Date().getFullYear();
});

async function initGallery(grid) {
  const filtersEl = document.getElementById("gallery-filters");
  const emptyEl = document.getElementById("gallery-empty");
  let items = [];
  try {
    const res = await fetch("assets/gallery.json");
    if (!res.ok) throw new Error("no manifest");
    items = await res.json();
  } catch {
    if (emptyEl) emptyEl.hidden = false;
    return;
  }
  if (!items.length) {
    if (emptyEl) emptyEl.hidden = false;
    return;
  }

  const groups = ["All", ...new Set(items.map(i => i.group))];

  function render(filter) {
    grid.innerHTML = "";
    const shown = items.filter(i => filter === "All" || i.group === filter);
    shown.forEach((item) => {
      const fig = document.createElement("figure");
      fig.className = "g-item";
      fig.tabIndex = 0;
      fig.innerHTML = `
        <img src="${item.src}" alt="${item.alt}" loading="lazy">
        <figcaption class="g-cap"><span>${item.service}</span><strong>${item.title}</strong></figcaption>`;
      fig.addEventListener("click", () => openLightbox(shown, shown.indexOf(item)));
      fig.addEventListener("keydown", (e) => {
        if (e.key === "Enter") openLightbox(shown, shown.indexOf(item));
      });
      grid.appendChild(fig);
    });
  }

  // Filter buttons
  groups.forEach((g) => {
    const btn = document.createElement("button");
    btn.className = "filter-btn" + (g === "All" ? " active" : "");
    btn.textContent = g;
    btn.addEventListener("click", () => {
      filtersEl.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      render(g);
    });
    filtersEl.appendChild(btn);
  });

  render("All");

  // ---- Lightbox ----
  const lb = document.getElementById("lightbox");
  const lbImg = lb.querySelector("img");
  const lbCount = lb.querySelector(".lb-count");
  let current = [], idx = 0;

  function show() {
    const item = current[idx];
    lbImg.src = item.src;
    lbImg.alt = item.alt;
    lbCount.textContent = `${idx + 1} of ${current.length} — ${item.title}`;
  }
  function openLightbox(list, i) {
    current = list; idx = i;
    lb.classList.add("open");
    document.body.style.overflow = "hidden";
    show();
  }
  function close() {
    lb.classList.remove("open");
    document.body.style.overflow = "";
  }
  lb.querySelector(".lb-close").addEventListener("click", close);
  lb.querySelector(".lb-prev").addEventListener("click", (e) => {
    e.stopPropagation();
    idx = (idx - 1 + current.length) % current.length;
    show();
  });
  lb.querySelector(".lb-next").addEventListener("click", (e) => {
    e.stopPropagation();
    idx = (idx + 1) % current.length;
    show();
  });
  lb.addEventListener("click", (e) => { if (e.target === lb) close(); });
  document.addEventListener("keydown", (e) => {
    if (!lb.classList.contains("open")) return;
    if (e.key === "Escape") close();
    if (e.key === "ArrowLeft") { idx = (idx - 1 + current.length) % current.length; show(); }
    if (e.key === "ArrowRight") { idx = (idx + 1) % current.length; show(); }
  });
}
