# Avia — Saiba antes. Vá com confiança.

Plataforma web colaborativa que mostra a **acessibilidade real** de estabelecimentos antes da visita, separada por necessidade — mobilidade, visual, auditiva, sensorial e idosos. Sem nota única, sem login, sem diagnóstico.

> ⚠️ **Este é um MVP com dados demonstrativos.** Os locais, avaliações e rotas são fictícios e não representam avaliações reais.

---

## Pré-requisitos

- [Node.js](https://nodejs.org/) **v18 LTS** ou superior
- npm (incluído com o Node.js)

## Instalação e execução local

```bash
# Clone ou copie o projeto
cd avia

# Instale as dependências
npm install

# Inicie o servidor
npm start
```

O servidor estará disponível em **http://localhost:3000**.

Na primeira execução, o banco SQLite (`avia.db`) é criado automaticamente com as tabelas e os dados demonstrativos.

### Modo de desenvolvimento

```bash
npm run dev
```

Usa `node --watch` para reiniciar automaticamente quando arquivos são alterados (Node.js ≥ 18.11).

---

## Estrutura do projeto

```
avia/
├── server.js              # Express: estáticos + API JSON
├── db.js                  # Schema SQLite + seed de dados (better-sqlite3)
├── package.json
├── README.md
└── public/
    ├── index.html          # SPA (single-page, roteamento por hash)
    ├── css/
    │   └── styles.css      # Design system completo
    ├── js/
    │   ├── app.js          # Router, estado, renderização das 6 telas
    │   └── api.js          # Fetch helpers para /api/*
    └── assets/
        └── logo.svg        # Logotipo Avia
```

---

## Telas

| # | Tela | Rota (hash) | Descrição |
|---|------|-------------|-----------|
| 1 | Início e busca | `#/` | Logo, slogan, busca por texto, atalhos de categoria, preferências ativas |
| 2 | Preferências | `#/preferences` | Chips selecionáveis por necessidade, salvas no localStorage |
| 3 | Resultados | `#/results?q=&category=` | Cards com contadores filtrados pelas preferências |
| 4 | Detalhes do local | `#/place/:id` | Recursos por necessidade, barreiras, avaliações, botões de ação |
| 5 | Avaliação | `#/place/:id/review` | Formulário: data, status por necessidade, comentário |
| 6 | Planejar rota | `#/route?to=:id` | Trajeto demonstrativo com passos e mapa esquemático SVG |

---

## API

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/api/places` | Lista locais. Query: `q`, `category`, `needs` (CSV) |
| `GET` | `/api/places/:id` | Detalhe com itens de acessibilidade e avaliações |
| `POST` | `/api/places/:id/reviews` | Cria avaliação (valida campos, sanitiza) |
| `GET` | `/api/route?from=&to=` | Rota demonstrativa mock |

### Exemplo: criar avaliação

```bash
curl -X POST http://localhost:3000/api/places/1/reviews \
  -H "Content-Type: application/json" \
  -d '{
    "visit_date": "2025-11-01",
    "comment": "Rampas em bom estado.",
    "items": [
      { "need": "mobility", "status": "available" },
      { "need": "visual", "status": "barrier" }
    ]
  }'
```

---

## Dados demonstrativos

6 locais fictícios em **Fortaleza/CE**, cada um com 8–12 itens de acessibilidade e 2–4 avaliações:

| Local | Categoria | Bairro |
|-------|-----------|--------|
| Shopping Horizonte Mar | Shopping | Aldeota |
| Arena Dunas do Ceará | Estádio | Castelão |
| Café Brisa Serrana | Restaurante | Meireles |
| Parque dos Cajueiros | Parque | Cocó |
| Hospital Vida Plena | Hospital | Centro |
| Livraria Página Viva | Cultura | Benfica |

---

## Deploy no Render

### Configuração

1. Crie um **Web Service** no [Render](https://render.com)
2. Conecte o repositório Git

| Campo | Valor |
|-------|-------|
| **Runtime** | Node |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |
| **Environment Variable** | `PORT` = (o Render define automaticamente) |

### ⚠️ Limitação do disco efêmero

O plano gratuito do Render usa **disco efêmero**: o arquivo `avia.db` é recriado a cada reinício do serviço. Isso significa que:

- **Avaliações enviadas pelos usuários são perdidas** quando o serviço reinicia ou faz redeploy.
- O banco sempre volta ao estado inicial com os dados demonstrativos (seed).
- Isso é **aceitável para uma demo**. O seed automático garante que a aplicação funciona imediatamente após cada reinício.

**Para persistência real**, migre para PostgreSQL (Render Managed Database ou outro serviço).

---

## Acessibilidade (WCAG 2.2 AA)

- `lang="pt-BR"` no `<html>`
- Skip link para conteúdo principal
- Navegação por teclado com foco visível (`outline: 3px solid #F4A640`)
- `aria-live="polite"` para atualizações dinâmicas
- Estados sempre com **ícone + texto + cor** (nunca cor sozinha)
- Alvos de toque ≥ 44×44 px
- Contraste ≥ 4.5:1 em todas as combinações
- `@media (prefers-reduced-motion)` respeitado

---

## Princípios do produto

1. **Sem nota única** — acessibilidade separada por necessidade, sem estrelas gerais
2. **Três estados** — Disponível, Barreira, Não verificado
3. **Origem da informação** — "Verificado" (com data) vs. "Relato da comunidade"
4. **Sem conta e sem diagnóstico** — preferências apenas no localStorage
5. **Dados demonstrativos** — aviso fixo e visível em todas as telas

---

## Stack

- **Frontend:** HTML, CSS, JavaScript puro (ES modules), sem frameworks
- **Backend:** Node.js + Express
- **Banco:** SQLite via `better-sqlite3`
- **Fontes:** Sora + Atkinson Hyperlegible (Google Fonts)
- **Ícones:** SVG inline
- **Zero dependências externas em runtime** (exceto Google Fonts CDN)

---

## Licença

Este projeto é um MVP demonstrativo.
