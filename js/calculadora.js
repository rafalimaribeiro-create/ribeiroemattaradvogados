/* ===================================================================
   CALCULADORA DE QUINHÃO (estimativa)
   ------------------------------------------------------------------
   Simulação SIMPLIFICADA da sucessão legítima (sem testamento),
   baseada no Código Civil (arts. 1.829 e seguintes).

   ⚠️ É UM NORTE, NÃO UMA CERTEZA JURÍDICA. Não considera testamento,
   dívidas, ITCMD, doações em vida, renúncia, direito de representação,
   separação obrigatória, particularidades de união estável, etc.
   =================================================================== */
(function () {
  "use strict";

  const form = document.getElementById("calcForm");
  const result = document.getElementById("calcResult");
  if (!form || !result) return;

  // ----- Helpers -----
  function parseMoney(str) {
    if (!str) return 0;
    // aceita "600.000,50", "600000", "600.000"
    const clean = String(str).replace(/[^\d,]/g, "").replace(",", ".");
    const v = parseFloat(clean);
    return isNaN(v) ? 0 : v;
  }
  // Máscara monetária: formata "R$ 1.000.000,00" enquanto o usuário digita
  function maskMoney(el) {
    let digits = (el.value || "").replace(/\D/g, "");
    if (!digits) { el.value = ""; return; }
    digits = digits.replace(/^0+/, "") || "0";
    while (digits.length < 3) digits = "0" + digits; // garante centavos
    const cents = digits.slice(-2);
    const inteiro = digits.slice(0, -2).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    el.value = "R$ " + inteiro + "," + cents;
  }
  document.querySelectorAll(".js-money").forEach((el) => {
    el.addEventListener("input", function () { maskMoney(el); });
  });

  const brl = (v) =>
    v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 2 });
  const pct = (part, whole) =>
    whole > 0 ? (part / whole * 100).toFixed(1).replace(".", ",") + "%" : "—";

  function radioVal(name) {
    const el = form.querySelector('input[name="' + name + '"]:checked');
    return el ? el.value : null;
  }

  // ----- Exibição condicional dos campos -----
  function getState() {
    return {
      conjuge: radioVal("conjuge"),
      regime: document.getElementById("calcRegime").value,
      filhos: parseInt(document.getElementById("calcFilhos").value, 10) || 0,
    };
  }
  function updateVisibility() {
    const s = getState();
    document.querySelectorAll(".calc__cond").forEach((el) => {
      let show = true;
      if (el.dataset.whenConjuge && el.dataset.whenConjuge !== s.conjuge) show = false;
      if (el.dataset.whenRegime && el.dataset.whenRegime !== s.regime) show = false;
      if (el.dataset.whenFilhos === "0" && s.filhos !== 0) show = false;
      if (el.dataset.whenFilhos === "1+" && s.filhos < 1) show = false;
      // campos que dependem de cônjuge só aparecem se houver cônjuge
      if (el.dataset.requireConjuge === "sim" && s.conjuge !== "sim") show = false;
      el.hidden = !show;
    });
  }
  form.addEventListener("change", updateVisibility);
  form.addEventListener("input", updateVisibility);
  updateVisibility();

  // ----- Núcleo do cálculo -----
  function calcular(inp) {
    const out = { meacao: 0, heranca: 0, herdeiros: [], notas: [] };
    const total = inp.total;

    // 1) Meação do cônjuge (não é herança — é a metade que já é dele/dela)
    if (inp.hasConjuge) {
      if (inp.regime === "universal") {
        out.meacao = total * 0.5;
        out.notas.push("Comunhão universal: o cônjuge tem meação de 50% do patrimônio.");
      } else if (inp.regime === "parcial") {
        out.meacao = inp.bensComuns * 0.5;
        out.notas.push("Comunhão parcial: meação de 50% sobre os bens comuns informados.");
      } else if (inp.regime === "separacao") {
        out.notas.push("Separação total: não há meação.");
      } else if (inp.regime === "participacao") {
        out.notas.push(
          "Participação final: pode haver crédito do cônjuge sobre os aquestos — não estimado aqui. Consulte um advogado."
        );
      }
    }

    const heranca = Math.max(0, total - out.meacao);
    out.heranca = heranca;

    const n = inp.numFilhos;
    const asc = inp.ascendentes;

    if (n > 0) {
      // ===== Há descendentes =====
      let spouseInherits = false;
      if (inp.hasConjuge) {
        if (inp.regime === "separacao" || inp.regime === "participacao") {
          spouseInherits = true; // separação convencional / participação: concorre
        } else if (inp.regime === "parcial") {
          spouseInherits = inp.temBensParticulares; // só concorre se houver bens particulares
        } else if (inp.regime === "universal") {
          spouseInherits = false; // não concorre (já tem meação)
        }
      }

      let spouseShare = 0;
      let filhoShare;
      if (spouseInherits) {
        if (inp.filhosComuns && n >= 4) {
          spouseShare = heranca / 4; // piso de 1/4 quando filhos são comuns
          filhoShare = (heranca - spouseShare) / n;
          out.notas.push("Cônjuge concorre com os filhos e tem piso de 1/4 (filhos comuns, 4+).");
        } else {
          spouseShare = heranca / (n + 1);
          filhoShare = heranca / (n + 1);
          out.notas.push("Cônjuge concorre com os filhos, recebendo quota igual à de um filho.");
        }
        out.herdeiros.push({ nome: "Cônjuge/companheiro(a)", valor: spouseShare });
      } else {
        filhoShare = heranca / n;
        if (inp.hasConjuge)
          out.notas.push("Neste regime, o cônjuge NÃO concorre com os filhos (fica com a meação, se houver).");
      }
      out.herdeiros.push({ nome: "Cada filho", valor: filhoShare, qtd: n });
    } else if (asc > 0) {
      // ===== Sem descendentes, com ascendentes =====
      if (inp.hasConjuge) {
        let spouseShare, ascTotal;
        if (asc >= 2) {
          spouseShare = heranca / 3;
          ascTotal = heranca * (2 / 3);
          out.notas.push("Sem filhos: cônjuge recebe 1/3 e os ascendentes dividem 2/3.");
        } else {
          spouseShare = heranca / 2;
          ascTotal = heranca / 2;
          out.notas.push("Sem filhos e com um só ascendente: cônjuge e ascendente dividem pela metade.");
        }
        out.herdeiros.push({ nome: "Cônjuge/companheiro(a)", valor: spouseShare });
        out.herdeiros.push({ nome: "Cada ascendente", valor: ascTotal / asc, qtd: asc });
      } else {
        out.herdeiros.push({ nome: "Cada ascendente", valor: heranca / asc, qtd: asc });
        out.notas.push("Sem cônjuge e sem filhos: a herança vai para os ascendentes.");
      }
    } else {
      // ===== Sem descendentes e sem ascendentes =====
      if (inp.hasConjuge) {
        out.herdeiros.push({ nome: "Cônjuge/companheiro(a)", valor: heranca });
        out.notas.push("Sem filhos e sem ascendentes: o cônjuge recebe toda a herança.");
      } else {
        out.notas.push(
          "Sem cônjuge, filhos ou ascendentes: a herança vai para os colaterais (irmãos, sobrinhos, etc.), com regras próprias. Consulte um advogado."
        );
      }
    }

    return out;
  }

  // ----- Renderização -----
  function render(out, inp) {
    let html = '<h3 class="calc__result-title">Estimativa da divisão</h3>';

    if (out.meacao > 0) {
      html +=
        '<div class="calc__line calc__line--meacao"><span>Meação do cônjuge <em>(não é herança)</em></span><strong>' +
        brl(out.meacao) +
        "</strong></div>";
    }
    html +=
      '<div class="calc__line calc__line--heranca"><span>Herança a partilhar</span><strong>' +
      brl(out.heranca) +
      "</strong></div>";

    if (out.herdeiros.length) {
      html +=
        '<table class="calc__table"><thead><tr><th>Herdeiro</th><th>Quinhão</th><th>% da herança</th></tr></thead><tbody>';
      let spouseShare = 0;
      out.herdeiros.forEach((h) => {
        const label = h.qtd ? h.nome + " <em>(× " + h.qtd + ")</em>" : h.nome;
        if (h.nome.indexOf("Cônjuge") === 0) spouseShare = h.valor;
        html +=
          "<tr><td>" +
          label +
          "</td><td>" +
          brl(h.valor) +
          "</td><td>" +
          pct(h.valor, out.heranca) +
          "</td></tr>";
      });
      html += "</tbody></table>";

      if (inp.hasConjuge && (out.meacao > 0 || spouseShare > 0)) {
        html +=
          '<div class="calc__line calc__line--total"><span>Total do cônjuge (meação + quinhão)</span><strong>' +
          brl(out.meacao + spouseShare) +
          "</strong></div>";
      }
    }

    if (out.notas.length) {
      html += '<ul class="calc__notas">';
      out.notas.forEach((nt) => (html += "<li>" + nt + "</li>"));
      html += "</ul>";
    }

    html +=
      '<p class="calc__cta-line">Quer confirmar como ficaria no seu caso real? ' +
      '<a href="#" class="calc__cta-link" data-wa-message="Olá! Fiz uma simulação na calculadora de quinhão do site e gostaria de uma análise do meu caso de inventário.">Falar com um advogado</a></p>';

    result.innerHTML = html;

    // reativa os links de WhatsApp recém-criados
    result.querySelectorAll("[data-wa-message]").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        if (window.openWhatsApp) window.openWhatsApp(btn.getAttribute("data-wa-message"));
      });
    });
  }

  // ----- Submit -----
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    const total = parseMoney(document.getElementById("calcTotal").value);
    if (total <= 0) {
      result.innerHTML =
        '<p class="calc__placeholder">Informe um valor de patrimônio maior que zero para calcular.</p>';
      return;
    }
    const hasConjuge = radioVal("conjuge") === "sim";
    const regime = document.getElementById("calcRegime").value;
    const numFilhos = parseInt(document.getElementById("calcFilhos").value, 10) || 0;
    let bensComuns = parseMoney(document.getElementById("calcComuns").value);
    if (!bensComuns) bensComuns = total; // se vazio, assume tudo comum

    const inp = {
      total: total,
      hasConjuge: hasConjuge,
      regime: regime,
      bensComuns: Math.min(bensComuns, total),
      temBensParticulares: total - Math.min(bensComuns, total) > 0.009,
      numFilhos: numFilhos,
      filhosComuns: radioVal("filhosComuns") !== "nao",
      ascendentes: parseInt(document.getElementById("calcAscendentes").value, 10) || 0,
    };

    render(calcular(inp), inp);
  });
})();
