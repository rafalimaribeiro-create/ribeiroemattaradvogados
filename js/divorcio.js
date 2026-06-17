/* ===================================================================
   CALCULADORA DE PARTILHA DE DIVÓRCIO (estimativa)
   ------------------------------------------------------------------
   Simulação SIMPLIFICADA da divisão de bens conforme o regime.
   ⚠️ É UM NORTE, NÃO UMA CERTEZA JURÍDICA.
   =================================================================== */
(function () {
  "use strict";

  const form = document.getElementById("divForm");
  const result = document.getElementById("divResult");
  if (!form || !result) return;

  function parseMoney(str) {
    if (!str) return 0;
    const clean = String(str).replace(/[^\d,]/g, "").replace(",", ".");
    const v = parseFloat(clean);
    return isNaN(v) ? 0 : v;
  }
  const brl = (v) =>
    v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 2 });

  function regime() {
    return document.getElementById("divRegime").value;
  }

  // ----- Exibição condicional + rótulo dinâmico -----
  function updateVis() {
    const r = regime();
    document.querySelectorAll(".div__cond").forEach((el) => {
      const allowed = (el.dataset.whenRegime || "").split(",");
      el.hidden = allowed.indexOf(r) === -1;
    });
    const lbl = document.getElementById("divComunsLabel");
    const help = document.getElementById("divComunsHelp");
    if (lbl && help) {
      if (r === "universal") {
        lbl.textContent = "Patrimônio total do casal (R$)";
        help.textContent = "Na comunhão universal quase todo o patrimônio é comum e dividido 50/50.";
      } else if (r === "participacao") {
        lbl.textContent = "Aquestos a partilhar (R$)";
        help.textContent = "Bens adquiridos onerosamente durante o casamento (divididos 50/50).";
      } else {
        lbl.textContent = "Bens comuns a partilhar (R$)";
        help.textContent = "Bens adquiridos onerosamente durante o casamento (serão divididos 50/50).";
      }
    }
  }
  form.addEventListener("change", updateVis);
  updateVis();

  // ----- Cálculo -----
  function calcular() {
    const r = regime();
    let comuns = 0;
    let dividas = 0;
    if (r !== "separacao") {
      const bruto = parseMoney(document.getElementById("divComuns").value);
      dividas = parseMoney(document.getElementById("divDividas").value);
      comuns = Math.max(0, bruto - dividas); // abate dívidas comuns
    }
    let p1 = parseMoney(document.getElementById("divPart1").value);
    let p2 = parseMoney(document.getElementById("divPart2").value);
    if (r === "universal") { p1 = 0; p2 = 0; }

    let c1, c2;
    const notas = [];
    if (dividas > 0) notas.push("Dívidas comuns de " + brl(dividas) + " foram abatidas dos bens comuns antes da divisão.");
    if (r === "universal") {
      c1 = comuns / 2; c2 = comuns / 2;
      notas.push("Comunhão universal: praticamente todo o patrimônio é comum e dividido igualmente (50/50).");
    } else if (r === "separacao") {
      c1 = p1; c2 = p2;
      notas.push("Separação total (convencional): em regra não há partilha — cada um fica com os bens em seu nome.");
      notas.push("Atenção: na separação legal/obrigatória aplica-se a Súmula 377 (bens adquiridos no esforço comum podem se comunicar).");
    } else {
      // parcial ou participação
      c1 = comuns / 2 + p1;
      c2 = comuns / 2 + p2;
      notas.push("Os bens comuns são divididos 50/50; os bens particulares ficam com cada cônjuge.");
    }
    return { regime: r, comuns: comuns, p1: p1, p2: p2, c1: c1, c2: c2, notas: notas };
  }

  // ----- Renderização -----
  function render(o) {
    let html = '<h3 class="calc__result-title">Estimativa da partilha</h3>';

    if (o.regime !== "separacao") {
      html +=
        '<div class="calc__line calc__line--heranca"><span>Bens comuns a partilhar</span><strong>' +
        brl(o.comuns) + "</strong></div>";
    }

    html +=
      '<table class="calc__table"><thead><tr><th></th><th>Cônjuge 1</th><th>Cônjuge 2</th></tr></thead><tbody>';
    if (o.regime !== "separacao") {
      html +=
        "<tr><td>Metade dos bens comuns</td><td>" + brl(o.comuns / 2) + "</td><td>" + brl(o.comuns / 2) + "</td></tr>";
    }
    if (o.regime !== "universal") {
      html += "<tr><td>Bens particulares</td><td>" + brl(o.p1) + "</td><td>" + brl(o.p2) + "</td></tr>";
    }
    html +=
      '<tr class="calc__table-total"><td>Total de cada</td><td>' + brl(o.c1) + "</td><td>" + brl(o.c2) + "</td></tr>";
    html += "</tbody></table>";

    if (o.notas.length) {
      html += '<ul class="calc__notas">';
      o.notas.forEach((nt) => (html += "<li>" + nt + "</li>"));
      html += "</ul>";
    }

    html +=
      '<p class="calc__cta-line">Quer orientação sobre o seu divórcio? ' +
      '<a href="#" class="calc__cta-link" data-wa-message="Olá! Usei a calculadora de partilha de divórcio no site e gostaria de orientação sobre o meu caso.">Falar com um advogado</a></p>';

    result.innerHTML = html;
    result.querySelectorAll("[data-wa-message]").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        if (window.openWhatsApp) window.openWhatsApp(btn.getAttribute("data-wa-message"));
      });
    });
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    const o = calcular();
    if (o.c1 + o.c2 <= 0) {
      result.innerHTML =
        '<p class="calc__placeholder">Informe ao menos um valor de bens para calcular a partilha.</p>';
      return;
    }
    render(o);
  });
})();

