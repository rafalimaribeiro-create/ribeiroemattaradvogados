/* ===================================================================
   INTERAÇÕES GERAIS DO SITE
   =================================================================== */
(function () {
  "use strict";
  const cfg = window.SITE_CONFIG || {};

  // ----- Ano no rodapé -----
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ----- Número de WhatsApp visível -----
  document.querySelectorAll("[data-wa-display]").forEach((el) => {
    if (cfg.whatsappDisplay) el.textContent = cfg.whatsappDisplay;
  });

  // ----- Botões de WhatsApp (data-wa-message) -----
  // Usa window.waLink definido em chatbot.js
  document.querySelectorAll("[data-wa-message]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const msg = btn.getAttribute("data-wa-message");
      const url = (window.waLink ? window.waLink(msg) : "#");
      window.open(url, "_blank");
    });
  });

  // ----- Header sombra ao rolar -----
  const header = document.getElementById("header");
  const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 10);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  // ----- Menu mobile -----
  const toggle = document.getElementById("navToggle");
  const nav = document.getElementById("nav");
  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const open = nav.classList.toggle("is-open");
      toggle.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", String(open));
    });
    nav.querySelectorAll("a").forEach((a) =>
      a.addEventListener("click", () => {
        nav.classList.remove("is-open");
        toggle.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      })
    );
  }

  // ----- Formulário de contato -> WhatsApp -----
  const form = document.getElementById("contactForm");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const nome = form.nome.value.trim();
      const telefone = form.telefone.value.trim();
      const assunto = form.assunto.value;
      const mensagem = form.mensagem.value.trim();

      if (!nome || !telefone) {
        alert("Por favor, preencha pelo menos seu nome e telefone.");
        return;
      }

      const texto =
        `Olá, ${cfg.firmName || "equipe"}! Vim pelo site.%0A%0A` +
        `*Nome:* ${nome}%0A` +
        `*Telefone:* ${telefone}%0A` +
        `*Assunto:* ${assunto}%0A` +
        (mensagem ? `*Mensagem:* ${mensagem}` : "");

      const decoded = decodeURIComponent(texto.replace(/%0A/g, "\n"));
      const url = window.waLink ? window.waLink(decoded) : "#";
      window.open(url, "_blank");
    });
  }
})();
