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

  // Quote form -> compose a text message or email to the business
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
        data.get("city") ? `City/marina: ${data.get("city")}` : null,
        `Service: ${data.get("service")}`,
        data.get("message") ? `Details: ${data.get("message")}` : null
      ].filter(Boolean);
      const body = lines.join("\n");
      const sms = `sms:+13863153633?body=${encodeURIComponent(body)}`;
      const email = `mailto:booking@showcaseboatdetailing.com?subject=${encodeURIComponent("Quote request — " + (data.get("name") || "boat detailing"))}&body=${encodeURIComponent(body + "\n\n(Attach boat photos before sending.)")}`;
      const done = document.getElementById("quote-done");
      const smsLink = document.getElementById("sms-link");
      const emailLink = document.getElementById("email-link");
      if (smsLink) smsLink.href = sms;
      if (emailLink) emailLink.href = email;
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
  items.forEach((item) => {
    const fig = document.createElement("figure");
    fig.className = "g-item";
    fig.tabIndex = 0;
    const focus = item.focus ? ` style="object-position:${item.focus};"` : "";
    fig.innerHTML = `
      <img src="${item.src}" alt="${item.alt}" loading="lazy"${focus}>
      <figcaption class="g-cap"><strong>${item.title}</strong></figcaption>`;
    fig.addEventListener("click", () => openLightbox(items, items.indexOf(item)));
    fig.addEventListener("keydown", (e) => {
      if (e.key === "Enter") openLightbox(items, items.indexOf(item));
    });
    grid.appendChild(fig);
  });

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
