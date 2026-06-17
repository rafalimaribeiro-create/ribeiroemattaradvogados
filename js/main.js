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

  // ----- QR Code do site (gerado no navegador, em todos os pontos com .js-site-qr) -----
  (function renderQr() {
    const url = cfg.siteUrl || window.location.href;
    document.querySelectorAll(".js-site-url").forEach((a) => { a.href = url; });
    document.querySelectorAll(".js-site-qr").forEach((qrEl) => {
      if (typeof window.QRCode === "function") {
        new window.QRCode(qrEl, {
          text: url,
          width: 128,
          height: 128,
          colorDark: "#0f2740",
          colorLight: "#ffffff",
          correctLevel: window.QRCode.CorrectLevel.M,
        });
      } else {
        // Fallback caso a biblioteca (CDN) não carregue
        qrEl.innerHTML = '<span class="qr-share__fallback">QR indisponível agora — use o link.</span>';
      }
    });
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

  // ----- Faixa de topo (acesso rápido à calculadora) -----
  const topbar = document.getElementById("topbar");
  const topbarClose = document.getElementById("topbarClose");
  if (topbar) {
    try {
      if (localStorage.getItem("rm_topbar_closed") === "1") topbar.classList.add("is-hidden");
    } catch (err) { /* localStorage indisponível */ }
    if (topbarClose) {
      topbarClose.addEventListener("click", () => {
        topbar.classList.add("is-hidden");
        try { localStorage.setItem("rm_topbar_closed", "1"); } catch (err) {}
      });
    }
  }

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

  // ----- Impressão / PDF do resultado das calculadoras -----
  // Imprime apenas o elemento de resultado, com cabeçalho do escritório.
  window.imprimirResultado = function (targetEl) {
    if (!targetEl) return;
    const header = document.createElement("div");
    header.className = "print-header print-only";
    const data = new Date().toLocaleDateString("pt-BR");
    header.innerHTML =
      "<strong>" + (cfg.firmName || "") + "</strong>" +
      "<span>Simulação gerada em " + data + " — " + (cfg.siteUrl || location.href) + "</span>" +
      "<em>Estimativa (um norte). Não substitui orientação jurídica.</em>";
    targetEl.prepend(header);
    targetEl.classList.add("print-target");
    document.body.classList.add("printing");

    function cleanup() {
      document.body.classList.remove("printing");
      targetEl.classList.remove("print-target");
      if (header.parentNode) header.remove();
      window.removeEventListener("afterprint", cleanup);
    }
    window.addEventListener("afterprint", cleanup);
    window.print();
    setTimeout(cleanup, 1500);
  };

  // Acrescenta o botão de imprimir ao resultado e liga o clique.
  window.attachPrintButton = function (resultEl) {
    if (!resultEl) return;
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "btn btn--ghost btn--print no-print";
    btn.innerHTML = "🖨️ Imprimir / Salvar em PDF";
    btn.addEventListener("click", function () { window.imprimirResultado(resultEl); });
    resultEl.appendChild(btn);
  };
})();
