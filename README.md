# Ribeiro & Matar Advogados — Site (Protótipo)

Protótipo de site institucional para escritório de advocacia **especializado em inventário**
(judicial e extrajudicial), com foco em captação de clientes via **WhatsApp**, redes sociais
e tráfego pago.

> ⚠️ **Protótipo.** Conteúdo, depoimentos e números são ilustrativos. Antes de publicar,
> revise tudo conforme o **Código de Ética e Disciplina da OAB** (publicidade da advocacia
> deve ser informativa e sóbria, sem captação/mercantilização).

---

## ✨ O que já está pronto

- **Landing page responsiva** (one-page) com seções: hero, diferenciais, sobre, áreas de
  atuação, como funciona, depoimentos, FAQ e contato.
- **Botões de WhatsApp** com mensagens pré-preenchidas e contextualizadas por seção.
- **Chatbot/assistente virtual** no canto inferior: um fluxo de qualificação por cliques que,
  ao final, abre o WhatsApp já com o contexto da conversa.
- **Formulário de contato** que monta uma mensagem formatada e envia para o WhatsApp.
- **SEO básico** e tags Open Graph para compartilhamento em redes sociais.

## 🗂 Estrutura

```
.
├── index.html                      # Página principal
├── css/styles.css                  # Estilos (paleta azul-petróleo + dourado)
├── js/
│   ├── config.js                   # ⚙️ EDITE AQUI: número de WhatsApp e dados de contato
│   ├── chatbot.js                  # Assistente virtual (árvore de decisão)
│   └── main.js                     # Menu, formulário, botões de WhatsApp
├── docs/
│   ├── PLANO-MARKETING.md          # Redes sociais + tráfego pago
│   └── PLANO-CHATBOT-WHATSAPP.md   # Arquitetura do chatbot real (24/7)
└── README.md
```

## 🚀 Como rodar localmente

É um site estático — basta abrir o `index.html` no navegador. Para servir com um
servidor local (recomendado para testar o WhatsApp em celular):

```bash
# Python 3
python3 -m http.server 8000
# depois acesse http://localhost:8000
```

## ⚙️ Configuração (passo obrigatório)

Edite **`js/config.js`** com os dados reais:

```js
window.SITE_CONFIG = {
  whatsappNumber: "5511999999999",   // formato internacional, só números
  whatsappDisplay: "(11) 99999-9999",
  firmName: "Ribeiro & Matar Advogados",
  defaultMessage: "Olá! Vim pelo site...",
};
```

Também revise no `index.html`: e-mail, links de redes sociais e textos.

## 🌐 Como publicar (grátis e rápido)

- **GitHub Pages**: Settings → Pages → branch `main` (ou a de produção) → `/root`.
- **Netlify / Vercel / Cloudflare Pages**: conecte o repositório; deploy automático.
- Depois aponte o domínio (ex.: `ribeiroematar.adv.br`) para a hospedagem.

## 🗺 Próximos passos sugeridos

1. Substituir conteúdo ilustrativo por textos e fotos reais (revisados pela OAB).
2. Definir o número oficial de WhatsApp Business e configurar o chatbot real
   (ver `docs/PLANO-CHATBOT-WHATSAPP.md`).
3. Instalar **Meta Pixel** e **Google Tag** para mensurar conversões antes de iniciar tráfego pago.
4. Executar o plano de redes sociais e campanhas (ver `docs/PLANO-MARKETING.md`).

---

📄 Documentação detalhada em [`docs/`](docs/).
