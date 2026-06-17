/* ===================================================================
   CHATBOT / ASSISTENTE VIRTUAL
   ------------------------------------------------------------------
   Fluxo de qualificação simples (árvore de decisão) que, ao final,
   abre o WhatsApp com uma mensagem pré-preenchida e contextualizada.

   IMPORTANTE: este é um protótipo "front-end". O atendimento real
   acontece no WhatsApp. Para automação completa (respostas 24/7,
   horário comercial, integração com CRM), veja docs/PLANO-CHATBOT-WHATSAPP.md
   =================================================================== */
(function () {
  "use strict";

  const cfg = window.SITE_CONFIG || {};

  // Monta link do WhatsApp (wa.me) com mensagem opcional
  function waLink(message) {
    const number = (cfg.whatsappNumber || "").replace(/\D/g, "");
    const text = encodeURIComponent(message || cfg.defaultMessage || "Olá!");
    return `https://wa.me/${number}?text=${text}`;
  }
  window.waLink = waLink; // exposto para o main.js

  // Modo demonstração: enquanto o número for o de exemplo, não abrimos um
  // WhatsApp inválido — mostramos um aviso com a mensagem que seria enviada.
  function isDemo() {
    const n = (cfg.whatsappNumber || "").replace(/\D/g, "");
    return !n || n === "5500000000000";
  }
  // Abre o WhatsApp (ou o aviso de demonstração). Use sempre esta função.
  window.openWhatsApp = function (message) {
    if (isDemo() && typeof window.showWaDemo === "function") {
      window.showWaDemo(message || cfg.defaultMessage);
      return;
    }
    window.open(waLink(message), "_blank");
  };

  // ----- Árvore de conversa -----
  // Cada nó: mensagem(ns) do bot + opções (chips). Uma opção pode:
  //   - levar a outro nó (next)
  //   - encerrar abrindo o WhatsApp (wa: "mensagem")
  const FLOW = {
    start: {
      bot: [
        "Olá! 👋 Sou o assistente virtual da Ribeiro & Matar Advogados.",
        "Posso te ajudar a entender seu caso de inventário. Sobre o que você precisa falar?",
      ],
      options: [
        { label: "Quero abrir um inventário", next: "tipo" },
        { label: "Quanto custa?", next: "custo" },
        { label: "Prazos e documentos", next: "prazo" },
        { label: "Planejamento sucessório", next: "planejamento" },
      ],
    },

    tipo: {
      bot: ["Que bom! Os herdeiros estão todos de acordo e são maiores de idade?"],
      options: [
        { label: "Sim, todos de acordo", next: "extrajudicial" },
        { label: "Há menores ou conflito", next: "judicial" },
        { label: "Não tenho certeza", next: "naoSei" },
      ],
    },

    extrajudicial: {
      bot: [
        "Nesse caso o inventário **extrajudicial** (em cartório) costuma ser o mais rápido e econômico. 💡",
        "Para te dar uma orientação personalizada, vamos continuar no WhatsApp?",
      ],
      options: [
        { label: "Falar no WhatsApp ✅", wa: "Olá! Quero abrir um inventário EXTRAJUDICIAL. Os herdeiros estão de acordo e são maiores. Pode me orientar?" },
        { label: "Voltar ao início", next: "start" },
      ],
    },

    judicial: {
      bot: [
        "Entendi. Quando há herdeiros menores/incapazes ou divergência, o inventário precisa ser **judicial**. Cuidamos disso para você. ⚖️",
        "Vamos detalhar seu caso no WhatsApp?",
      ],
      options: [
        { label: "Falar no WhatsApp ✅", wa: "Olá! Preciso de um inventário JUDICIAL (há menores ou divergência entre herdeiros). Pode me ajudar?" },
        { label: "Voltar ao início", next: "start" },
      ],
    },

    naoSei: {
      bot: ["Sem problema! A gente analisa gratuitamente e indica o melhor caminho. Posso te chamar no WhatsApp para entender os detalhes?"],
      options: [
        { label: "Sim, quero análise gratuita ✅", wa: "Olá! Não sei qual tipo de inventário preciso. Gostaria da análise gratuita do meu caso." },
        { label: "Voltar ao início", next: "start" },
      ],
    },

    custo: {
      bot: [
        "O custo depende de 3 fatores: 📊",
        "1) Valor dos bens • 2) Estado (ITCMD varia) • 3) Tipo de procedimento (judicial ou extrajudicial).",
        "Fazemos uma estimativa gratuita do seu caso. Quer receber a sua?",
      ],
      options: [
        { label: "Quero a estimativa ✅", wa: "Olá! Gostaria de uma estimativa de custos para o meu inventário." },
        { label: "Ver outras dúvidas", next: "start" },
      ],
    },

    prazo: {
      bot: [
        "O ideal é abrir o inventário em até **60 dias** do falecimento para evitar multa no ITCMD. ⏱️",
        "Mas mesmo após esse prazo é possível regularizar. Posso te enviar a lista de documentos pelo WhatsApp?",
      ],
      options: [
        { label: "Quero a lista de documentos ✅", wa: "Olá! Pode me enviar a lista de documentos necessários para o inventário?" },
        { label: "Voltar ao início", next: "start" },
      ],
    },

    planejamento: {
      bot: [
        "Ótima decisão! Planejamento sucessório (holding familiar, doações) reduz custos e evita brigas no futuro. 🛡️",
        "Quer conversar com um de nossos advogados sobre isso?",
      ],
      options: [
        { label: "Falar com advogado ✅", wa: "Olá! Tenho interesse em planejamento sucessório / holding familiar. Pode me explicar como funciona?" },
        { label: "Voltar ao início", next: "start" },
      ],
    },
  };

  // ----- Elementos -----
  const launcher = document.getElementById("chatLauncher");
  const win = document.getElementById("chatWindow");
  const closeBtn = document.getElementById("chatClose");
  const body = document.getElementById("chatBody");
  const quick = document.getElementById("chatQuick");
  const badge = launcher ? launcher.querySelector(".chatbot__badge") : null;

  if (!launcher || !win) return;

  let started = false;

  function open() {
    win.hidden = false;
    launcher.setAttribute("aria-expanded", "true");
    if (badge) badge.style.display = "none";
    if (!started) { started = true; goTo("start"); }
  }
  function close() {
    win.hidden = true;
    launcher.setAttribute("aria-expanded", "false");
  }

  function scrollDown() { body.scrollTop = body.scrollHeight; }

  function addMessage(text, who) {
    const el = document.createElement("div");
    el.className = "msg msg--" + who;
    // negrito simples com **texto**
    el.innerHTML = text.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    body.appendChild(el);
    scrollDown();
  }

  function showTyping() {
    const t = document.createElement("div");
    t.className = "msg msg--bot msg--typing";
    t.innerHTML = "<span></span><span></span><span></span>";
    body.appendChild(t);
    scrollDown();
    return t;
  }

  // Renderiza um nó do fluxo, com efeito de digitação entre mensagens
  function goTo(nodeKey) {
    const node = FLOW[nodeKey];
    if (!node) return;
    quick.innerHTML = "";

    let i = 0;
    function next() {
      if (i >= node.bot.length) { renderOptions(node.options); return; }
      const typing = showTyping();
      setTimeout(() => {
        typing.remove();
        addMessage(node.bot[i], "bot");
        i++;
        next();
      }, 600 + Math.random() * 350);
    }
    next();
  }

  function renderOptions(options) {
    quick.innerHTML = "";
    (options || []).forEach((opt) => {
      const chip = document.createElement("button");
      chip.className = "chip" + (opt.wa ? " chip--wa" : "");
      chip.textContent = opt.label;
      chip.addEventListener("click", () => {
        addMessage(opt.label, "user");
        quick.innerHTML = "";
        if (opt.wa) {
          setTimeout(() => {
            addMessage("Perfeito! Vou te direcionar para o WhatsApp para continuarmos o atendimento... 🟢", "bot");
            window.openWhatsApp(opt.wa);
          }, 500);
        } else if (opt.next) {
          setTimeout(() => goTo(opt.next), 350);
        }
      });
      quick.appendChild(chip);
    });
  }

  launcher.addEventListener("click", () => (win.hidden ? open() : close()));
  closeBtn.addEventListener("click", close);
})();
