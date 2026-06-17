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

  // ----- QR Code do site (gerado no navegador) -----
  (function renderQr() {
    const qrEl = document.getElementById("siteQr");
    const url = cfg.siteUrl || window.location.href;
    const link = document.getElementById("siteUrlLink");
    if (link) link.href = url;
    if (!qrEl) return;
    if (typeof window.QRCode === "function") {
      new window.QRCode(qrEl, {
        text: url,
        width: 132,
        height: 132,
        colorDark: "#0f2740",
        colorLight: "#ffffff",
        correctLevel: window.QRCode.CorrectLevel.M,
      });
    } else {
      // Fallback caso a biblioteca (CDN) não carregue
      qrEl.innerHTML = '<span class="qr-share__fallback">QR indisponível agora — use o link ao lado.</span>';
    }
  })();

  // ----- Botões de WhatsApp (data-wa-message) -----
  // Usa window.waLink definido em chatbot.js
  document.querySelectorAll("[data-wa-message]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const msg = btn.getAttribute("data-wa-message");
      if (window.openWhatsApp) window.openWhatsApp(msg);
    });
  });

  // ----- Aviso de "modo demonstração" -----
  // Mostra a mensagem que seria enviada ao WhatsApp enquanto não há número real.
  window.showWaDemo = function (message) {
    document.querySelectorAll(".wa-demo").forEach((el) => el.remove());
    const overlay = document.createElement("div");
    overlay.className = "wa-demo";
    overlay.innerHTML =
      '<div class="wa-demo__box" role="dialog" aria-label="Modo demonstração">' +
      '<button class="wa-demo__close" aria-label="Fechar">&times;</button>' +
      '<span class="wa-demo__tag">🟢 Modo demonstração</span>' +
      "<h4>Aqui o cliente seria direcionado ao WhatsApp</h4>" +
      "<p>Com a seguinte mensagem já preenchida:</p>" +
      '<div class="wa-demo__msg"></div>' +
      '<small>Para ativar o envio real, basta cadastrar o número em <code>js/config.js</code>.</small>' +
      "</div>";
    overlay.querySelector(".wa-demo__msg").textContent = message || "";
    const close = () => overlay.remove();
    overlay.addEventListener("click", (e) => { if (e.target === overlay) close(); });
    overlay.querySelector(".wa-demo__close").addEventListener("click", close);
    document.body.appendChild(overlay);
  };

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
      if (window.openWhatsApp) window.openWhatsApp(decoded);
    });
  }
})();
