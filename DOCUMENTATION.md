# Gestão de Conferências — Centro "O Novo Sol"

Aplicação web para gerenciar inscrições das conferências da Escola Espiritual da
Rosacruz Áurea — Centro "O Novo Sol". O público se inscreve / cancela enquanto
houver uma conferência aberta; gestores administram conferências, inscritos,
relatórios e dashboards.

Produção: <https://controle-conferencia.vercel.app>

---

## 1. Stack

- **Next.js 15** (App Router, React 19, Server Components + Server Actions)
- **TypeScript**
- **Tailwind CSS** (paleta `bone`/`ink`/`clay`/`saffron`/`rule`)
- **Postgres** gerenciado (Neon, região `sa-east-1`) — provisionado via Vercel
- **Drizzle ORM** + `drizzle-kit` (migrations versionadas em `drizzle/`)
- **Zod** para validação de payload
- **bcryptjs** + **jose** (JWT em cookie httpOnly) para autenticação admin
- **exceljs** — export XLSX
- **docx** — relatórios DOCX por prédio
- **recharts** — gráficos do dashboard
- **Vitest** — testes unitários

Hospedagem: Vercel (deploy automático em push para `main`).

---

## 2. Arquitetura

```
src/
├── app/
│   ├── page.tsx                    Área pública (PainelVagas + FormulárioInscricao)
│   ├── cancelamento/page.tsx       Cancelamento por nome
│   ├── inscricao/[codigo]/imprimir Comprovante para impressão
│   ├── login/                      Login admin
│   └── admin/
│       ├── layout.tsx              AdminNav + guard de sessão
│       ├── conferencias/           Abrir / fechar / histórico
│       ├── inscricoes/             Lista + edição + Excel
│       │   └── exportar/route.ts   GET .xlsx (exceljs)
│       ├── dashboards/             KPIs + gráficos
│       └── relatorios/
│           ├── page.tsx            Botões por prédio
│           └── [predio]/route.ts   GET .docx (alocação de camas)
│
├── components/
│   ├── admin/                      AdminNav, ConferenciaForm, ListaInscricoes,
│   │   │                           LinhaInscricao, EditarInscricaoDialog,
│   │   │                           HistoricoConferencias, dashboards/*
│   │   └── dashboards/             ResumoGeral, PorGenero, PorDiscipulado,
│   │                               PorEstado, ContagemRefeicoes
│   └── public/                     FormularioInscricao, FormularioCancelamento,
│                                   PainelVagas, BotaoImprimir, Hero
│
├── server/actions/                 Server Actions (use server)
│   ├── auth.ts                     loginAction, logoutAction
│   ├── conferencia.ts              abrirConferenciaAction, fecharConferenciaAction
│   ├── inscricao.ts                criarInscricaoAction, buscarInscricaoPorNome,
│   │                               cancelarInscricaoPublicaAction
│   └── admin-inscricao.ts          editarInscricaoAction, cancelarInscricaoAdminAction
│
├── lib/
│   ├── db/
│   │   ├── schema.ts               Tabelas, enums, tipos Drizzle
│   │   └── client.ts               Singleton lazy do drizzle/postgres-js
│   ├── auth.ts                     parseAdminUsers, verificarCredenciais,
│   │                               criarSessao, getSessao (JWT)
│   ├── constants.ts                PREDIOS, MESES, ESTADOS, DISCIPULADOS, GENEROS…
│   ├── conferencias.ts             validarAberturaConferencia, formatarNomeConferencia
│   ├── inscricoes.ts               Schema Zod + formatarWhatsapp + validarPayload
│   ├── refeicoes.ts                Regras: quais refeições são válidas por chegada
│   ├── nome.ts                     normalizarNome (chave funcional case-insensitive)
│   ├── codigo-inscricao.ts         Gerador de códigos PREFIXO-AAAA-NNN
│   ├── vagas.ts                    calcularVagas (combina principal + extra)
│   ├── relatorio.ts                alocarCamas, generoDoPredio, nomeArquivoRelatorio
│   └── rate-limit.ts               Limiter em memória (inscrições por IP)
│
├── scripts/                        Scripts one-shot rodados com tsx
└── drizzle/                        Migrations SQL + meta journal
```

---

## 3. Modelo de dados (Postgres)

### `conferencias`
| coluna | tipo | descrição |
|---|---|---|
| `id` | serial PK | |
| `mes` / `ano` | int | composite unique `(mes, ano)` |
| `nome` | text | "Abril 2026" |
| `inscricoes_abertura` / `inscricoes_fim` | timestamptz | janela pública |
| `status` | enum `aberta` \| `fechada` | unique parcial garante **só uma `aberta`** por vez |
| `predio_feminino` | enum `novo` \| `antigo` | prédio principal feminino |
| `predio_masculino` | enum `novo` \| `antigo` | prédio principal masculino |
| `extra_feminino` | bool | usa o Prédio Extra (2 camas baixo) para o feminino |
| `extra_masculino` | bool | idem masculino (apenas um gênero pode usar) |
| `criado_em` / `criado_por` | | auditoria |

