# Plano de Integração — Chatbot via WhatsApp

Como evoluir do **protótipo atual** (widget no site que abre o WhatsApp com mensagem pronta)
para um **atendimento automatizado real**, 24/7, integrado ao CRM.

---

## 1. O que já existe no protótipo

- Widget de chat no site (`js/chatbot.js`) com **árvore de decisão** de qualificação.
- Ao final do fluxo, abre `https://wa.me/<número>?text=<mensagem>` com o contexto da conversa.
- Botões e formulário do site também geram links de WhatsApp pré-preenchidos.

**Limite:** o protótipo apenas *encaminha* para o WhatsApp. As respostas automáticas dentro
do WhatsApp (fora do horário, follow-up, etc.) exigem uma das opções abaixo.

---

## 2. Três caminhos de implementação (do mais simples ao mais robusto)

### Opção A — WhatsApp Business (app) + respostas rápidas  ⭐ começo recomendado
- **Custo:** grátis.
- **O que dá pra fazer:** mensagem de saudação automática, mensagem de ausência (fora do
  horário), respostas rápidas, catálogo, etiquetas para organizar leads.
- **Limite:** sem fluxo automatizado complexo; atendimento manual.
- **Ideal para:** validar o volume de contatos antes de investir em automação.

### Opção B — Plataforma de chatbot no-code (API oficial via BSP)
- **Ferramentas:** Kommo, ManyChat, Take Blip, Zenvia, Botconversa, Leadster, etc.
- **O que dá pra fazer:** chatbot com fluxo automático no próprio WhatsApp, distribuição para
  atendentes, integração com CRM, disparos (dentro das regras da Meta), relatórios.
- **Custo:** mensalidade + custo por conversa da Meta.
- **Ideal para:** escritório que quer escala sem desenvolver software.

### Opção C — WhatsApp Cloud API (oficial da Meta) + backend próprio
- **O que é:** API oficial gratuita de uso (paga-se por conversa à Meta), integrada a um
  servidor próprio (Node.js, etc.).
- **O que dá pra fazer:** controle total do fluxo, integração sob medida, IA/LLM para responder
  dúvidas em linguagem natural.
- **Custo:** desenvolvimento + hospedagem + conversas Meta.
- **Ideal para:** automação avançada e personalizada (médio/longo prazo).

> **Recomendação:** começar na **Opção A**, migrar para **B** quando o volume justificar, e só
> ir para **C** se houver necessidade real de personalização/IA.

---

## 3. Arquitetura de referência (Opção C — Cloud API)

```
Site / Anúncios / Instagram
        │  (botão "Falar no WhatsApp" — click-to-chat)
        ▼
   WhatsApp do cliente
        │
        ▼
  WhatsApp Cloud API (Meta)
        │  webhook (HTTPS)
        ▼
  Backend do escritório (Node.js/Express)
        ├─ Motor de fluxo (mesma árvore do protótipo)
        ├─ (opcional) IA/LLM para dúvidas livres
        ├─ Horário comercial / fila / handoff p/ advogado
        └─ Integração CRM (registra lead, status, origem da campanha)
        ▼
  Painel do escritório / CRM / Notificações
```

### Reaproveitamento
A árvore de decisão em `js/chatbot.js` (`FLOW`) pode ser portada quase diretamente para o
backend — as mesmas perguntas de qualificação (tipo de inventário, prazo, custo) servem como
base do fluxo automatizado no WhatsApp.

---

## 4. Passo a passo para ativar (Opção B/C)

1. **Conta Meta Business** verificada (Business Manager).
2. **Número de telefone dedicado** ao WhatsApp Business API (não pode estar no app comum).
3. **Conta WhatsApp Business (WABA)** e aprovação do **nome de exibição** ("Ribeiro & Matar Advogados").
4. Escolher **BSP/plataforma** (Opção B) **ou** configurar **Cloud API** (Opção C).
5. **Templates de mensagem** aprovados pela Meta para iniciar conversa (ex.: confirmação,
   follow-up). Conversas iniciadas pelo cliente (click-to-chat) têm janela de 24h livre.
6. Configurar **fluxo de qualificação**, horário comercial e **handoff** para advogado.
7. Integrar com **CRM** e marcar a **origem** (campanha/anúncio) de cada lead.
8. Conectar os botões do site/anúncios via **click-to-WhatsApp**.

---

## 5. Fluxo de atendimento sugerido (mesma lógica do protótipo)

```
1. Saudação + LGPD (aviso de uso de dados)
2. "Sobre o que você precisa falar?"
   ├─ Abrir inventário  -> herdeiros de acordo? -> indica judicial/extrajudicial
   ├─ Custos            -> explica os 3 fatores -> oferece estimativa
   ├─ Prazos/documentos -> alerta dos 60 dias  -> envia checklist
   └─ Planejamento      -> holding/doação       -> agenda conversa
3. Coleta nome + cidade + breve descrição
4. Dentro do horário comercial -> transfere para advogado
   Fora do horário -> "Recebemos! Retornamos no próximo dia útil" + registra lead
5. Registra tudo no CRM com a origem da campanha
```

---

## 6. LGPD e ética (obrigatório)

- **Aviso de privacidade** no primeiro contato: "Ao continuar, você concorda com o uso dos seus
  dados para atendimento, conforme nossa Política de Privacidade."
- Coletar **somente o necessário**; não pedir documentos sensíveis pelo chatbot automático.
- Guardar consentimento e permitir que o titular solicite exclusão dos dados.
- Conteúdo e abordagem em conformidade com o **Código de Ética da OAB** (informativo, sem
  captação agressiva nem promessa de resultado).

---

## 7. Métricas do chatbot

| Métrica | Por quê |
|---------|---------|
| Conversas iniciadas | Volume de demanda |
| Taxa de qualificação (chegaram ao fim do fluxo) | Eficácia do fluxo |
| Tempo até primeira resposta humana | Qualidade do atendimento |
| Conversas → agendamento → contrato | Conversão real |
| Origem (campanha/canal) | Quais investimentos trazem clientes |

---

## 8. Resumo executivo

| Fase | Ação | Quando |
|------|------|--------|
| 0 | Protótipo atual (site → WhatsApp) | ✅ pronto |
| 1 | WhatsApp Business + respostas automáticas | imediato |
| 2 | Plataforma no-code + CRM (Opção B) | quando o volume crescer |
| 3 | Cloud API + IA/automação sob medida (Opção C) | médio/longo prazo |
