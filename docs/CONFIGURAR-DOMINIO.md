# Como configurar um domínio próprio (GitHub Pages)

Guia para apontar um domínio (ex.: `ribeiroematar.adv.br` ou `ribeiroematar.com.br`)
para este site, que hoje está em:
`https://rafalimaribeiro-create.github.io/ribeiroemattaradvogados/`

> Tempo estimado: ~15 min de configuração + de minutos a algumas horas para o DNS propagar.

---

## 0. Antes de começar — escolher e registrar o domínio

- **`.com.br`** — registro no **[Registro.br](https://registro.br)**. Qualquer pessoa/empresa (com CNPJ ou CPF) pode registrar.
- **`.adv.br`** — também no Registro.br, **mas é restrito a advogados/sociedades de advogados**: exige número de inscrição na **OAB** para validar. Vale a credibilidade.
- Outras opções: `.com`, `.adv`, etc. (em registradores como GoDaddy, Hostinger, Cloudflare).

Decida: vai usar **com www** (`www.seudominio`) ou **sem www** (apex/raiz `seudominio`)? O ideal é configurar os dois (um redireciona para o outro).

---

## 1. Apontar o DNS para o GitHub Pages

No painel de DNS do seu registrador (no Registro.br: **Painel → seu domínio → DNS / Editar zona**), crie os registros abaixo.

### A) Domínio raiz / apex (ex.: `ribeiroematar.adv.br`)
Crie **4 registros do tipo `A`** apontando para os IPs do GitHub Pages:

```
A   @   185.199.108.153
A   @   185.199.109.153
A   @   185.199.110.153
A   @   185.199.111.153
```

(Opcional, recomendado) **4 registros `AAAA`** (IPv6):
```
AAAA   @   2606:50c0:8000::153
AAAA   @   2606:50c0:8001::153
AAAA   @   2606:50c0:8002::153
AAAA   @   2606:50c0:8003::153
```

### B) Subdomínio www (ex.: `www.ribeiroematar.adv.br`)
Crie **1 registro `CNAME`**:
```
CNAME   www   rafalimaribeiro-create.github.io.
```
> Atenção: o valor é o domínio `usuario.github.io` (o seu usuário do GitHub), **com o ponto final** se o painel exigir. Não é o nome do repositório.

> 💡 No Registro.br o campo "@" às vezes aparece como o próprio nome do domínio ou em branco — é o domínio raiz.

---

## 2. Cadastrar o domínio no GitHub

1. Acesse: `https://github.com/rafalimaribeiro-create/ribeiroemattaradvogados/settings/pages`
2. Em **"Custom domain"**, digite o domínio (ex.: `ribeiroematar.adv.br`) e clique em **Save**.
   - Isso cria automaticamente um arquivo **`CNAME`** na raiz do repositório (não precisa criar à mão).
3. Aguarde o GitHub validar o DNS (aparece "DNS check successful").
4. Marque **"Enforce HTTPS"** assim que ficar disponível (pode levar alguns minutos/horas para o certificado ser emitido).

> Se usar o apex (`seudominio`) como principal, o GitHub redireciona `www` para ele automaticamente (e vice-versa), desde que os dois registros existam.

---

## 3. Ajustes no site (eu faço em 1 minuto)

Depois que o domínio estiver ativo, é só me avisar que eu atualizo:
- **`js/config.js` → `siteUrl`**: troco para `https://seudominio` (assim o **QR Code** passa a apontar para o domínio novo).
- Reviso textos/links que citem o endereço antigo.

---

## 4. Conferência final
- [ ] `https://seudominio` abre o site
- [ ] `https://www.seudominio` também abre (ou redireciona)
- [ ] Cadeado de HTTPS ativo ("Enforce HTTPS" marcado)
- [ ] QR Code do site aponta para o domínio novo

---

## Resumo do que levar amanhã
1. Domínio **registrado** (Registro.br para `.br`; OAB em mãos se for `.adv.br`).
2. Acesso ao **painel de DNS** do registrador.
3. Acesso ao **GitHub** (Settings → Pages).
4. Criar os registros **A (4) + AAAA (4) + CNAME www**, salvar o domínio no GitHub e marcar HTTPS.
5. Me avisar o domínio para eu atualizar o `siteUrl`/QR.