### `inscricoes`
| coluna | tipo | descrição |
|---|---|---|
| `id` | serial PK | |
| `codigo` | text unique | "ABR2026-001" |
| `conferencia_id` | FK | `ON DELETE RESTRICT` |
| `nome` / `nome_normalizado` | text | unique `(conferencia_id, nome_normalizado)` |
| `genero` | enum `Masculino` \| `Feminino` | |
| `cidade`, `estado`, `discipulado` | text | |
| `alojamento` | bool | |
| `tipo_cama` | enum `baixo` \| `cima` \| null | |
| `data_chegada` | enum `sabado_manha` \| `sabado_tarde` \| null | |
| `almoco_sabado`, `jantar_sabado`, `lanche_domingo`, `cafe_domingo` | bool | café é automático para alojados |
| `whatsapp` | text | formato `(xx) xxxxx-xxxx` |
| `status` | enum `ativo` \| `cancelado` | hoje cancelar **deleta a linha** (hard-delete) — o enum permanece para evolução |
| `criado_em`, `cancelado_em`, `cancelado_por`, `alterado_em`, `alterado_por` | | auditoria |

Índice secundário: `(conferencia_id, status)`.

### Migrations aplicadas
- `0000_*` — schema inicial
- `0001_*` — assignments por prédio (`predio_feminino`, `predio_masculino`)
- `0002_*` — `extra_feminino`, `extra_masculino`
- `0003_rename_email_to_whatsapp` — coluna `email` → `whatsapp`

---

## 4. Domínio

### Prédios (`src/lib/constants.ts`)

| key | label | baixo | cima | quartos | obs |
|---|---|---|---|---|---|
| `novo` | Prédio novo | 24 | 24 | 4 (6 camas/quarto) | |
| `antigo` | Prédio antigo | 25 | 25 | 1 quartão | |
| `extra` | Prédio extra | 2 | 0 | 1 | overflow para `baixo` |

### Atribuição por conferência

Cada conferência fixa: **um prédio principal por gênero** (novo ou antigo, distintos)
e opcionalmente atribui o **Prédio Extra** a **um único gênero** (decisão na abertura,
imutável em seguida).

### Cálculo de vagas (`lib/vagas.ts`)

`calcularVagas(inscricoes, conf)` soma a capacidade do principal + (se aplicável) do
extra para o gênero atribuído, e desconta cada inscrição ativa que tem `alojamento`
+ `tipoCama` definido. O `PainelVagas` (público) e o Dashboard usam isso.

### Alocação de camas no relatório DOCX (`lib/relatorio.ts`)

Para cada gênero, `alocarCamas` ordena as inscrições elegíveis por `criado_em` e
preenche **primeiro o prédio principal**:

- `cima` → sempre vai pro principal (extra não tem camas de cima).
- `baixo` → primeiro lota o principal; o overflow (até 2 pessoas) entra no extra.

A numeração de quarto/cama segue `camasPorQuarto` do prédio.

### Refeições (`lib/refeicoes.ts`)

- Café de domingo é incluído automaticamente para alojados.
- Chegada `sabado_tarde` desabilita almoço de sábado.
- Para não alojados, todas as refeições são opcionais (vide regras no módulo).

---

## 5. Server Actions e fluxos críticos

### Inscrição pública (`criarInscricaoAction`)

1. Honeypot anti-bot (`website`).
2. Rate limit por IP (`limiterInscricao`).
3. Validação Zod + normalização do WhatsApp para `(xx) xxxxx-xxxx`.
4. Tudo dentro de `db.transaction`:
   - `SELECT ... FOR UPDATE` na conferência aberta (lock).
   - Recalcula vagas; rejeita se o tipo de cama solicitado se esgotou.
   - Verifica duplicidade de nome (case-insensitive, ativo).
   - Conta inscrições e gera código sequencial (`PREFIXO-AAAA-NNN`).
   - Insere a linha.
5. `redirect` para `/inscricao/[codigo]/imprimir`.

### Cancelamento (público e admin)
Hoje ambos fazem **hard-delete** da linha (`db.delete(...)`). O enum `status`
permanece para o caso de querermos reativar soft-delete.

### Edição admin (`editarInscricaoAction`)
Reaplica `validarPayloadInscricao`, atualiza tudo + `alterado_em`/`alterado_por`,
revalida `/admin/inscricoes` e `/`.

### Conferências (`abrirConferenciaAction`, `fecharConferenciaAction`)
- Abertura valida mês válido, datas coerentes, ausência de conferência aberta
  e prédios principais distintos. Garante que `extra` esteja em no máximo um gênero.