/* ===================================================================
   ESTIMATIVA DE PENSÃO ALIMENTÍCIA (por % da renda)
   =================================================================== */
(function () {
  "use strict";

  const form = document.getElementById("pensaoForm");
  const result = document.getElementById("pensaoResult");
  if (!form || !result) return;

  function parseMoney(str) {
    if (!str) return 0;
    const clean = String(str).replace(/[^\d,]/g, "").replace(",", ".");
    const v = parseFloat(clean);
    return isNaN(v) ? 0 : v;
  }
  const brl = (v) =>
    v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 2 });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    const renda = parseMoney(document.getElementById("pensaoRenda").value);
    const filhos = parseInt(document.getElementById("pensaoFilhos").value, 10) || 1;
    let pct = parseFloat(document.getElementById("pensaoPct").value) || 0;
    if (pct < 0) pct = 0;
    if (pct > 100) pct = 100;

    if (renda <= 0) {
      result.innerHTML =
        '<p class="calc__placeholder">Informe a renda mensal para estimar a pensão.</p>';
      return;
    }

    const mensal = renda * pct / 100;
    const porFilho = mensal / filhos;

    let html = '<h3 class="calc__result-title">Estimativa da pensão</h3>';
    html +=
      '<div class="calc__line calc__line--heranca"><span>Pensão mensal estimada <em>(' +
      String(pct).replace(".", ",") + "% da renda)</em></span><strong>" + brl(mensal) + "</strong></div>";
    if (filhos > 1) {
      html +=
        '<div class="calc__line"><span>Por filho (' + filhos + ")</span><strong>" + brl(porFilho) + "</strong></div>";
    }
    html +=
      '<div class="calc__line calc__line--total"><span>Equivalente anual</span><strong>' +
      brl(mensal * 12) + "</strong></div>";
    html +=
      '<ul class="calc__notas"><li>Valor de referência. O juiz fixa caso a caso pelo binômio necessidade × possibilidade.</li>' +
      "<li>Despesas como escola, plano de saúde e atividades podem ser somadas ou rateadas à parte.</li></ul>";
    html +=
      '<p class="calc__cta-line">Precisa definir ou revisar uma pensão? ' +
      '<a href="#" class="calc__cta-link" data-wa-message="Olá! Usei a estimativa de pensão alimentícia no site e gostaria de orientação.">Falar com um advogado</a></p>';

    result.innerHTML = html;
    result.querySelectorAll("[data-wa-message]").forEach((btn) => {
      btn.addEventListener("click", (ev) => {
        ev.preventDefault();
        if (window.openWhatsApp) window.openWhatsApp(btn.getAttribute("data-wa-message"));
      });
    });
  });
})();