- Fechamento muda `status` para `fechada` (atomicamente, condicionado a estar `aberta`).

---

## 6. Autenticação admin

- Logins e hashes bcrypt em `process.env.ADMIN_USERS`, formato:
  `login1:$2a$10$hash1,login2:$2a$10$hash2,...`
- Sessão JWT (HS256, 12h) em cookie httpOnly `novosol_session`, segredo em
  `SESSION_SECRET`.
- O `layout.tsx` de `/admin` chama `getSessao()` e redireciona para `/login`
  se ausente.

> **Atenção em dev local**: o parser de `.env.local` do Next (`@next/env` +
> `dotenv-expand`) interpreta `$` como variável mesmo dentro de aspas simples,
> truncando hashes bcrypt (ex.: `$2a$10$xxx` vira string vazia). Para
> contornar, escape cada `$` com `\$` na linha do `ADMIN_USERS` no
> `.env.local`. O script `scripts/escape-env.mjs` faz isso de forma idempotente.
> Em produção (variáveis vindas do painel da Vercel) o problema não ocorre.

---

## 7. Relatórios e exportações

| Saída | Rota | Lib | Conteúdo |
|---|---|---|---|
| Inscrições XLSX | `GET /admin/inscricoes/exportar?conferenciaId=X` | `exceljs` | Todas as colunas relevantes; datas tipadas |
| Distribuição de camas DOCX | `GET /admin/relatorios/[predio]` | `docx` | Tabela Nome / Quarto / Tipo / Nº cama, ordenada por quarto |

O botão do Prédio Extra só aparece em `/admin/relatorios` quando algum gênero
o utiliza naquela conferência.

---

## 8. Dashboards

`/admin/dashboards` agrega da conferência selecionada (default = aberta):

- KPIs: total de inscritos, alojados, não alojados.
- **Ocupação por alojamento** (BarChart) — barras `Feminino · baixo`, `Feminino · cima`,
  `Masculino · baixo`, `Masculino · cima`, com segmentos *ocupado* (clay) +
  *livre* (saffron). Os valores combinam principal + extra.
- Gráficos: por gênero (pizza), por discipulado (barras), por estado (top 12),
  contagem de refeições.

---

## 9. Configuração e secrets

`.env.local` (não comitado):

```
DATABASE_URL="postgresql://...neondb..."
DATABASE_URL_UNPOOLED="postgresql://..."     # opcional
ADMIN_USERS='login1:\$2a\$10\$hash1,login2:\$2a\$10\$hash2,...'
SESSION_SECRET="random-256-bits"
```

Em produção, todas as envs ficam no painel da Vercel (sem necessidade de
escapar `$`).

---

## 10. Como rodar localmente

```bash
npm install
npm run db:push        # sincroniza schema com o DATABASE_URL
npm run dev            # http://localhost:3000
```

Outros scripts:

```bash
npm run build          # build de produção
npm run lint
npm test               # vitest
npm run db:generate    # cria nova migration a partir de schema.ts
npm run db:studio      # Drizzle Studio (UI)
npm run db:seed        # seed de exemplo (scripts/seed.ts)
```

### Scripts auxiliares (`scripts/*.ts`, executados com `tsx`)

- `apply-migration-0002.ts` — adiciona `extra_feminino`/`extra_masculino` (idempotente).
- `apply-migration-0003.ts` — renomeia `email` → `whatsapp` (idempotente).
- `wipe-db.ts` — `TRUNCATE` com `CASCADE` + `RESTART IDENTITY` (uso administrativo).
- `escape-env.mjs` — escapa `$` no `ADMIN_USERS` do `.env.local`.

---

## 11. Deploy

- **Push em `main` → deploy automático em produção** pela integração GitHub × Vercel.
- Manual: `vercel --prod` (CLI).
- Migrations não rodam automaticamente no deploy. Para schema novo: aplicar
  via `npm run db:push` (responder *rename* quando for o caso) **ou** rodar o
  script `apply-migration-NNNN.ts` correspondente apontando o `.env.local` para o
  `DATABASE_URL` de produção.

---

## 12. Limitações conhecidas / próximos passos

- **Hard-delete em cancelamentos**: perde-se rastro histórico. O enum `status`
  permanece para reativar soft-delete se necessário.
- **Rate limit em memória**: não compartilhado entre instâncias. Em volume,
  mover para Upstash/Redis.
- **Sem testes E2E**: cobertura é unitária (lib/). Considerar Playwright
  para os fluxos públicos.
- **Login**: senhas bcrypt em env var. Apropriado para o número atual de
  gestores; trocar por IdP se a base crescer.
- **Sem job de migration no CI**: aplicar migrations é manual.
