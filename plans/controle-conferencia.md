# Controle de Conferências "O Novo Sol" — Plano de Implementação

> **Para executores:** Use `superpowers:subagent-driven-development` (recomendado) ou `superpowers:executing-plans`. Cada fase tem checkpoint obrigatório de aprovação humana antes da próxima começar.

**Goal:** Construir aplicação Next.js (App Router) deployada no Vercel para gerir inscrições mensais de até 100 alunos no centro de conferências "O Novo Sol", substituindo a versão Streamlit atual.

**Architecture:** Next.js 16 App Router (RSC + Server Actions) + Neon Postgres (Drizzle ORM) + Auth via JWT/cookie com 5 logins em env vars + Tailwind/shadcn/ui + Recharts + Vercel Cron para fechamento automático.

**Tech Stack:** Next.js 16, TypeScript, Tailwind CSS, shadcn/ui, Drizzle ORM, `postgres` driver, Neon (via Vercel Marketplace), `jose` (JWT), `bcryptjs`, `zod`, Vitest, Recharts, Fraunces + DM Sans (Google Fonts).

**Aesthetic direction:** Editorial contemplativo / luz da manhã. Bone `#F5EFE6` + ink `#1A1611` + saffron `#D4A24C` + clay `#8B5E3C`. Fraunces (display) + DM Sans (body).

**Convenções globais:**
- TDD obrigatório nas regras de negócio (lib/). UI testada manualmente no preview do Vercel.
- Commits frequentes (após cada teste passar / cada componente concluído).
- Server Actions para mutações; `revalidatePath` para invalidar cache.
- Português PT-BR em toda UI; código em inglês.
- Sem comentários supérfluos. Sem abstrações prematuras.

**Ordem das fases (10) — checkpoint humano obrigatório entre cada uma:**
1. Bootstrap do projeto + Vercel + Neon
2. Schema Drizzle + migrations + seed de teste
3. Camada de regras (lib/) — TDD pesado
4. Auth (env vars + JWT cookie)
5. Layout global + tema + componentes base
6. Área pública: painel de vagas + formulário de inscrição
7. Área pública: cancelamento
8. Área restrita: gestão de conferências
9. Área restrita: lista, edição, exportação
10. Área restrita: dashboards + Vercel Cron de fechamento + deploy final

---

## File Structure (alto nível)

```
controle-conferencia/
├── plans/controle-conferencia.md    (este arquivo)
├── prompt.md
├── DOCUMENTATION.md
├── package.json
├── tsconfig.json
├── next.config.ts
├── tailwind.config.ts
├── postcss.config.mjs
├── drizzle.config.ts
├── vitest.config.ts
├── .env.local                        (gitignore)
├── .env.example
├── vercel.json                       (cron)
├── components.json                   (shadcn)
├── public/
│   └── grain.png
├── src/
│   ├── app/
│   │   ├── layout.tsx                (fonts, tema, html lang=pt-BR)
│   │   ├── globals.css
│   │   ├── page.tsx                  (área pública — inscrição)
│   │   ├── cancelamento/page.tsx
│   │   ├── inscricao/[codigo]/imprimir/page.tsx
│   │   ├── login/page.tsx
│   │   ├── admin/
│   │   │   ├── layout.tsx            (guard de auth + nav)
│   │   │   ├── page.tsx              (redirect → /admin/conferencias)
│   │   │   ├── conferencias/page.tsx
│   │   │   ├── inscricoes/page.tsx
│   │   │   └── dashboards/page.tsx
│   │   └── api/
│   │       └── cron/fechar-conferencias/route.ts
│   ├── components/
│   │   ├── ui/                       (shadcn)
│   │   ├── public/
│   │   │   ├── PainelVagas.tsx
│   │   │   ├── FormularioInscricao.tsx
│   │   │   ├── ConfirmacaoInscricao.tsx
│   │   │   └── FormularioCancelamento.tsx
│   │   └── admin/
│   │       ├── AdminNav.tsx
│   │       ├── ConferenciaForm.tsx
│   │       ├── ListaInscricoes.tsx
│   │       ├── EditarInscricaoDialog.tsx
│   │       └── dashboards/
│   │           ├── ResumoGeral.tsx
│   │           ├── PorGenero.tsx
│   │           ├── PorDiscipulado.tsx
│   │           ├── PorEstado.tsx
│   │           └── ContagemRefeicoes.tsx
│   ├── lib/
│   │   ├── db/
│   │   │   ├── client.ts             (drizzle + postgres-js)
│   │   │   └── schema.ts
│   │   ├── conferencias.ts           (regras de ciclo de vida)
│   │   ├── inscricoes.ts             (regras de inscrição/cancelamento)
│   │   ├── vagas.ts                  (cálculo de contadores)
│   │   ├── codigo-inscricao.ts       (geração MAR2025-001)
│   │   ├── nome.ts                   (normalização)
│   │   ├── refeicoes.ts              (validação cruzada)
│   │   ├── auth.ts                   (JWT + bcrypt + sessão)
│   │   ├── rate-limit.ts             (honeypot + IP rate limit)
│   │   ├── exportar.ts               (CSV/Excel)
│   │   └── constants.ts              (capacidades, estados, meses, discipulados)
│   └── server/
│       └── actions/
│           ├── inscricao.ts          (criar, cancelar)
│           ├── conferencia.ts        (abrir, fechar)
│           ├── admin-inscricao.ts    (editar, cancelar pelo gestor)
│           └── auth.ts               (login, logout)
├── tests/
│   └── lib/
│       ├── conferencias.test.ts
│       ├── inscricoes.test.ts
│       ├── vagas.test.ts
│       ├── codigo-inscricao.test.ts
│       ├── nome.test.ts
│       ├── refeicoes.test.ts
│       └── auth.test.ts
└── drizzle/
    └── 0000_initial.sql              (gerado)
```

---

## FASE 1 — Bootstrap do projeto + Vercel + Neon

**Objetivo:** Repositório inicializado, Next.js rodando localmente, Tailwind+shadcn configurados, Neon Postgres provisionado via Vercel Marketplace, conexão validada, Vitest configurado.

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `tailwind.config.ts`, `postcss.config.mjs`, `vitest.config.ts`, `drizzle.config.ts`, `components.json`, `.env.example`, `.gitignore`, `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`, `src/lib/db/client.ts`, `tests/smoke.test.ts`, `vercel.json` (vazio por agora)

### Tarefas

- [ ] **1.1 Inicializar git + estrutura mínima**

```bash
cd /d/jose_americo/controle-conferencia
git init
echo "node_modules/
.next/
.env.local
.env*.local
.vercel/
dist/
coverage/
*.log
.DS_Store" > .gitignore
git add .gitignore prompt.md DOCUMENTATION.md plans/
git commit -m "chore: init repo with prompt and plan"
```

- [ ] **1.2 Criar Next.js 16 com TypeScript + Tailwind**

```bash
npx create-next-app@latest . --ts --tailwind --eslint --app --src-dir --no-import-alias --use-npm --skip-install
```

Quando perguntar sobre Turbopack: **sim**. Quando perguntar sobre customizar import alias: **não** (usar default `@/*`).

```bash
npm install
npm run dev
```

Verificar `http://localhost:3000` renderiza a página padrão. `Ctrl+C` para parar.

- [ ] **1.3 Instalar dependências do projeto**

```bash
npm install drizzle-orm postgres bcryptjs jose zod recharts
npm install -D drizzle-kit @types/bcryptjs vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom dotenv tsx
```

- [ ] **1.4 Configurar shadcn/ui**

```bash
npx shadcn@latest init
```

Escolher: **TypeScript: yes**, **Style: New York**, **Base color: Stone**, **CSS variables: yes**.

- [ ] **1.5 Adicionar fontes Fraunces + DM Sans no `src/app/layout.tsx`**

Substituir conteúdo de `src/app/layout.tsx`:

```tsx
import type { Metadata } from "next";
import { Fraunces, DM_Sans } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  axes: ["opsz", "SOFT"],
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Conferências — O Novo Sol",
  description:
    "Inscrições para as conferências mensais do centro O Novo Sol — Escola Espiritual da Rosacruz Áurea.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={`${fraunces.variable} ${dmSans.variable}`}>
      <body className="min-h-screen bg-bone text-ink antialiased">
        {children}
      </body>
    </html>
  );
}
```

- [ ] **1.6 Configurar tema editorial em `tailwind.config.ts` e `src/app/globals.css`**

`tailwind.config.ts`:

```ts
import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bone: "#F5EFE6",
        ink: "#1A1611",
        saffron: "#D4A24C",
        clay: "#8B5E3C",
        rule: "#1A161114",
      },
      fontFamily: {
        display: ["var(--font-display)", "ui-serif", "Georgia", "serif"],
        body: ["var(--font-body)", "ui-sans-serif", "system-ui"],
      },
      fontVariantNumeric: { tabular: "tabular-nums" },
    },
  },
  plugins: [],
} satisfies Config;
```

`src/app/globals.css` (acrescentar após o `@tailwind`):

```css
@layer base {
  body { font-family: var(--font-body); font-feature-settings: "ss01", "cv11"; }
  h1, h2, h3, h4 { font-family: var(--font-display); font-weight: 500; letter-spacing: -0.01em; }
  .display-italic { font-family: var(--font-display); font-style: italic; }
  .num { font-variant-numeric: tabular-nums; }
  hr { border: none; border-top: 1px solid theme(colors.rule); }
}

@layer utilities {
  .grain {
    background-image: url("/grain.png");
    background-size: 240px 240px;
    background-repeat: repeat;
    opacity: 0.04;
    pointer-events: none;
  }
}
```

- [ ] **1.7 Criar página inicial provisória `src/app/page.tsx`**

```tsx
export default function Home() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-24">
      <p className="text-xs uppercase tracking-[0.2em] text-clay">
        Escola Espiritual da Rosacruz Áurea
      </p>
      <h1 className="mt-4 font-display text-5xl leading-tight">
        Conferências{" "}
        <span className="display-italic text-saffron">O Novo Sol</span>
      </h1>
      <hr className="my-8" />
      <p className="text-ink/70">Bootstrap concluído.</p>
    </main>
  );
}
```

- [ ] **1.8 Configurar Vitest**

`vitest.config.ts`:

```ts
import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    include: ["tests/**/*.test.ts"],
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, "src") },
  },
});
```

Adicionar a `package.json` (em `scripts`):

```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **1.9 Smoke test do Vitest**

`tests/smoke.test.ts`:

```ts
import { describe, it, expect } from "vitest";

describe("smoke", () => {
  it("vitest works", () => {
    expect(1 + 1).toBe(2);
  });
});
```

Rodar:

```bash
npm test
```

Esperado: 1 passed.

- [ ] **1.10 Provisionar Neon via Vercel Marketplace**

Comando para o usuário (mostrar instruções, não executar):

```
1. vercel login
2. vercel link  (criar projeto novo: controle-conferencia)
3. No dashboard Vercel → Storage → Marketplace → instalar Neon (free tier)
4. Conectar ao projeto controle-conferencia
5. vercel env pull .env.local
```

Verificar `.env.local` contém `DATABASE_URL=postgres://...`.

- [ ] **1.11 Criar `src/lib/db/client.ts`**

```ts
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL não configurada");

const client = postgres(url, { prepare: false });
export const db = drizzle(client);
```

- [ ] **1.12 Criar `drizzle.config.ts`**

```ts
import "dotenv/config";
import type { Config } from "drizzle-kit";

export default {
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: { url: process.env.DATABASE_URL! },
} satisfies Config;
```

- [ ] **1.13 Criar `.env.example`**

```
DATABASE_URL=postgres://user:pass@host/db
ADMIN_USERS=login1:bcrypt_hash1,login2:bcrypt_hash2
SESSION_SECRET=
CRON_SECRET=
```

- [ ] **1.14 Build local + commit**

```bash
npm run build
```

Esperado: build OK. Commit:

```bash
git add -A
git commit -m "feat: bootstrap next.js + tailwind + shadcn + drizzle + vitest"
```

### CHECKPOINT FASE 1

Aprove com **"ok fase 1"** após verificar:
- [ ] `npm run dev` abre a home com tipografia Fraunces+DM Sans, fundo bone, título com itálico saffron.
- [ ] `npm test` roda 1 teste passando.
- [ ] `npm run build` completa sem erros.
- [ ] `.env.local` contém `DATABASE_URL` válida (Neon).
- [ ] Projeto vinculado ao Vercel (`vercel link`).

---

## FASE 2 — Schema Drizzle + Migrations + Seed

**Objetivo:** Schema completo do DB, migration aplicada no Neon, seed de teste rodável.

**Files:**
- Create: `src/lib/db/schema.ts`, `src/lib/constants.ts`, `scripts/seed.ts`, `drizzle/0000_*.sql` (gerado)

### Tarefas

- [ ] **2.1 Criar `src/lib/constants.ts`**

```ts
export const CAPACIDADE = {
  feminino: { baixo: 26, cima: 24 },
  masculino: { baixo: 25, cima: 25 },
} as const;

export const MESES_CONFERENCIA = [
  { num: 2, nome: "Fevereiro", abrev: "FEV" },
  { num: 3, nome: "Março", abrev: "MAR" },
  { num: 4, nome: "Abril", abrev: "ABR" },
  { num: 5, nome: "Maio", abrev: "MAI" },
  { num: 6, nome: "Junho", abrev: "JUN" },
  { num: 8, nome: "Agosto", abrev: "AGO" },
  { num: 9, nome: "Setembro", abrev: "SET" },
  { num: 10, nome: "Outubro", abrev: "OUT" },
  { num: 11, nome: "Novembro", abrev: "NOV" },
  { num: 12, nome: "Dezembro", abrev: "DEZ" },
] as const;

export const ESTADOS_BR = [
  "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG",
  "PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO",
] as const;

export const DISCIPULADOS = [
  "1º Aspecto","2º Aspecto","3º Aspecto","4º Aspecto","Graal","Escola Interior",
] as const;

export const GENEROS = ["Masculino", "Feminino"] as const;
export const TIPOS_CAMA = ["baixo", "cima"] as const;
export const DATAS_CHEGADA = ["sabado_manha", "sabado_tarde"] as const;
export const STATUS_CONFERENCIA = ["aberta", "fechada"] as const;
export const STATUS_INSCRICAO = ["ativo", "cancelado"] as const;

export type Genero = (typeof GENEROS)[number];
export type TipoCama = (typeof TIPOS_CAMA)[number];
export type DataChegada = (typeof DATAS_CHEGADA)[number];
export type StatusConferencia = (typeof STATUS_CONFERENCIA)[number];
export type StatusInscricao = (typeof STATUS_INSCRICAO)[number];
```

- [ ] **2.2 Criar `src/lib/db/schema.ts`**

```ts
import {
  pgTable, serial, text, integer, boolean, timestamp,
  pgEnum, uniqueIndex, index,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const generoEnum = pgEnum("genero", ["Masculino", "Feminino"]);
export const tipoCamaEnum = pgEnum("tipo_cama", ["baixo", "cima"]);
export const dataChegadaEnum = pgEnum("data_chegada", ["sabado_manha", "sabado_tarde"]);
export const statusConfEnum = pgEnum("status_conferencia", ["aberta", "fechada"]);
export const statusInscEnum = pgEnum("status_inscricao", ["ativo", "cancelado"]);

export const conferencias = pgTable(
  "conferencias",
  {
    id: serial("id").primaryKey(),
    mes: integer("mes").notNull(),
    ano: integer("ano").notNull(),
    nome: text("nome").notNull(),
    inscricoesAbertura: timestamp("inscricoes_abertura", { withTimezone: true }).notNull(),
    inscricoesFim: timestamp("inscricoes_fim", { withTimezone: true }).notNull(),
    status: statusConfEnum("status").notNull().default("aberta"),
    criadoEm: timestamp("criado_em", { withTimezone: true }).notNull().defaultNow(),
    criadoPor: text("criado_por").notNull(),
  },
  (t) => ({
    mesAnoUnique: uniqueIndex("conferencias_mes_ano_uq").on(t.mes, t.ano),
    apenasUmaAberta: uniqueIndex("conferencias_uma_aberta_uq")
      .on(t.status)
      .where(sql`${t.status} = 'aberta'`),
  }),
);

export const inscricoes = pgTable(
  "inscricoes",
  {
    id: serial("id").primaryKey(),
    codigo: text("codigo").notNull().unique(),
    conferenciaId: integer("conferencia_id")
      .notNull()
      .references(() => conferencias.id, { onDelete: "restrict" }),
    nome: text("nome").notNull(),
    nomeNormalizado: text("nome_normalizado").notNull(),
    genero: generoEnum("genero").notNull(),
    cidade: text("cidade").notNull(),
    estado: text("estado").notNull(),
    discipulado: text("discipulado").notNull(),
    alojamento: boolean("alojamento").notNull(),
    tipoCama: tipoCamaEnum("tipo_cama"),
    dataChegada: dataChegadaEnum("data_chegada"),
    almocoSabado: boolean("almoco_sabado").notNull().default(false),
    jantarSabado: boolean("jantar_sabado").notNull().default(false),
    lancheDomingo: boolean("lanche_domingo").notNull().default(false),
    cafeDomingo: boolean("cafe_domingo").notNull().default(false),
    email: text("email").notNull(),
    status: statusInscEnum("status").notNull().default("ativo"),
    criadoEm: timestamp("criado_em", { withTimezone: true }).notNull().defaultNow(),
    canceladoEm: timestamp("cancelado_em", { withTimezone: true }),
    canceladoPor: text("cancelado_por"),
    alteradoEm: timestamp("alterado_em", { withTimezone: true }),
    alteradoPor: text("alterado_por"),
  },
  (t) => ({
    nomePorConfUnique: uniqueIndex("inscricoes_nome_conf_uq")
      .on(t.conferenciaId, t.nomeNormalizado),
    statusIdx: index("inscricoes_status_idx").on(t.conferenciaId, t.status),
  }),
);
```

- [ ] **2.3 Gerar migration**

```bash
npx drizzle-kit generate
```

Conferir que `drizzle/0000_*.sql` foi criado e contém `CREATE TYPE`, `CREATE TABLE conferencias`, `CREATE TABLE inscricoes`, e os dois unique indexes.

- [ ] **2.4 Aplicar migration no Neon**

```bash
npx drizzle-kit push
```

Confirmar com **yes** se pedir.

- [ ] **2.5 Criar `scripts/seed.ts` para fixture local**

```ts
import "dotenv/config";
import { db } from "../src/lib/db/client";
import { conferencias } from "../src/lib/db/schema";

async function main() {
  const [c] = await db
    .insert(conferencias)
    .values({
      mes: 5,
      ano: 2026,
      nome: "Maio 2026",
      inscricoesAbertura: new Date("2026-04-15T00:00:00-03:00"),
      inscricoesFim: new Date("2026-05-10T23:59:59-03:00"),
      status: "aberta",
      criadoPor: "seed",
    })
    .returning();
  console.log("Conferência criada:", c);
}

main().then(() => process.exit(0));
```

Adicionar a `package.json` scripts:

```json
"db:seed": "tsx scripts/seed.ts",
"db:generate": "drizzle-kit generate",
"db:push": "drizzle-kit push"
```

Rodar:

```bash
npm run db:seed
```

Esperado: log "Conferência criada: { id: 1, ... }". Se rodar 2x, vai falhar pelo unique — comportamento correto.

- [ ] **2.6 Verificar no DB (psql opcional ou Drizzle Studio)**

```bash
npx drizzle-kit studio
```

Abrir `https://local.drizzle.studio`, conferir as 2 tabelas.

- [ ] **2.7 Commit**

```bash
git add -A
git commit -m "feat: drizzle schema + migration + seed"
```

### CHECKPOINT FASE 2

Aprove com **"ok fase 2"** após:
- [ ] `npm run db:push` aplicou migration no Neon.
- [ ] `npm run db:seed` criou conferência id=1 "Maio 2026".
- [ ] Drizzle Studio mostra as 2 tabelas e a row de seed.

---

## FASE 3 — Camada de regras (lib/) com TDD

**Objetivo:** Toda lógica de negócio testada em isolamento. Esta fase é a mais importante — Server Actions e UI vão se apoiar nestas funções puras.

**Files:**
- Create: `src/lib/nome.ts`, `src/lib/codigo-inscricao.ts`, `src/lib/refeicoes.ts`, `src/lib/vagas.ts`, `src/lib/conferencias.ts`, `src/lib/inscricoes.ts`
- Create: `tests/lib/nome.test.ts`, `tests/lib/codigo-inscricao.test.ts`, `tests/lib/refeicoes.test.ts`, `tests/lib/vagas.test.ts`, `tests/lib/conferencias.test.ts`, `tests/lib/inscricoes.test.ts`

### Tarefas

- [ ] **3.1 Test: normalização de nome**

`tests/lib/nome.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { normalizarNome } from "@/lib/nome";

describe("normalizarNome", () => {
  it("trim + colapsa espaços + lowercase + sem acentos", () => {
    expect(normalizarNome("  José   da Silva  ")).toBe("jose da silva");
  });
  it("trata diferentes capitalizações como o mesmo nome", () => {
    expect(normalizarNome("MARIA DAS DORES")).toBe(normalizarNome("maria das dores"));
  });
  it("remove acentos compostos", () => {
    expect(normalizarNome("João D'Ávila")).toBe("joao d'avila");
  });
});
```

Rodar:

```bash
npm test -- nome
```

Esperado: FAIL ("Cannot find module '@/lib/nome'").

- [ ] **3.2 Implementar `src/lib/nome.ts`**

```ts
export function normalizarNome(nome: string): string {
  return nome
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}
```

Rodar `npm test -- nome`. Esperado: 3 passed.

- [ ] **3.3 Test: geração de código de inscrição**

`tests/lib/codigo-inscricao.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { gerarCodigoInscricao } from "@/lib/codigo-inscricao";

describe("gerarCodigoInscricao", () => {
  it("formata MES+ANO-NNN com zero-padding", () => {
    expect(gerarCodigoInscricao({ mes: 3, ano: 2025, sequencial: 1 }))
      .toBe("MAR2025-001");
    expect(gerarCodigoInscricao({ mes: 3, ano: 2025, sequencial: 42 }))
      .toBe("MAR2025-042");
    expect(gerarCodigoInscricao({ mes: 11, ano: 2026, sequencial: 100 }))
      .toBe("NOV2026-100");
  });
  it("rejeita meses inválidos (jan, jul)", () => {
    expect(() => gerarCodigoInscricao({ mes: 1, ano: 2025, sequencial: 1 }))
      .toThrow();
    expect(() => gerarCodigoInscricao({ mes: 7, ano: 2025, sequencial: 1 }))
      .toThrow();
  });
});
```

- [ ] **3.4 Implementar `src/lib/codigo-inscricao.ts`**

```ts
import { MESES_CONFERENCIA } from "./constants";

export function gerarCodigoInscricao(params: {
  mes: number;
  ano: number;
  sequencial: number;
}): string {
  const m = MESES_CONFERENCIA.find((x) => x.num === params.mes);
  if (!m) throw new Error(`Mês inválido para conferência: ${params.mes}`);
  const seq = String(params.sequencial).padStart(3, "0");
  return `${m.abrev}${params.ano}-${seq}`;
}
```

Rodar `npm test -- codigo-inscricao`. Esperado: 2 passed.

- [ ] **3.5 Test: validação cruzada de refeições**

`tests/lib/refeicoes.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { refeicoesPermitidas, validarRefeicoes } from "@/lib/refeicoes";

describe("refeicoesPermitidas", () => {
  it("sábado manhã + alojado: tudo + café domingo automático", () => {
    expect(refeicoesPermitidas({ alojamento: true, dataChegada: "sabado_manha" }))
      .toEqual({
        almocoSabado: true, jantarSabado: true,
        lancheDomingo: true, cafeDomingo: "auto",
      });
  });
  it("sábado tarde + alojado: sem almoço, café domingo automático", () => {
    expect(refeicoesPermitidas({ alojamento: true, dataChegada: "sabado_tarde" }))
      .toEqual({
        almocoSabado: false, jantarSabado: true,
        lancheDomingo: true, cafeDomingo: "auto",
      });
  });
  it("não alojado: sem café domingo, refeições livres", () => {
    expect(refeicoesPermitidas({ alojamento: false }))
      .toEqual({
        almocoSabado: true, jantarSabado: true,
        lancheDomingo: true, cafeDomingo: false,
      });
  });
});

describe("validarRefeicoes", () => {
  it("rejeita almoço sábado se chegada é sábado tarde", () => {
    const r = validarRefeicoes({
      alojamento: true, dataChegada: "sabado_tarde",
      almocoSabado: true, jantarSabado: false, lancheDomingo: false,
    });
    expect(r.ok).toBe(false);
  });
  it("força café domingo=true para alojado", () => {
    const r = validarRefeicoes({
      alojamento: true, dataChegada: "sabado_manha",
      almocoSabado: false, jantarSabado: false, lancheDomingo: false,
    });
    expect(r.ok).toBe(true);
    expect(r.value.cafeDomingo).toBe(true);
  });
  it("força café domingo=false para não alojado", () => {
    const r = validarRefeicoes({
      alojamento: false,
      almocoSabado: true, jantarSabado: false, lancheDomingo: false,
    });
    expect(r.ok).toBe(true);
    expect(r.value.cafeDomingo).toBe(false);
  });
});
```

- [ ] **3.6 Implementar `src/lib/refeicoes.ts`**

```ts
import type { DataChegada } from "./constants";

type Permissao = boolean | "auto";

export function refeicoesPermitidas(args: {
  alojamento: boolean;
  dataChegada?: DataChegada;
}): {
  almocoSabado: boolean;
  jantarSabado: boolean;
  lancheDomingo: boolean;
  cafeDomingo: Permissao;
} {
  if (!args.alojamento) {
    return {
      almocoSabado: true, jantarSabado: true,
      lancheDomingo: true, cafeDomingo: false,
    };
  }
  if (args.dataChegada === "sabado_tarde") {
    return {
      almocoSabado: false, jantarSabado: true,
      lancheDomingo: true, cafeDomingo: "auto",
    };
  }
  return {
    almocoSabado: true, jantarSabado: true,
    lancheDomingo: true, cafeDomingo: "auto",
  };
}

type Resultado<T> = { ok: true; value: T } | { ok: false; erro: string };

export function validarRefeicoes(input: {
  alojamento: boolean;
  dataChegada?: DataChegada;
  almocoSabado: boolean;
  jantarSabado: boolean;
  lancheDomingo: boolean;
}): Resultado<{
  almocoSabado: boolean;
  jantarSabado: boolean;
  lancheDomingo: boolean;
  cafeDomingo: boolean;
}> {
  const p = refeicoesPermitidas(input);
  if (input.almocoSabado && p.almocoSabado === false) {
    return { ok: false, erro: "Almoço de sábado não disponível para chegada à tarde." };
  }
  return {
    ok: true,
    value: {
      almocoSabado: input.almocoSabado,
      jantarSabado: input.jantarSabado,
      lancheDomingo: input.lancheDomingo,
      cafeDomingo: p.cafeDomingo === "auto",
    },
  };
}
```

Rodar `npm test -- refeicoes`. Esperado: 6 passed.

- [ ] **3.7 Test: cálculo de vagas**

`tests/lib/vagas.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { calcularVagas } from "@/lib/vagas";

const CAP = {
  feminino: { baixo: 26, cima: 24 },
  masculino: { baixo: 25, cima: 25 },
};

describe("calcularVagas", () => {
  it("sem inscritos: tudo disponível", () => {
    expect(calcularVagas([])).toEqual({
      feminino: { baixo: 26, cima: 24 },
      masculino: { baixo: 25, cima: 25 },
      totalAlojados: 0,
    });
  });
  it("ignora cancelados", () => {
    const ins = [
      { genero: "Feminino", alojamento: true, tipoCama: "baixo", status: "cancelado" },
      { genero: "Feminino", alojamento: true, tipoCama: "baixo", status: "ativo" },
    ];
    const v = calcularVagas(ins as any);
    expect(v.feminino.baixo).toBe(25);
    expect(v.totalAlojados).toBe(1);
  });
  it("ignora não alojados", () => {
    const ins = [
      { genero: "Masculino", alojamento: false, tipoCama: null, status: "ativo" },
    ];
    expect(calcularVagas(ins as any).masculino.baixo).toBe(25);
  });
  it("decrementa por gênero e tipo", () => {
    const ins = [
      { genero: "Masculino", alojamento: true, tipoCama: "cima", status: "ativo" },
      { genero: "Masculino", alojamento: true, tipoCama: "cima", status: "ativo" },
      { genero: "Feminino", alojamento: true, tipoCama: "baixo", status: "ativo" },
    ];
    const v = calcularVagas(ins as any);
    expect(v.masculino.cima).toBe(23);
    expect(v.feminino.baixo).toBe(25);
    expect(v.totalAlojados).toBe(3);
  });
});
```

- [ ] **3.8 Implementar `src/lib/vagas.ts`**

```ts
import { CAPACIDADE } from "./constants";

export type InscricaoMin = {
  genero: "Masculino" | "Feminino";
  alojamento: boolean;
  tipoCama: "baixo" | "cima" | null;
  status: "ativo" | "cancelado";
};

export type Vagas = {
  feminino: { baixo: number; cima: number };
  masculino: { baixo: number; cima: number };
  totalAlojados: number;
};

export function calcularVagas(inscricoes: InscricaoMin[]): Vagas {
  const v: Vagas = {
    feminino: { ...CAPACIDADE.feminino },
    masculino: { ...CAPACIDADE.masculino },
    totalAlojados: 0,
  };
  for (const i of inscricoes) {
    if (i.status !== "ativo" || !i.alojamento || !i.tipoCama) continue;
    const grupo = i.genero === "Feminino" ? v.feminino : v.masculino;
    grupo[i.tipoCama] -= 1;
    v.totalAlojados += 1;
  }
  return v;
}

export function vagasEsgotadas(v: Vagas, genero: "Masculino" | "Feminino", tipo: "baixo" | "cima") {
  const g = genero === "Feminino" ? v.feminino : v.masculino;
  return g[tipo] <= 0;
}
```

Rodar `npm test -- vagas`. Esperado: 4 passed.

- [ ] **3.9 Commit incremental**

```bash
git add -A
git commit -m "feat: regras puras — nome, codigo, refeicoes, vagas"
```

- [ ] **3.10 Test: regras de conferência (estado, transições)**

`tests/lib/conferencias.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import {
  validarAberturaConferencia, deveEstarFechada, formatarNomeConferencia,
} from "@/lib/conferencias";

describe("formatarNomeConferencia", () => {
  it("formata 'Março 2025'", () => {
    expect(formatarNomeConferencia(3, 2025)).toBe("Março 2025");
  });
});

describe("validarAberturaConferencia", () => {
  it("rejeita janeiro e julho", () => {
    expect(validarAberturaConferencia({ mes: 1, ano: 2025 }).ok).toBe(false);
    expect(validarAberturaConferencia({ mes: 7, ano: 2025 }).ok).toBe(false);
  });
  it("rejeita fim antes da abertura", () => {
    const r = validarAberturaConferencia({
      mes: 3, ano: 2025,
      inscricoesAbertura: new Date("2025-03-10"),
      inscricoesFim: new Date("2025-03-05"),
    });
    expect(r.ok).toBe(false);
  });
  it("aceita mês válido + datas coerentes", () => {
    const r = validarAberturaConferencia({
      mes: 3, ano: 2025,
      inscricoesAbertura: new Date("2025-02-01"),
      inscricoesFim: new Date("2025-03-01"),
    });
    expect(r.ok).toBe(true);
  });
});

describe("deveEstarFechada", () => {
  it("true se inscricoesFim já passou", () => {
    expect(deveEstarFechada({
      inscricoesFim: new Date("2025-01-01"),
      agora: new Date("2025-02-01"),
    })).toBe(true);
  });
  it("false se ainda no prazo", () => {
    expect(deveEstarFechada({
      inscricoesFim: new Date("2025-12-31"),
      agora: new Date("2025-06-01"),
    })).toBe(false);
  });
});
```

- [ ] **3.11 Implementar `src/lib/conferencias.ts`**

```ts
import { MESES_CONFERENCIA } from "./constants";

export function formatarNomeConferencia(mes: number, ano: number): string {
  const m = MESES_CONFERENCIA.find((x) => x.num === mes);
  if (!m) throw new Error(`Mês inválido: ${mes}`);
  return `${m.nome} ${ano}`;
}

type Resultado = { ok: true } | { ok: false; erro: string };

export function validarAberturaConferencia(input: {
  mes: number;
  ano: number;
  inscricoesAbertura?: Date;
  inscricoesFim?: Date;
}): Resultado {
  if (!MESES_CONFERENCIA.some((m) => m.num === input.mes)) {
    return { ok: false, erro: "Não há conferências em janeiro nem julho." };
  }
  if (input.inscricoesAbertura && input.inscricoesFim
      && input.inscricoesFim < input.inscricoesAbertura) {
    return { ok: false, erro: "A data de fim deve ser posterior à abertura." };
  }
  return { ok: true };
}

export function deveEstarFechada(args: {
  inscricoesFim: Date;
  agora: Date;
}): boolean {
  return args.agora > args.inscricoesFim;
}
```

Rodar `npm test -- conferencias`. Esperado: 5 passed.

- [ ] **3.12 Test: regras de inscrição (validação completa do payload)**

`tests/lib/inscricoes.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { validarPayloadInscricao } from "@/lib/inscricoes";

const base = {
  nome: "Ana Silva",
  genero: "Feminino" as const,
  cidade: "Niterói",
  estado: "RJ",
  discipulado: "1º Aspecto",
  email: "ana@x.com",
};

describe("validarPayloadInscricao", () => {
  it("aceita inscrição sem alojamento", () => {
    const r = validarPayloadInscricao({
      ...base, alojamento: false,
      almocoSabado: true, jantarSabado: false, lancheDomingo: false,
    });
    expect(r.ok).toBe(true);
  });
  it("exige tipo_cama e data_chegada quando alojado", () => {
    const r = validarPayloadInscricao({
      ...base, alojamento: true,
      almocoSabado: false, jantarSabado: false, lancheDomingo: false,
    } as any);
    expect(r.ok).toBe(false);
  });
  it("rejeita estado inválido", () => {
    const r = validarPayloadInscricao({
      ...base, estado: "ZZ", alojamento: false,
      almocoSabado: false, jantarSabado: false, lancheDomingo: false,
    });
    expect(r.ok).toBe(false);
  });
  it("rejeita email vazio", () => {
    const r = validarPayloadInscricao({
      ...base, email: "", alojamento: false,
      almocoSabado: false, jantarSabado: false, lancheDomingo: false,
    });
    expect(r.ok).toBe(false);
  });
});
```

- [ ] **3.13 Implementar `src/lib/inscricoes.ts`**

```ts
import { z } from "zod";
import { ESTADOS_BR, GENEROS, DISCIPULADOS, TIPOS_CAMA, DATAS_CHEGADA } from "./constants";
import { validarRefeicoes } from "./refeicoes";

const schema = z.object({
  nome: z.string().trim().min(3, "Nome muito curto"),
  genero: z.enum(GENEROS),
  cidade: z.string().trim().min(2),
  estado: z.enum(ESTADOS_BR),
  discipulado: z.enum(DISCIPULADOS),
  alojamento: z.boolean(),
  tipoCama: z.enum(TIPOS_CAMA).optional(),
  dataChegada: z.enum(DATAS_CHEGADA).optional(),
  almocoSabado: z.boolean(),
  jantarSabado: z.boolean(),
  lancheDomingo: z.boolean(),
  email: z.string().trim().min(3),
});

type Resultado<T> = { ok: true; value: T } | { ok: false; erro: string };

export function validarPayloadInscricao(input: unknown): Resultado<z.infer<typeof schema> & { cafeDomingo: boolean }> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, erro: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }
  const v = parsed.data;
  if (v.alojamento && (!v.tipoCama || !v.dataChegada)) {
    return { ok: false, erro: "Alojamento exige tipo de cama e data de chegada." };
  }
  const ref = validarRefeicoes({
    alojamento: v.alojamento,
    dataChegada: v.dataChegada,
    almocoSabado: v.almocoSabado,
    jantarSabado: v.jantarSabado,
    lancheDomingo: v.lancheDomingo,
  });
  if (!ref.ok) return { ok: false, erro: ref.erro };
  return { ok: true, value: { ...v, ...ref.value } };
}
```

Rodar `npm test -- inscricoes`. Esperado: 4 passed.

- [ ] **3.14 Rodar suite completa**

```bash
npm test
```

Esperado: ≥ 22 testes passando (1 smoke + 3 nome + 2 codigo + 6 refeicoes + 4 vagas + 5 conferencias + 4 inscricoes — 25 totais).

- [ ] **3.15 Commit**

```bash
git add -A
git commit -m "feat: regras de conferencia e inscricao com validacao zod"
```

### CHECKPOINT FASE 3

Aprove com **"ok fase 3"** após:
- [ ] `npm test` mostra todos os testes verdes (≥25).
- [ ] Sem warnings de TypeScript em `npm run build`.

---

## FASE 4 — Auth (env vars + JWT cookie)

**Objetivo:** Login funcional para os 5 gestores, sessão via cookie HttpOnly assinado, helper `getSessao()` para Server Components.

**Files:**
- Create: `src/lib/auth.ts`, `src/server/actions/auth.ts`, `src/app/login/page.tsx`, `tests/lib/auth.test.ts`, `scripts/hash-senha.ts`

### Tarefas

- [ ] **4.1 Helper para gerar hashes (utilitário, não vai pro git)**

`scripts/hash-senha.ts`:

```ts
import bcrypt from "bcryptjs";
const senha = process.argv[2];
if (!senha) { console.error("uso: npx tsx scripts/hash-senha.ts <senha>"); process.exit(1); }
console.log(bcrypt.hashSync(senha, 10));
```

Rodar:

```bash
npx tsx scripts/hash-senha.ts admin123
```

Copiar o hash. Repetir para 5 senhas. Em `.env.local`:

```
ADMIN_USERS=admin:$2a$10$...,maria:$2a$10$...,joao:$2a$10$...,ana:$2a$10$...,carlos:$2a$10$...
SESSION_SECRET=<32+ caracteres aleatorios>
```

Gerar SESSION_SECRET:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

- [ ] **4.2 Test: parsing de ADMIN_USERS + verificação de senha**

`tests/lib/auth.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import bcrypt from "bcryptjs";
import { parseAdminUsers, verificarCredenciais } from "@/lib/auth";

const hashSenha = bcrypt.hashSync("segredo", 4);
const env = `admin:${hashSenha},maria:${hashSenha}`;

describe("parseAdminUsers", () => {
  it("parseia múltiplos usuários separados por vírgula", () => {
    const users = parseAdminUsers(env);
    expect(users).toHaveLength(2);
    expect(users[0].login).toBe("admin");
    expect(users[1].login).toBe("maria");
  });
  it("ignora entradas vazias", () => {
    expect(parseAdminUsers("")).toHaveLength(0);
  });
});

describe("verificarCredenciais", () => {
  it("aceita login+senha corretos", async () => {
    expect(await verificarCredenciais("admin", "segredo", env)).toBe(true);
  });
  it("rejeita senha errada", async () => {
    expect(await verificarCredenciais("admin", "errada", env)).toBe(false);
  });
  it("rejeita login inexistente", async () => {
    expect(await verificarCredenciais("nope", "segredo", env)).toBe(false);
  });
});
```

- [ ] **4.3 Implementar `src/lib/auth.ts`**

```ts
import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

export type AdminUser = { login: string; hash: string };
export type Sessao = { login: string };

const COOKIE = "novosol_session";
const ALG = "HS256";

export function parseAdminUsers(envValue: string): AdminUser[] {
  return envValue
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((entry) => {
      const idx = entry.indexOf(":");
      return { login: entry.slice(0, idx), hash: entry.slice(idx + 1) };
    });
}

export async function verificarCredenciais(
  login: string,
  senha: string,
  envValue = process.env.ADMIN_USERS ?? "",
): Promise<boolean> {
  const user = parseAdminUsers(envValue).find((u) => u.login === login);
  if (!user) return false;
  return bcrypt.compare(senha, user.hash);
}

function chave() {
  const s = process.env.SESSION_SECRET;
  if (!s) throw new Error("SESSION_SECRET não configurada");
  return new TextEncoder().encode(s);
}

export async function criarSessao(login: string) {
  const token = await new SignJWT({ login })
    .setProtectedHeader({ alg: ALG })
    .setIssuedAt()
    .setExpirationTime("12h")
    .sign(chave());
  (await cookies()).set(COOKIE, token, {
    httpOnly: true, sameSite: "lax", secure: true, path: "/",
    maxAge: 60 * 60 * 12,
  });
}

export async function destruirSessao() {
  (await cookies()).delete(COOKIE);
}

export async function getSessao(): Promise<Sessao | null> {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, chave());
    return { login: payload.login as string };
  } catch {
    return null;
  }
}
```

Rodar `npm test -- auth`. Esperado: 5 passed.

- [ ] **4.4 Server Action de login**

`src/server/actions/auth.ts`:

```ts
"use server";
import { redirect } from "next/navigation";
import { criarSessao, destruirSessao, verificarCredenciais } from "@/lib/auth";

export async function loginAction(_: unknown, formData: FormData) {
  const login = String(formData.get("login") ?? "").trim();
  const senha = String(formData.get("senha") ?? "");
  if (!(await verificarCredenciais(login, senha))) {
    return { erro: "Login ou senha inválidos." };
  }
  await criarSessao(login);
  redirect("/admin/conferencias");
}

export async function logoutAction() {
  await destruirSessao();
  redirect("/");
}
```

- [ ] **4.5 Página de login `src/app/login/page.tsx`**

```tsx
"use client";
import { useFormState, useFormStatus } from "react-dom";
import { loginAction } from "@/server/actions/auth";

function Botao() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full bg-ink text-bone py-3 font-display tracking-wide
                 hover:bg-clay transition-colors disabled:opacity-50"
    >
      {pending ? "Entrando…" : "Entrar"}
    </button>
  );
}

export default function LoginPage() {
  const [state, action] = useFormState(loginAction, { erro: "" });
  return (
    <main className="min-h-screen grid place-items-center px-6">
      <div className="w-full max-w-sm">
        <p className="text-xs uppercase tracking-[0.2em] text-clay">Área restrita</p>
        <h1 className="font-display text-4xl mt-2">
          <span className="display-italic">Coordenação</span>
        </h1>
        <hr className="my-6" />
        <form action={action} className="space-y-4">
          <label className="block">
            <span className="text-sm text-ink/70">Login</span>
            <input name="login" required autoFocus
              className="mt-1 w-full border border-rule bg-transparent px-3 py-2 outline-none focus:border-ink" />
          </label>
          <label className="block">
            <span className="text-sm text-ink/70">Senha</span>
            <input name="senha" type="password" required
              className="mt-1 w-full border border-rule bg-transparent px-3 py-2 outline-none focus:border-ink" />
          </label>
          {state?.erro && <p className="text-sm text-red-700">{state.erro}</p>}
          <Botao />
        </form>
      </div>
    </main>
  );
}
```

- [ ] **4.6 Verificar manualmente**

```bash
npm run dev
```

Acessar `/login`. Tentar senha errada → mensagem. Senha certa → redireciona para `/admin/conferencias` (404 esperado, vamos criar na próxima fase). Cookie `novosol_session` presente nas DevTools.

- [ ] **4.7 Commit**

```bash
git add -A
git commit -m "feat: auth jwt cookie + login page"
```

### CHECKPOINT FASE 4

Aprove com **"ok fase 4"** após:
- [ ] Login com credencial válida cria cookie e redireciona.
- [ ] Login inválido mostra erro.
- [ ] `npm test` continua verde.

---

## FASE 5 — Layout global, tema editorial, componentes base

**Objetivo:** Identidade visual aplicada (Fraunces+DM Sans, paleta bone/ink/saffron/clay), shadcn components instalados, layout administrativo com nav, guard de auth.

**Files:**
- Create: `public/grain.png` (placeholder), `src/app/admin/layout.tsx`, `src/components/admin/AdminNav.tsx`, `src/components/SiteHeader.tsx`, `src/components/SiteFooter.tsx`
- shadcn install: button, input, label, select, dialog, table, tabs, toast, card, separator, badge, alert, switch, checkbox

### Tarefas

- [ ] **5.1 Instalar componentes shadcn**

```bash
npx shadcn@latest add button input label select dialog table tabs sonner card separator badge alert switch checkbox form textarea
```

- [ ] **5.2 Criar grain noise placeholder**

Salvar imagem 240x240 PNG com ruído monocromático em `public/grain.png` (pode gerar via `node` ou usar uma de domínio público; placeholder transparente serve por enquanto).

```bash
node -e "
const fs = require('fs');
const buf = Buffer.alloc(240*240*4);
for (let i = 0; i < buf.length; i += 4) {
  const v = Math.random() < 0.5 ? 0 : 255;
  buf[i]=v; buf[i+1]=v; buf[i+2]=v; buf[i+3]=Math.random()*40|0;
}
// PNG via canvas would be ideal; for now write a 1x1 transparent png:
const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 'base64');
fs.writeFileSync('public/grain.png', png);
"
```

- [ ] **5.3 Layout admin com guard `src/app/admin/layout.tsx`**

```tsx
import { redirect } from "next/navigation";
import { getSessao } from "@/lib/auth";
import { AdminNav } from "@/components/admin/AdminNav";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const sessao = await getSessao();
  if (!sessao) redirect("/login");
  return (
    <div className="min-h-screen flex flex-col">
      <AdminNav login={sessao.login} />
      <main className="flex-1 mx-auto w-full max-w-6xl px-6 py-10">
        {children}
      </main>
    </div>
  );
}
```

- [ ] **5.4 Nav admin `src/components/admin/AdminNav.tsx`**

```tsx
import Link from "next/link";
import { logoutAction } from "@/server/actions/auth";

const itens = [
  { href: "/admin/conferencias", label: "Conferência" },
  { href: "/admin/inscricoes", label: "Inscrições" },
  { href: "/admin/dashboards", label: "Dashboards" },
];

export function AdminNav({ login }: { login: string }) {
  return (
    <header className="border-b border-rule bg-bone/80 backdrop-blur">
      <div className="mx-auto max-w-6xl px-6 py-4 flex items-baseline justify-between gap-6">
        <Link href="/admin/conferencias" className="font-display text-xl">
          O <span className="display-italic text-saffron">Novo Sol</span>
          <span className="ml-2 text-xs uppercase tracking-[0.2em] text-clay">
            coordenação
          </span>
        </Link>
        <nav className="flex items-center gap-6 text-sm">
          {itens.map((i) => (
            <Link key={i.href} href={i.href}
              className="text-ink/70 hover:text-ink transition-colors">
              {i.label}
            </Link>
          ))}
          <Link href="/" className="text-ink/50 hover:text-ink transition-colors">
            ↗ Área pública
          </Link>
          <form action={logoutAction}>
            <button className="text-ink/50 hover:text-ink">{login} · sair</button>
          </form>
        </nav>
      </div>
    </header>
  );
}
```

- [ ] **5.5 Header e footer da área pública**

`src/components/SiteHeader.tsx`:

```tsx
import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="border-b border-rule">
      <div className="mx-auto max-w-4xl px-6 py-6 flex items-baseline justify-between">
        <Link href="/" className="font-display text-2xl">
          O <span className="display-italic text-saffron">Novo Sol</span>
        </Link>
        <Link href="/cancelamento" className="text-sm text-ink/60 hover:text-ink">
          Cancelar inscrição
        </Link>
      </div>
    </header>
  );
}
```

`src/components/SiteFooter.tsx`:

```tsx
import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-rule mt-16">
      <div className="mx-auto max-w-4xl px-6 py-6 flex items-center justify-between text-xs text-ink/50">
        <span>Escola Espiritual da Rosacruz Áurea · Rio Bonito-RJ</span>
        <Link href="/login" className="hover:text-ink">⚙ área administrativa</Link>
      </div>
    </footer>
  );
}
```

- [ ] **5.6 Reescrever `src/app/page.tsx` com layout pleno**

```tsx
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-4xl px-6 py-16 relative">
        <div className="grain absolute inset-0 -z-10" />
        <p className="text-xs uppercase tracking-[0.2em] text-clay">
          Conferências mensais · Centro O Novo Sol
        </p>
        <h1 className="mt-4 font-display text-6xl leading-[0.95]">
          Inscrições para a<br />
          <span className="display-italic text-saffron">próxima conferência</span>
        </h1>
        <hr className="my-10" />
        <p className="text-ink/70 max-w-prose">
          (Painel de vagas e formulário aparecerão aqui na Fase 6.)
        </p>
      </main>
      <SiteFooter />
    </>
  );
}
```

- [ ] **5.7 Página `/admin/conferencias` placeholder**

`src/app/admin/conferencias/page.tsx`:

```tsx
export default function Page() {
  return (
    <div>
      <h1 className="font-display text-4xl">Gestão de conferências</h1>
      <hr className="my-6" />
      <p className="text-ink/60">Conteúdo na Fase 8.</p>
    </div>
  );
}
```

- [ ] **5.8 Verificar visualmente**

```bash
npm run dev
```

Conferir:
- `/` mostra header, título com itálico saffron, regras finas, footer com link admin.
- `/login` continua bonito.
- Após login, `/admin/conferencias` mostra nav e o placeholder.
- Logout funciona.

- [ ] **5.9 Commit**

```bash
git add -A
git commit -m "feat: layout editorial + nav admin com guard"
```

### CHECKPOINT FASE 5

Aprove com **"ok fase 5"** após verificação visual:
- [ ] Tipografia Fraunces aplicada em h1/h2.
- [ ] Paleta bone/ink/saffron/clay correta em ambas áreas.
- [ ] Guard `/admin/*` redireciona para `/login` quando deslogado.
- [ ] Logout limpa cookie e volta para `/`.

---

## FASE 6 — Área pública: painel de vagas + formulário de inscrição

**Objetivo:** Aluno consegue se inscrever de ponta a ponta. Painel de vagas atualizado em tempo real, validação cruzada de refeições, fluxos condicionais (alojamento sim/não), tela de confirmação com código.

**Files:**
- Create: `src/components/public/PainelVagas.tsx`, `src/components/public/FormularioInscricao.tsx`, `src/components/public/ConfirmacaoInscricao.tsx`, `src/server/actions/inscricao.ts`, `src/app/inscricao/[codigo]/imprimir/page.tsx`, `src/lib/rate-limit.ts`
- Modify: `src/app/page.tsx`

### Tarefas

- [ ] **6.1 Test: rate limit por IP em memória (estrutura)**

`tests/lib/rate-limit.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { criarRateLimiter } from "@/lib/rate-limit";

describe("criarRateLimiter", () => {
  it("permite até N hits dentro da janela", () => {
    const rl = criarRateLimiter({ janelaMs: 1000, max: 3 });
    expect(rl.permite("1.1.1.1")).toBe(true);
    expect(rl.permite("1.1.1.1")).toBe(true);
    expect(rl.permite("1.1.1.1")).toBe(true);
    expect(rl.permite("1.1.1.1")).toBe(false);
  });
  it("isola por chave", () => {
    const rl = criarRateLimiter({ janelaMs: 1000, max: 1 });
    expect(rl.permite("a")).toBe(true);
    expect(rl.permite("b")).toBe(true);
    expect(rl.permite("a")).toBe(false);
  });
});
```

- [ ] **6.2 Implementar `src/lib/rate-limit.ts`**

```ts
type Janela = { hits: number[] };

export function criarRateLimiter(opts: { janelaMs: number; max: number }) {
  const mapa = new Map<string, Janela>();
  return {
    permite(chave: string): boolean {
      const agora = Date.now();
      const j = mapa.get(chave) ?? { hits: [] };
      j.hits = j.hits.filter((t) => agora - t < opts.janelaMs);
      if (j.hits.length >= opts.max) {
        mapa.set(chave, j);
        return false;
      }
      j.hits.push(agora);
      mapa.set(chave, j);
      return true;
    },
  };
}

export const limiterInscricao = criarRateLimiter({
  janelaMs: 60 * 60 * 1000,
  max: 5,
});
```

Rodar `npm test -- rate-limit`. Esperado: 2 passed.

- [ ] **6.3 Server Action `criarInscricao` (com transação + rate limit + honeypot)**

`src/server/actions/inscricao.ts`:

```ts
"use server";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq, and, sql } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { conferencias, inscricoes } from "@/lib/db/schema";
import { validarPayloadInscricao } from "@/lib/inscricoes";
import { calcularVagas, vagasEsgotadas } from "@/lib/vagas";
import { gerarCodigoInscricao } from "@/lib/codigo-inscricao";
import { normalizarNome } from "@/lib/nome";
import { limiterInscricao } from "@/lib/rate-limit";

export async function criarInscricaoAction(_: unknown, formData: FormData) {
  if (formData.get("website")) {
    return { erro: "Erro de validação." };
  }
  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0] ?? "unknown";
  if (!limiterInscricao.permite(ip)) {
    return { erro: "Muitas tentativas. Tente novamente em alguns minutos." };
  }

  const payload = {
    nome: String(formData.get("nome") ?? ""),
    genero: formData.get("genero"),
    cidade: String(formData.get("cidade") ?? ""),
    estado: formData.get("estado"),
    discipulado: formData.get("discipulado"),
    alojamento: formData.get("alojamento") === "sim",
    tipoCama: formData.get("tipoCama") || undefined,
    dataChegada: formData.get("dataChegada") || undefined,
    almocoSabado: formData.get("almocoSabado") === "on",
    jantarSabado: formData.get("jantarSabado") === "on",
    lancheDomingo: formData.get("lancheDomingo") === "on",
    email: String(formData.get("email") ?? ""),
  };
  const v = validarPayloadInscricao(payload);
  if (!v.ok) return { erro: v.erro };

  const codigo = await db.transaction(async (tx) => {
    const [conf] = await tx
      .select()
      .from(conferencias)
      .where(eq(conferencias.status, "aberta"))
      .for("update");
    if (!conf) throw new Error("Não há conferência aberta no momento.");

    const ativos = await tx
      .select({
        genero: inscricoes.genero,
        alojamento: inscricoes.alojamento,
        tipoCama: inscricoes.tipoCama,
        status: inscricoes.status,
      })
      .from(inscricoes)
      .where(eq(inscricoes.conferenciaId, conf.id));

    if (v.value.alojamento && v.value.tipoCama) {
      const vagas = calcularVagas(ativos as any);
      if (vagasEsgotadas(vagas, v.value.genero, v.value.tipoCama)) {
        throw new Error("As vagas para o tipo de cama solicitado se esgotaram.");
      }
    }

    const nomeNorm = normalizarNome(v.value.nome);
    const dup = await tx
      .select({ id: inscricoes.id })
      .from(inscricoes)
      .where(and(
        eq(inscricoes.conferenciaId, conf.id),
        eq(inscricoes.nomeNormalizado, nomeNorm),
        eq(inscricoes.status, "ativo"),
      ));
    if (dup.length > 0) {
      throw new Error("Já existe uma inscrição registrada com este nome. Caso precise alterar, utilize a opção de cancelamento.");
    }

    const [{ count }] = await tx
      .select({ count: sql<number>`count(*)::int` })
      .from(inscricoes)
      .where(eq(inscricoes.conferenciaId, conf.id));

    const codigo = gerarCodigoInscricao({
      mes: conf.mes, ano: conf.ano, sequencial: count + 1,
    });

    await tx.insert(inscricoes).values({
      codigo,
      conferenciaId: conf.id,
      nome: v.value.nome.trim(),
      nomeNormalizado: nomeNorm,
      genero: v.value.genero,
      cidade: v.value.cidade.trim(),
      estado: v.value.estado,
      discipulado: v.value.discipulado,
      alojamento: v.value.alojamento,
      tipoCama: v.value.tipoCama ?? null,
      dataChegada: v.value.dataChegada ?? null,
      almocoSabado: v.value.almocoSabado,
      jantarSabado: v.value.jantarSabado,
      lancheDomingo: v.value.lancheDomingo,
      cafeDomingo: v.value.cafeDomingo,
      email: v.value.email.trim(),
    });

    return codigo;
  }).catch((e: Error) => ({ erro: e.message }));

  if (typeof codigo !== "string") return codigo;
  revalidatePath("/");
  redirect(`/inscricao/${codigo}/imprimir`);
}
```

- [ ] **6.4 Componente `PainelVagas` (Server Component)**

`src/components/public/PainelVagas.tsx`:

```tsx
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { conferencias, inscricoes } from "@/lib/db/schema";
import { calcularVagas } from "@/lib/vagas";

export async function PainelVagas() {
  const [conf] = await db.select().from(conferencias).where(eq(conferencias.status, "aberta"));
  if (!conf) {
    return (
      <section className="border border-rule p-8 text-center">
        <p className="text-ink/70">
          As inscrições para a próxima conferência ainda não foram abertas.
          Aguarde comunicação da coordenação.
        </p>
      </section>
    );
  }
  const lista = await db
    .select({
      genero: inscricoes.genero, alojamento: inscricoes.alojamento,
      tipoCama: inscricoes.tipoCama, status: inscricoes.status,
    })
    .from(inscricoes)
    .where(eq(inscricoes.conferenciaId, conf.id));
  const v = calcularVagas(lista as any);
  const fim = new Date(conf.inscricoesFim).toLocaleDateString("pt-BR");
  return (
    <section className="border border-rule p-8 space-y-6">
      <header className="flex items-baseline justify-between">
        <h2 className="font-display text-2xl">
          Conferência de <span className="display-italic">{conf.nome}</span>
        </h2>
        <span className="text-xs uppercase tracking-[0.2em] text-clay">
          inscrições até {fim}
        </span>
      </header>
      <div className="grid grid-cols-2 gap-8 num">
        <Bloco titulo="Alojamento feminino" baixo={v.feminino.baixo} cima={v.feminino.cima} />
        <Bloco titulo="Alojamento masculino" baixo={v.masculino.baixo} cima={v.masculino.cima} />
      </div>
      <hr />
      <p className="text-sm text-ink/60">
        <span className="num text-ink">{v.totalAlojados}</span> alojados ·{" "}
        <span className="num text-ink">{lista.filter((i) => i.status === "ativo").length}</span> inscritos no total
      </p>
    </section>
  );
}

function Bloco({ titulo, baixo, cima }: { titulo: string; baixo: number; cima: number }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-[0.18em] text-clay">{titulo}</p>
      <p className="mt-2 font-display text-3xl">
        <span className={baixo === 0 ? "text-ink/30" : ""}>{baixo}</span>
        <span className="text-ink/30 text-xl mx-2">/</span>
        <span className={cima === 0 ? "text-ink/30" : ""}>{cima}</span>
      </p>
      <p className="text-xs text-ink/50">camas baixo · cima</p>
    </div>
  );
}
```

- [ ] **6.5 Formulário `FormularioInscricao` (Client Component)**

`src/components/public/FormularioInscricao.tsx`:

```tsx
"use client";
import { useFormState, useFormStatus } from "react-dom";
import { useState } from "react";
import { criarInscricaoAction } from "@/server/actions/inscricao";
import { ESTADOS_BR, DISCIPULADOS, GENEROS } from "@/lib/constants";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending}
      className="bg-ink text-bone px-8 py-3 font-display tracking-wide hover:bg-clay transition-colors disabled:opacity-50">
      {pending ? "Enviando…" : "Confirmar inscrição"}
    </button>
  );
}

export function FormularioInscricao() {
  const [state, action] = useFormState(criarInscricaoAction, { erro: "" });
  const [alojamento, setAlojamento] = useState<"sim" | "nao" | "">("");
  const [chegada, setChegada] = useState<"sabado_manha" | "sabado_tarde" | "">("");

  return (
    <form action={action} className="space-y-8">
      <input type="text" name="website" tabIndex={-1} autoComplete="off"
        className="absolute -left-[9999px] opacity-0" aria-hidden />

      <Aviso />

      <Campo label="Nome completo" name="nome" required />
      <Radios label="Gênero" name="genero" opcoes={[...GENEROS]} required />
      <Campo label="Cidade" name="cidade" required />
      <Select label="Estado" name="estado" opcoes={[...ESTADOS_BR]} required />
      <Select label="Discipulado" name="discipulado" opcoes={[...DISCIPULADOS]} required />

      <Radios label="Precisa de alojamento?" name="alojamento"
        opcoes={["sim", "nao"]} rotulos={["Sim", "Não"]} required
        onChange={(v) => setAlojamento(v as any)} />

      {alojamento === "sim" && (
        <>
          <Aviso variant="info">
            Camas de baixo são prioridade para pessoas com mais idade.
            A Secretaria pode alterar quarto e cama conforme necessidade do Centro.
          </Aviso>
          <Radios label="Tipo de cama" name="tipoCama"
            opcoes={["baixo", "cima"]} rotulos={["Baixo", "Cima"]} required />
          <Radios label="Data de chegada" name="dataChegada"
            opcoes={["sabado_manha", "sabado_tarde"]}
            rotulos={["Sábado de manhã", "Sábado à tarde"]}
            onChange={(v) => setChegada(v as any)} required />
          <Refeicoes alojado chegada={chegada} />
          <p className="text-sm text-ink/60 italic">
            O café da manhã de domingo está incluído para todos os alunos alojados.
          </p>
        </>
      )}

      {alojamento === "nao" && <Refeicoes />}

      <Campo label="Email" name="email" type="email" required />

      {state?.erro && (
        <p className="border border-red-700 text-red-700 p-3 text-sm">{state.erro}</p>
      )}

      <Submit />
    </form>
  );
}

function Aviso({ children, variant = "warn" }: { children?: React.ReactNode; variant?: "warn" | "info" }) {
  return (
    <div className={`border-l-4 px-4 py-3 ${variant === "warn" ? "border-saffron bg-saffron/10" : "border-clay/50 bg-clay/5"}`}>
      {children ?? (
        <p className="font-display text-lg">
          <strong>Leia com atenção.</strong>{" "}
          O nome informado é a chave da inscrição — uma vez registrado, alterações exigem cancelamento e nova inscrição.
        </p>
      )}
    </div>
  );
}

function Campo({ label, name, type = "text", required = false }: any) {
  return (
    <label className="block">
      <span className="text-sm text-ink/70">{label}{required && " *"}</span>
      <input type={type} name={name} required={required}
        className="mt-1 w-full border border-rule bg-transparent px-3 py-2 outline-none focus:border-ink" />
    </label>
  );
}

function Radios({
  label, name, opcoes, rotulos, required, onChange,
}: {
  label: string; name: string; opcoes: string[];
  rotulos?: string[]; required?: boolean;
  onChange?: (v: string) => void;
}) {
  return (
    <fieldset>
      <legend className="text-sm text-ink/70">{label}{required && " *"}</legend>
      <div className="mt-2 flex flex-wrap gap-2">
        {opcoes.map((o, i) => (
          <label key={o}
            className="border border-rule px-4 py-2 cursor-pointer has-[:checked]:bg-ink has-[:checked]:text-bone">
            <input type="radio" name={name} value={o} required={required}
              onChange={(e) => onChange?.(e.target.value)}
              className="sr-only" />
            {rotulos?.[i] ?? o}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function Select({ label, name, opcoes, required }: any) {
  return (
    <label className="block">
      <span className="text-sm text-ink/70">{label}{required && " *"}</span>
      <select name={name} required={required}
        className="mt-1 w-full border border-rule bg-transparent px-3 py-2 outline-none focus:border-ink">
        <option value="">—</option>
        {opcoes.map((o: string) => <option key={o} value={o}>{o}</option>)}
      </select>
    </label>
  );
}

function Refeicoes({
  alojado, chegada,
}: {
  alojado?: boolean;
  chegada?: "sabado_manha" | "sabado_tarde" | "";
}) {
  const podeAlmoco = !alojado || chegada === "sabado_manha";
  return (
    <fieldset>
      <legend className="text-sm text-ink/70">Refeições</legend>
      <div className="mt-2 space-y-2">
        <Check name="almocoSabado" rotulo="Almoço de sábado" disabled={!podeAlmoco} />
        <Check name="jantarSabado" rotulo="Jantar de sábado" />
        <Check name="lancheDomingo" rotulo="Lanche de domingo" />
      </div>
    </fieldset>
  );
}

function Check({ name, rotulo, disabled }: any) {
  return (
    <label className={`flex items-center gap-3 ${disabled ? "opacity-40" : ""}`}>
      <input type="checkbox" name={name} disabled={disabled} className="accent-saffron" />
      <span>{rotulo}</span>
    </label>
  );
}
```

- [ ] **6.6 Página de confirmação `src/app/inscricao/[codigo]/imprimir/page.tsx`**

```tsx
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { db } from "@/lib/db/client";
import { inscricoes, conferencias } from "@/lib/db/schema";
import { BotaoImprimir } from "@/components/public/BotaoImprimir";

export default async function Page({ params }: { params: Promise<{ codigo: string }> }) {
  const { codigo } = await params;
  const [reg] = await db
    .select()
    .from(inscricoes)
    .innerJoin(conferencias, eq(inscricoes.conferenciaId, conferencias.id))
    .where(eq(inscricoes.codigo, codigo));
  if (!reg) notFound();
  const i = reg.inscricoes;
  const c = reg.conferencias;
  return (
    <main className="mx-auto max-w-2xl px-6 py-16 print:py-0">
      <p className="text-xs uppercase tracking-[0.2em] text-clay">Inscrição confirmada</p>
      <h1 className="mt-3 font-display text-4xl">
        <span className="display-italic">{i.nome}</span>
      </h1>
      <p className="mt-1 text-ink/60">
        Conferência de {c.nome} · código <span className="num">{i.codigo}</span>
      </p>
      <hr className="my-8" />
      <dl className="grid grid-cols-2 gap-y-3 text-sm">
        <Linha k="Gênero" v={i.genero} />
        <Linha k="Cidade/Estado" v={`${i.cidade} / ${i.estado}`} />
        <Linha k="Discipulado" v={i.discipulado} />
        <Linha k="Alojamento" v={i.alojamento ? `Sim · ${i.tipoCama === "baixo" ? "cama de baixo" : "cama de cima"}` : "Não"} />
        {i.alojamento && <Linha k="Chegada" v={i.dataChegada === "sabado_manha" ? "Sábado de manhã" : "Sábado à tarde"} />}
        <Linha k="Refeições" v={[
          i.almocoSabado && "Almoço sábado",
          i.jantarSabado && "Jantar sábado",
          i.lancheDomingo && "Lanche domingo",
          i.cafeDomingo && "Café domingo",
        ].filter(Boolean).join(" · ") || "—"} />
        <Linha k="Email" v={i.email} />
      </dl>
      {i.cafeDomingo && (
        <p className="mt-6 text-sm italic text-ink/60">
          O café da manhã de domingo está incluído para todos os alunos alojados.
        </p>
      )}
      <hr className="my-8" />
      <div className="flex gap-4 print:hidden">
        <BotaoImprimir />
        <a href="/" className="px-6 py-3 border border-rule">Voltar</a>
      </div>
    </main>
  );
}

function Linha({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <>
      <dt className="text-ink/50 uppercase tracking-wide text-xs">{k}</dt>
      <dd>{v}</dd>
    </>
  );
}
```

`src/components/public/BotaoImprimir.tsx`:

```tsx
"use client";
export function BotaoImprimir() {
  return (
    <button onClick={() => window.print()}
      className="px-6 py-3 bg-ink text-bone hover:bg-clay">
      Imprimir / Salvar PDF
    </button>
  );
}
```

- [ ] **6.7 Atualizar `src/app/page.tsx` para usar Painel + Formulário**

```tsx
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { conferencias } from "@/lib/db/schema";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { PainelVagas } from "@/components/public/PainelVagas";
import { FormularioInscricao } from "@/components/public/FormularioInscricao";

export default async function Home() {
  const [conf] = await db.select().from(conferencias).where(eq(conferencias.status, "aberta"));
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-6 py-12 space-y-12">
        <header>
          <p className="text-xs uppercase tracking-[0.2em] text-clay">
            Centro de Conferências O Novo Sol · Rio Bonito-RJ
          </p>
          <h1 className="mt-3 font-display text-5xl leading-[1.05]">
            Inscrições<br />
            <span className="display-italic text-saffron">{conf?.nome ?? "—"}</span>
          </h1>
        </header>
        <PainelVagas />
        {conf && (
          <section>
            <h2 className="font-display text-3xl mb-6">Formulário de inscrição</h2>
            <FormularioInscricao />
          </section>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
```

- [ ] **6.8 Teste manual de ponta a ponta**

1. `npm run dev`
2. `/` mostra painel com vagas e formulário.
3. Submeter inscrição alojada feminino baixo → redireciona para `/inscricao/MAI2026-001/imprimir`.
4. Voltar para `/` → painel mostra `26 → 25` no feminino baixo.
5. Tentar inscrever de novo com o mesmo nome → erro de duplicata.
6. Esgotar baixo feminino (rodar 26 inscrições femininas baixo via DB ou UI) → 27ª recebe erro de vagas.
7. Inscrever sem alojamento → não vê pergunta de cama, sem café domingo.
8. Sábado tarde → almoço de sábado disabled na UI; tentar burlar (devtools) → server rejeita.

- [ ] **6.9 Commit**

```bash
git add -A
git commit -m "feat: area publica — painel de vagas + formulario de inscricao + confirmacao"
```

### CHECKPOINT FASE 6

Aprove com **"ok fase 6"** após:
- [ ] Inscrição de ponta a ponta funciona.
- [ ] Painel decrementa em tempo real.
- [ ] Duplicata bloqueada.
- [ ] Esgotamento de cama bloqueado.
- [ ] Página de impressão renderiza limpa em `Ctrl+P`.

---

## FASE 7 — Área pública: cancelamento

**Objetivo:** Aluno cancela própria inscrição informando nome; sistema localiza, mostra resumo, confirma e marca `status='cancelado'`, liberando vagas.

**Files:**
- Create: `src/app/cancelamento/page.tsx`, `src/components/public/FormularioCancelamento.tsx`, action `cancelarInscricaoPublicaAction` em `src/server/actions/inscricao.ts`

### Tarefas

- [ ] **7.1 Adicionar action de cancelamento (público) em `src/server/actions/inscricao.ts`**

```ts
export async function buscarInscricaoPorNomeAction(_: unknown, formData: FormData) {
  const nome = String(formData.get("nome") ?? "");
  const norm = normalizarNome(nome);
  const [conf] = await db.select().from(conferencias).where(eq(conferencias.status, "aberta"));
  if (!conf) return { erro: "Não há conferência aberta no momento." };
  const [reg] = await db
    .select()
    .from(inscricoes)
    .where(and(
      eq(inscricoes.conferenciaId, conf.id),
      eq(inscricoes.nomeNormalizado, norm),
      eq(inscricoes.status, "ativo"),
    ));
  if (!reg) return { erro: "Não encontramos uma inscrição ativa com esse nome." };
  return { ok: true, inscricao: reg, conferenciaNome: conf.nome };
}

export async function cancelarInscricaoPublicaAction(_: unknown, formData: FormData) {
  const codigo = String(formData.get("codigo") ?? "");
  const [reg] = await db.select().from(inscricoes).where(eq(inscricoes.codigo, codigo));
  if (!reg || reg.status !== "ativo") {
    return { erro: "Inscrição não encontrada ou já cancelada." };
  }
  await db.update(inscricoes)
    .set({
      status: "cancelado",
      canceladoEm: new Date(),
      canceladoPor: "auto-cancelamento",
    })
    .where(eq(inscricoes.id, reg.id));
  revalidatePath("/");
  return { ok: true, conferenciaMes: reg.codigo.slice(0, 3) };
}
```

(Importar `and` no topo do arquivo.)

- [ ] **7.2 `src/components/public/FormularioCancelamento.tsx`**

```tsx
"use client";
import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import {
  buscarInscricaoPorNomeAction,
  cancelarInscricaoPublicaAction,
} from "@/server/actions/inscricao";

function Btn({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button disabled={pending} className="bg-ink text-bone px-6 py-3 disabled:opacity-50">
      {pending ? "…" : label}
    </button>
  );
}

export function FormularioCancelamento() {
  const [busca, buscar] = useFormState(buscarInscricaoPorNomeAction, {} as any);
  const [cancel, cancelar] = useFormState(cancelarInscricaoPublicaAction, {} as any);

  if (cancel?.ok) {
    return (
      <p className="border border-rule p-8">
        Sua inscrição foi cancelada com sucesso.
      </p>
    );
  }

  if (busca?.ok) {
    const i = busca.inscricao;
    return (
      <div className="space-y-6">
        <p className="text-ink/70">Confirme o cancelamento da inscrição abaixo:</p>
        <dl className="border border-rule p-6 grid grid-cols-2 gap-y-2 text-sm">
          <dt className="text-ink/50">Nome</dt><dd>{i.nome}</dd>
          <dt className="text-ink/50">Código</dt><dd className="num">{i.codigo}</dd>
          <dt className="text-ink/50">Conferência</dt><dd>{busca.conferenciaNome}</dd>
        </dl>
        <form action={cancelar} className="flex gap-4">
          <input type="hidden" name="codigo" value={i.codigo} />
          <Btn label="Confirmar cancelamento" />
          <a href="/cancelamento" className="px-6 py-3 border border-rule">Voltar</a>
        </form>
        {cancel?.erro && <p className="text-red-700 text-sm">{cancel.erro}</p>}
      </div>
    );
  }

  return (
    <form action={buscar} className="space-y-4">
      <label className="block">
        <span className="text-sm text-ink/70">Nome completo (exatamente como cadastrado)</span>
        <input name="nome" required
          className="mt-1 w-full border border-rule bg-transparent px-3 py-2 outline-none focus:border-ink" />
      </label>
      {busca?.erro && <p className="text-red-700 text-sm">{busca.erro}</p>}
      <Btn label="Buscar inscrição" />
    </form>
  );
}
```

- [ ] **7.3 Página `/cancelamento`**

`src/app/cancelamento/page.tsx`:

```tsx
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { FormularioCancelamento } from "@/components/public/FormularioCancelamento";

export default function Page() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-2xl px-6 py-16 space-y-8">
        <header>
          <p className="text-xs uppercase tracking-[0.2em] text-clay">Cancelamento</p>
          <h1 className="mt-3 font-display text-4xl">
            Cancelar <span className="display-italic">inscrição</span>
          </h1>
        </header>
        <hr />
        <FormularioCancelamento />
      </main>
      <SiteFooter />
    </>
  );
}
```

- [ ] **7.4 Teste manual**

- Cancelar inscrição existente → confirma → painel principal atualiza vagas.
- Buscar nome inexistente → erro amigável.
- Tentar cancelar inscrição já cancelada → bloqueado.

- [ ] **7.5 Commit**

```bash
git add -A
git commit -m "feat: cancelamento de inscricao na area publica"
```

### CHECKPOINT FASE 7

Aprove com **"ok fase 7"** após verificar fluxo completo.

---

## FASE 8 — Área restrita: gestão de conferências

**Objetivo:** Gestor abre nova conferência (mês/ano/datas), fecha manualmente, e consulta histórico.

**Files:**
- Create: `src/server/actions/conferencia.ts`, `src/components/admin/ConferenciaForm.tsx`, `src/components/admin/HistoricoConferencias.tsx`
- Modify: `src/app/admin/conferencias/page.tsx`

### Tarefas

- [ ] **8.1 Action `abrirConferenciaAction` e `fecharConferenciaAction`**

`src/server/actions/conferencia.ts`:

```ts
"use server";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db/client";
import { conferencias } from "@/lib/db/schema";
import { getSessao } from "@/lib/auth";
import { validarAberturaConferencia, formatarNomeConferencia } from "@/lib/conferencias";

async function exigirSessao() {
  const s = await getSessao();
  if (!s) throw new Error("Não autenticado");
  return s;
}

export async function abrirConferenciaAction(_: unknown, fd: FormData) {
  const sessao = await exigirSessao();
  const mes = Number(fd.get("mes"));
  const ano = Number(fd.get("ano"));
  const inicio = new Date(String(fd.get("inicio")));
  const fim = new Date(String(fd.get("fim")));
  const v = validarAberturaConferencia({
    mes, ano, inscricoesAbertura: inicio, inscricoesFim: fim,
  });
  if (!v.ok) return { erro: v.erro };
  const aberta = await db.select().from(conferencias).where(eq(conferencias.status, "aberta"));
  if (aberta.length > 0) {
    return { erro: "Já existe uma conferência aberta. Feche-a antes de abrir outra." };
  }
  try {
    await db.insert(conferencias).values({
      mes, ano,
      nome: formatarNomeConferencia(mes, ano),
      inscricoesAbertura: inicio,
      inscricoesFim: fim,
      status: "aberta",
      criadoPor: sessao.login,
    });
  } catch (e: any) {
    if (String(e.message).includes("conferencias_mes_ano_uq")) {
      return { erro: "Já existe uma conferência para esse mês/ano." };
    }
    throw e;
  }
  revalidatePath("/admin/conferencias");
  revalidatePath("/");
  return { ok: true };
}

export async function fecharConferenciaAction(_: unknown, fd: FormData) {
  await exigirSessao();
  const id = Number(fd.get("id"));
  await db.update(conferencias)
    .set({ status: "fechada" })
    .where(and(eq(conferencias.id, id), eq(conferencias.status, "aberta")));
  revalidatePath("/admin/conferencias");
  revalidatePath("/");
  return { ok: true };
}
```

- [ ] **8.2 Componente `ConferenciaForm`**

`src/components/admin/ConferenciaForm.tsx`:

```tsx
"use client";
import { useFormState, useFormStatus } from "react-dom";
import { abrirConferenciaAction } from "@/server/actions/conferencia";
import { MESES_CONFERENCIA } from "@/lib/constants";

function Btn() {
  const { pending } = useFormStatus();
  return (
    <button className="bg-ink text-bone px-6 py-3 disabled:opacity-50" disabled={pending}>
      {pending ? "Abrindo…" : "Abrir inscrições"}
    </button>
  );
}

export function ConferenciaForm({ ano }: { ano: number }) {
  const [state, action] = useFormState(abrirConferenciaAction, { erro: "" });
  return (
    <form action={action} className="space-y-4 border border-rule p-6">
      <h3 className="font-display text-2xl">Abrir nova conferência</h3>
      <div className="grid grid-cols-2 gap-4">
        <label>
          <span className="text-sm text-ink/70">Mês</span>
          <select name="mes" required className="mt-1 w-full border border-rule px-3 py-2 bg-transparent">
            {MESES_CONFERENCIA.map((m) => <option key={m.num} value={m.num}>{m.nome}</option>)}
          </select>
        </label>
        <label>
          <span className="text-sm text-ink/70">Ano</span>
          <input name="ano" type="number" defaultValue={ano} required
            className="mt-1 w-full border border-rule px-3 py-2 bg-transparent num" />
        </label>
        <label>
          <span className="text-sm text-ink/70">Início das inscrições</span>
          <input name="inicio" type="datetime-local" required
            className="mt-1 w-full border border-rule px-3 py-2 bg-transparent" />
        </label>
        <label>
          <span className="text-sm text-ink/70">Fim das inscrições</span>
          <input name="fim" type="datetime-local" required
            className="mt-1 w-full border border-rule px-3 py-2 bg-transparent" />
        </label>
      </div>
      {state?.erro && <p className="text-red-700 text-sm">{state.erro}</p>}
      <Btn />
    </form>
  );
}
```

- [ ] **8.3 Componente `HistoricoConferencias`**

`src/components/admin/HistoricoConferencias.tsx`:

```tsx
import { desc } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { conferencias } from "@/lib/db/schema";
import { fecharConferenciaAction } from "@/server/actions/conferencia";

export async function HistoricoConferencias() {
  const lista = await db.select().from(conferencias).orderBy(desc(conferencias.ano), desc(conferencias.mes));
  return (
    <table className="w-full text-sm">
      <thead className="text-left text-xs uppercase tracking-wide text-ink/60 border-b border-rule">
        <tr>
          <th className="py-3">Conferência</th>
          <th>Período</th>
          <th>Status</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {lista.map((c) => (
          <tr key={c.id} className="border-b border-rule/60">
            <td className="py-3 font-display">{c.nome}</td>
            <td className="num">
              {new Date(c.inscricoesAbertura).toLocaleDateString("pt-BR")} – {new Date(c.inscricoesFim).toLocaleDateString("pt-BR")}
            </td>
            <td>
              <span className={`px-2 py-0.5 text-xs ${c.status === "aberta" ? "bg-saffron/30" : "bg-ink/10"}`}>
                {c.status}
              </span>
            </td>
            <td className="text-right">
              {c.status === "aberta" && (
                <form action={fecharConferenciaAction}>
                  <input type="hidden" name="id" value={c.id} />
                  <button className="text-clay hover:text-ink underline">fechar</button>
                </form>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

- [ ] **8.4 Página de gestão**

`src/app/admin/conferencias/page.tsx`:

```tsx
import { ConferenciaForm } from "@/components/admin/ConferenciaForm";
import { HistoricoConferencias } from "@/components/admin/HistoricoConferencias";

export default function Page() {
  return (
    <div className="space-y-12">
      <header>
        <h1 className="font-display text-4xl">Gestão de conferências</h1>
        <p className="text-ink/60 mt-1">Abrir, fechar e consultar o histórico.</p>
      </header>
      <ConferenciaForm ano={new Date().getFullYear()} />
      <section>
        <h2 className="font-display text-2xl mb-4">Histórico</h2>
        <HistoricoConferencias />
      </section>
    </div>
  );
}
```

- [ ] **8.5 Teste manual**
- Abrir conferência futura → vira a "aberta" e área pública atualiza.
- Tentar abrir 2ª enquanto há aberta → erro.
- Fechar manualmente → vai pro histórico, área pública volta a mostrar "não abertas".

- [ ] **8.6 Commit**

```bash
git add -A
git commit -m "feat: gestao de conferencias na area restrita"
```

### CHECKPOINT FASE 8

Aprove com **"ok fase 8"**.

---

## FASE 9 — Área restrita: lista, edição, cancelamento, exportação

**Objetivo:** Gestor vê lista de inscritos da conferência ativa (ou histórica selecionada), edita, cancela, exporta CSV/Excel.

**Files:**
- Create: `src/components/admin/ListaInscricoes.tsx`, `src/components/admin/EditarInscricaoDialog.tsx`, `src/server/actions/admin-inscricao.ts`, `src/lib/exportar.ts`, `tests/lib/exportar.test.ts`
- Modify: `src/app/admin/inscricoes/page.tsx`

### Tarefas

- [ ] **9.1 Test: gerar CSV**

`tests/lib/exportar.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { gerarCSV } from "@/lib/exportar";

describe("gerarCSV", () => {
  it("escapa vírgulas e aspas", () => {
    const csv = gerarCSV(
      ["nome", "obs"],
      [{ nome: 'Ana, "a"', obs: "ok" }],
    );
    expect(csv).toContain('"Ana, ""a""","ok"');
  });
  it("ordem das colunas é preservada", () => {
    const csv = gerarCSV(["b", "a"], [{ a: 1, b: 2 }]);
    expect(csv.split("\n")[0]).toBe("b,a");
    expect(csv.split("\n")[1]).toBe("2,1");
  });
});
```

- [ ] **9.2 Implementar `src/lib/exportar.ts`**

```ts
function escapar(v: unknown): string {
  if (v == null) return "";
  const s = String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function gerarCSV<T extends Record<string, unknown>>(
  colunas: (keyof T)[],
  rows: T[],
): string {
  const head = colunas.join(",");
  const body = rows
    .map((r) => colunas.map((c) => escapar(r[c])).join(","))
    .join("\n");
  return `${head}\n${body}`;
}
```

Rodar `npm test -- exportar`. Esperado: 2 passed.

- [ ] **9.3 Server actions de admin**

`src/server/actions/admin-inscricao.ts`:

```ts
"use server";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db/client";
import { inscricoes } from "@/lib/db/schema";
import { getSessao } from "@/lib/auth";
import { validarPayloadInscricao } from "@/lib/inscricoes";
import { normalizarNome } from "@/lib/nome";

async function gestor() {
  const s = await getSessao();
  if (!s) throw new Error("Não autenticado");
  return s;
}

export async function editarInscricaoAction(_: unknown, fd: FormData) {
  const s = await gestor();
  const id = Number(fd.get("id"));
  const payload = {
    nome: String(fd.get("nome") ?? ""),
    genero: fd.get("genero"),
    cidade: String(fd.get("cidade") ?? ""),
    estado: fd.get("estado"),
    discipulado: fd.get("discipulado"),
    alojamento: fd.get("alojamento") === "sim",
    tipoCama: fd.get("tipoCama") || undefined,
    dataChegada: fd.get("dataChegada") || undefined,
    almocoSabado: fd.get("almocoSabado") === "on",
    jantarSabado: fd.get("jantarSabado") === "on",
    lancheDomingo: fd.get("lancheDomingo") === "on",
    email: String(fd.get("email") ?? ""),
  };
  const v = validarPayloadInscricao(payload);
  if (!v.ok) return { erro: v.erro };
  await db.update(inscricoes).set({
    nome: v.value.nome.trim(),
    nomeNormalizado: normalizarNome(v.value.nome),
    genero: v.value.genero,
    cidade: v.value.cidade.trim(),
    estado: v.value.estado,
    discipulado: v.value.discipulado,
    alojamento: v.value.alojamento,
    tipoCama: v.value.tipoCama ?? null,
    dataChegada: v.value.dataChegada ?? null,
    almocoSabado: v.value.almocoSabado,
    jantarSabado: v.value.jantarSabado,
    lancheDomingo: v.value.lancheDomingo,
    cafeDomingo: v.value.cafeDomingo,
    email: v.value.email.trim(),
    alteradoEm: new Date(),
    alteradoPor: s.login,
  }).where(eq(inscricoes.id, id));
  revalidatePath("/admin/inscricoes");
  revalidatePath("/");
  return { ok: true };
}

export async function cancelarInscricaoAdminAction(_: unknown, fd: FormData) {
  const s = await gestor();
  const id = Number(fd.get("id"));
  await db.update(inscricoes).set({
    status: "cancelado",
    canceladoEm: new Date(),
    canceladoPor: s.login,
  }).where(eq(inscricoes.id, id));
  revalidatePath("/admin/inscricoes");
  revalidatePath("/");
  return { ok: true };
}
```

- [ ] **9.4 Endpoint de exportação CSV**

`src/app/admin/inscricoes/exportar/route.ts`:

```ts
import { eq, desc } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { conferencias, inscricoes } from "@/lib/db/schema";
import { gerarCSV } from "@/lib/exportar";
import { getSessao } from "@/lib/auth";

export async function GET(req: Request) {
  if (!(await getSessao())) return new Response("Unauthorized", { status: 401 });
  const url = new URL(req.url);
  const confId = Number(url.searchParams.get("conferenciaId"));
  const conf = confId
    ? (await db.select().from(conferencias).where(eq(conferencias.id, confId)))[0]
    : (await db.select().from(conferencias).orderBy(desc(conferencias.ano), desc(conferencias.mes)))[0];
  if (!conf) return new Response("conf não encontrada", { status: 404 });
  const rows = await db.select().from(inscricoes).where(eq(inscricoes.conferenciaId, conf.id));
  const csv = gerarCSV(
    ["codigo","nome","genero","cidade","estado","discipulado",
     "alojamento","tipoCama","dataChegada",
     "almocoSabado","jantarSabado","lancheDomingo","cafeDomingo",
     "email","status","criadoEm","canceladoEm"] as any,
    rows as any,
  );
  return new Response("﻿" + csv, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="${conf.nome.replace(" ", "-")}.csv"`,
    },
  });
}
```

- [ ] **9.5 Lista + dialog de edição**

`src/components/admin/ListaInscricoes.tsx`:

```tsx
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { inscricoes } from "@/lib/db/schema";
import { LinhaInscricao } from "./LinhaInscricao";

export async function ListaInscricoes({ conferenciaId }: { conferenciaId: number }) {
  const rows = await db.select().from(inscricoes)
    .where(eq(inscricoes.conferenciaId, conferenciaId));
  return (
    <table className="w-full text-sm">
      <thead className="text-left text-xs uppercase text-ink/60 border-b border-rule">
        <tr>
          <th className="py-3">Código</th>
          <th>Nome</th>
          <th>Gênero</th>
          <th>Cidade/UF</th>
          <th>Aloj.</th>
          <th>Status</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {rows.map((i) => <LinhaInscricao key={i.id} inscricao={i} />)}
      </tbody>
    </table>
  );
}
```

`src/components/admin/LinhaInscricao.tsx`:

```tsx
"use client";
import { useState } from "react";
import { cancelarInscricaoAdminAction } from "@/server/actions/admin-inscricao";
import { EditarInscricaoDialog } from "./EditarInscricaoDialog";

export function LinhaInscricao({ inscricao }: { inscricao: any }) {
  const [editando, setEditando] = useState(false);
  const i = inscricao;
  return (
    <>
      <tr className="border-b border-rule/50">
        <td className="py-3 num">{i.codigo}</td>
        <td>{i.nome}</td>
        <td>{i.genero}</td>
        <td>{i.cidade}/{i.estado}</td>
        <td>{i.alojamento ? i.tipoCama : "—"}</td>
        <td>
          <span className={i.status === "ativo" ? "text-clay" : "text-ink/40 line-through"}>
            {i.status}
          </span>
        </td>
        <td className="text-right space-x-3">
          <button onClick={() => setEditando(true)} className="text-saffron underline">editar</button>
          {i.status === "ativo" && (
            <form action={cancelarInscricaoAdminAction} className="inline">
              <input type="hidden" name="id" value={i.id} />
              <button className="text-red-700 underline">cancelar</button>
            </form>
          )}
        </td>
      </tr>
      {editando && <EditarInscricaoDialog inscricao={i} onClose={() => setEditando(false)} />}
    </>
  );
}
```

`src/components/admin/EditarInscricaoDialog.tsx`:

```tsx
"use client";
import { useFormState } from "react-dom";
import { editarInscricaoAction } from "@/server/actions/admin-inscricao";
import { ESTADOS_BR, GENEROS, DISCIPULADOS } from "@/lib/constants";

export function EditarInscricaoDialog({ inscricao: i, onClose }: { inscricao: any; onClose: () => void }) {
  const [state, action] = useFormState(editarInscricaoAction, { erro: "" });
  if (state?.ok) onClose();
  return (
    <tr><td colSpan={7} className="bg-bone/60 p-6 border-b border-rule">
      <form action={action} className="space-y-3 max-w-2xl">
        <input type="hidden" name="id" value={i.id} />
        <div className="grid grid-cols-2 gap-3">
          <label className="block"><span className="text-xs text-ink/60">Nome</span>
            <input name="nome" defaultValue={i.nome} className="w-full border border-rule px-2 py-1 bg-transparent" /></label>
          <label className="block"><span className="text-xs text-ink/60">Email</span>
            <input name="email" defaultValue={i.email} className="w-full border border-rule px-2 py-1 bg-transparent" /></label>
          <label className="block"><span className="text-xs text-ink/60">Cidade</span>
            <input name="cidade" defaultValue={i.cidade} className="w-full border border-rule px-2 py-1 bg-transparent" /></label>
          <label className="block"><span className="text-xs text-ink/60">Estado</span>
            <select name="estado" defaultValue={i.estado} className="w-full border border-rule px-2 py-1 bg-transparent">
              {ESTADOS_BR.map(e => <option key={e}>{e}</option>)}
            </select></label>
          <label className="block"><span className="text-xs text-ink/60">Gênero</span>
            <select name="genero" defaultValue={i.genero} className="w-full border border-rule px-2 py-1 bg-transparent">
              {GENEROS.map(e => <option key={e}>{e}</option>)}
            </select></label>
          <label className="block"><span className="text-xs text-ink/60">Discipulado</span>
            <select name="discipulado" defaultValue={i.discipulado} className="w-full border border-rule px-2 py-1 bg-transparent">
              {DISCIPULADOS.map(e => <option key={e}>{e}</option>)}
            </select></label>
        </div>
        <fieldset>
          <legend className="text-xs text-ink/60">Alojamento</legend>
          <label className="mr-4"><input type="radio" name="alojamento" value="sim" defaultChecked={i.alojamento} /> Sim</label>
          <label><input type="radio" name="alojamento" value="nao" defaultChecked={!i.alojamento} /> Não</label>
        </fieldset>
        <div className="grid grid-cols-2 gap-3">
          <label><span className="text-xs text-ink/60">Tipo cama</span>
            <select name="tipoCama" defaultValue={i.tipoCama ?? ""} className="w-full border border-rule px-2 py-1 bg-transparent">
              <option value="">—</option><option value="baixo">baixo</option><option value="cima">cima</option>
            </select></label>
          <label><span className="text-xs text-ink/60">Chegada</span>
            <select name="dataChegada" defaultValue={i.dataChegada ?? ""} className="w-full border border-rule px-2 py-1 bg-transparent">
              <option value="">—</option>
              <option value="sabado_manha">Sábado manhã</option>
              <option value="sabado_tarde">Sábado tarde</option>
            </select></label>
        </div>
        <fieldset className="space-y-1">
          <legend className="text-xs text-ink/60">Refeições</legend>
          <label className="block"><input type="checkbox" name="almocoSabado" defaultChecked={i.almocoSabado} /> Almoço sábado</label>
          <label className="block"><input type="checkbox" name="jantarSabado" defaultChecked={i.jantarSabado} /> Jantar sábado</label>
          <label className="block"><input type="checkbox" name="lancheDomingo" defaultChecked={i.lancheDomingo} /> Lanche domingo</label>
        </fieldset>
        {state?.erro && <p className="text-red-700 text-sm">{state.erro}</p>}
        <div className="flex gap-3">
          <button className="bg-ink text-bone px-4 py-2">Salvar</button>
          <button type="button" onClick={onClose} className="border border-rule px-4 py-2">Cancelar</button>
        </div>
      </form>
    </td></tr>
  );
}
```

- [ ] **9.6 Página `/admin/inscricoes`**

`src/app/admin/inscricoes/page.tsx`:

```tsx
import { eq, desc } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { conferencias } from "@/lib/db/schema";
import { ListaInscricoes } from "@/components/admin/ListaInscricoes";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ conferenciaId?: string }>;
}) {
  const sp = await searchParams;
  const todas = await db.select().from(conferencias).orderBy(desc(conferencias.ano), desc(conferencias.mes));
  const ativa = todas.find((c) => c.status === "aberta") ?? todas[0];
  const selecionada = sp.conferenciaId
    ? todas.find((c) => c.id === Number(sp.conferenciaId))!
    : ativa;
  if (!selecionada) {
    return <p className="text-ink/60">Nenhuma conferência cadastrada.</p>;
  }
  return (
    <div className="space-y-8">
      <header className="flex items-baseline justify-between">
        <h1 className="font-display text-4xl">Inscrições · {selecionada.nome}</h1>
        <div className="flex gap-3 text-sm">
          <form className="flex gap-2">
            <select name="conferenciaId" defaultValue={selecionada.id}
              className="border border-rule px-2 py-1 bg-transparent">
              {todas.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </select>
            <button className="border border-rule px-3">Trocar</button>
          </form>
          <a href={`/admin/inscricoes/exportar?conferenciaId=${selecionada.id}`}
            className="border border-rule px-3 py-1">Exportar CSV</a>
        </div>
      </header>
      <ListaInscricoes conferenciaId={selecionada.id} />
    </div>
  );
}
```

- [ ] **9.7 Teste manual**
- Selecionar conferência diferente.
- Editar inscrição (mudar gênero/cama).
- Cancelar pelo painel → painel público atualiza.
- Baixar CSV → abre no Excel/LibreOffice com BOM UTF-8 correto.

- [ ] **9.8 Commit**

```bash
git add -A
git commit -m "feat: lista, edicao, cancelamento e exportacao CSV"
```

### CHECKPOINT FASE 9

Aprove com **"ok fase 9"**.

---

## FASE 10 — Dashboards + Vercel Cron + Deploy

**Objetivo:** Dashboards completos da conferência selecionada, cron diário de fechamento automático, deploy em produção no Vercel.

**Files:**
- Create: `src/app/admin/dashboards/page.tsx`, componentes em `src/components/admin/dashboards/`, `src/app/api/cron/fechar-conferencias/route.ts`
- Modify: `vercel.json`

### Tarefas

- [ ] **10.1 Componente `ResumoGeral`**

`src/components/admin/dashboards/ResumoGeral.tsx`:

```tsx
"use client";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";

export function ResumoGeral({ vagas }: any) {
  const data = [
    { nome: "Fem · baixo", ocupado: 26 - vagas.feminino.baixo, livre: vagas.feminino.baixo },
    { nome: "Fem · cima", ocupado: 24 - vagas.feminino.cima, livre: vagas.feminino.cima },
    { nome: "Mas · baixo", ocupado: 25 - vagas.masculino.baixo, livre: vagas.masculino.baixo },
    { nome: "Mas · cima", ocupado: 25 - vagas.masculino.cima, livre: vagas.masculino.cima },
  ];
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} stackOffset="sign">
        <XAxis dataKey="nome" stroke="#1A1611" fontSize={12} />
        <YAxis stroke="#1A1611" fontSize={12} />
        <Tooltip />
        <Bar dataKey="ocupado" stackId="a" fill="#8B5E3C" />
        <Bar dataKey="livre" stackId="a" fill="#D4A24C" />
      </BarChart>
    </ResponsiveContainer>
  );
}
```

- [ ] **10.2 Demais componentes de dashboard**

`src/components/admin/dashboards/PorGenero.tsx`:

```tsx
"use client";
import { Pie, PieChart, ResponsiveContainer, Cell, Tooltip } from "recharts";

export function PorGenero({ rows }: { rows: { genero: string; n: number }[] }) {
  const cores = ["#D4A24C", "#8B5E3C"];
  return (
    <ResponsiveContainer width="100%" height={240}>
      <PieChart>
        <Pie data={rows} dataKey="n" nameKey="genero" outerRadius={90} label>
          {rows.map((_, i) => <Cell key={i} fill={cores[i % cores.length]} />)}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  );
}
```

`src/components/admin/dashboards/PorDiscipulado.tsx`, `PorEstado.tsx`, `ContagemRefeicoes.tsx` — seguem padrão similar (BarChart horizontal para estados, tabela para refeições). Implementação completa:

```tsx
// PorDiscipulado.tsx
"use client";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
export function PorDiscipulado({ rows }: { rows: { discipulado: string; n: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={rows} layout="vertical">
        <XAxis type="number" stroke="#1A1611" fontSize={12} />
        <YAxis type="category" dataKey="discipulado" stroke="#1A1611" fontSize={12} width={120} />
        <Tooltip />
        <Bar dataKey="n" fill="#D4A24C" />
      </BarChart>
    </ResponsiveContainer>
  );
}
```

```tsx
// PorEstado.tsx (idêntico em estrutura)
"use client";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
export function PorEstado({ rows }: { rows: { estado: string; n: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={rows} layout="vertical">
        <XAxis type="number" stroke="#1A1611" fontSize={12} />
        <YAxis type="category" dataKey="estado" stroke="#1A1611" fontSize={12} width={50} />
        <Tooltip />
        <Bar dataKey="n" fill="#8B5E3C" />
      </BarChart>
    </ResponsiveContainer>
  );
}
```

```tsx
// ContagemRefeicoes.tsx
export function ContagemRefeicoes({ contagem }: { contagem: Record<string, number> }) {
  const linhas = [
    ["Almoço de sábado", contagem.almoco_sabado],
    ["Jantar de sábado", contagem.jantar_sabado],
    ["Café da manhã de domingo", contagem.cafe_domingo],
    ["Lanche de domingo", contagem.lanche_domingo],
  ];
  return (
    <table className="w-full text-sm">
      <tbody>
        {linhas.map(([rotulo, n]) => (
          <tr key={rotulo as string} className="border-b border-rule/60">
            <td className="py-2">{rotulo}</td>
            <td className="text-right num font-display text-xl">{n}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

- [ ] **10.3 Página de dashboards**

`src/app/admin/dashboards/page.tsx`:

```tsx
import { eq, desc, sql, and } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { conferencias, inscricoes } from "@/lib/db/schema";
import { calcularVagas } from "@/lib/vagas";
import { ResumoGeral } from "@/components/admin/dashboards/ResumoGeral";
import { PorGenero } from "@/components/admin/dashboards/PorGenero";
import { PorDiscipulado } from "@/components/admin/dashboards/PorDiscipulado";
import { PorEstado } from "@/components/admin/dashboards/PorEstado";
import { ContagemRefeicoes } from "@/components/admin/dashboards/ContagemRefeicoes";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ conferenciaId?: string }>;
}) {
  const sp = await searchParams;
  const todas = await db.select().from(conferencias).orderBy(desc(conferencias.ano), desc(conferencias.mes));
  if (todas.length === 0) return <p>Sem conferências.</p>;
  const sel = sp.conferenciaId
    ? todas.find((c) => c.id === Number(sp.conferenciaId))!
    : (todas.find((c) => c.status === "aberta") ?? todas[0]);

  const rowsAll = await db.select().from(inscricoes).where(eq(inscricoes.conferenciaId, sel.id));
  const ativos = rowsAll.filter((r) => r.status === "ativo");

  const vagas = calcularVagas(rowsAll as any);
  const porGenero = ["Masculino", "Feminino"].map((g) => ({
    genero: g, n: ativos.filter((a) => a.genero === g).length,
  }));
  const porDiscMap = new Map<string, number>();
  ativos.forEach((a) => porDiscMap.set(a.discipulado, (porDiscMap.get(a.discipulado) ?? 0) + 1));
  const porDisc = [...porDiscMap.entries()]
    .map(([discipulado, n]) => ({ discipulado, n }))
    .sort((a, b) => b.n - a.n);
  const porEstMap = new Map<string, number>();
  ativos.forEach((a) => porEstMap.set(a.estado, (porEstMap.get(a.estado) ?? 0) + 1));
  const porEst = [...porEstMap.entries()]
    .map(([estado, n]) => ({ estado, n }))
    .sort((a, b) => b.n - a.n)
    .slice(0, 12);
  const refs = {
    almoco_sabado: ativos.filter((a) => a.almocoSabado).length,
    jantar_sabado: ativos.filter((a) => a.jantarSabado).length,
    cafe_domingo: ativos.filter((a) => a.cafeDomingo).length,
    lanche_domingo: ativos.filter((a) => a.lancheDomingo).length,
  };

  return (
    <div className="space-y-12">
      <header className="flex items-baseline justify-between">
        <h1 className="font-display text-4xl">Dashboards · {sel.nome}</h1>
        <form>
          <select name="conferenciaId" defaultValue={sel.id}
            className="border border-rule px-2 py-1 bg-transparent text-sm"
            onChange={(e) => (e.target.form as HTMLFormElement).submit()}>
            {todas.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
          </select>
        </form>
      </header>

      <section className="grid grid-cols-3 gap-6 num">
        <Stat rotulo="Total inscritos" valor={ativos.length} />
        <Stat rotulo="Alojados" valor={vagas.totalAlojados} />
        <Stat rotulo="Não alojados" valor={ativos.length - vagas.totalAlojados} />
      </section>

      <Bloco titulo="Ocupação por alojamento"><ResumoGeral vagas={vagas} /></Bloco>
      <div className="grid grid-cols-2 gap-12">
        <Bloco titulo="Por gênero"><PorGenero rows={porGenero} /></Bloco>
        <Bloco titulo="Refeições"><ContagemRefeicoes contagem={refs} /></Bloco>
      </div>
      <Bloco titulo="Por discipulado"><PorDiscipulado rows={porDisc} /></Bloco>
      <Bloco titulo="Por estado (top 12)"><PorEstado rows={porEst} /></Bloco>
    </div>
  );
}

function Stat({ rotulo, valor }: { rotulo: string; valor: number }) {
  return (
    <div className="border border-rule p-6">
      <p className="text-xs uppercase tracking-[0.18em] text-clay">{rotulo}</p>
      <p className="font-display text-5xl mt-2">{valor}</p>
    </div>
  );
}
function Bloco({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="font-display text-2xl mb-4">{titulo}</h2>
      {children}
    </section>
  );
}
```

- [ ] **10.4 Vercel Cron — fechamento automático**

`vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/fechar-conferencias",
      "schedule": "0 3 * * *"
    }
  ]
}
```

`src/app/api/cron/fechar-conferencias/route.ts`:

```ts
import { and, eq, lt } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { conferencias } from "@/lib/db/schema";

export async function GET(req: Request) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }
  const fechadas = await db.update(conferencias)
    .set({ status: "fechada" })
    .where(and(eq(conferencias.status, "aberta"), lt(conferencias.inscricoesFim, new Date())))
    .returning({ id: conferencias.id });
  return Response.json({ fechadas: fechadas.length });
}
```

Adicionar `CRON_SECRET` em Vercel env vars (`vercel env add CRON_SECRET`).

- [ ] **10.5 Build final + deploy**

```bash
npm run build
npm test
```

Esperado: ambos verdes.

```bash
vercel --prod
```

Após deploy:
- Confirmar URL pública.
- Testar inscrição em produção.
- Verificar `vercel logs` no primeiro POST.
- Conferir cron registrado em **Vercel Dashboard → Settings → Cron Jobs**.

- [ ] **10.6 Commit final**

```bash
git add -A
git commit -m "feat: dashboards + vercel cron + deploy"
git tag v1.0.0
```

### CHECKPOINT FASE 10 (FINAL)

Aprove com **"ok fase 10"** após:
- [ ] App em produção no Vercel responde corretamente.
- [ ] Inscrição real em produção criou row no Neon.
- [ ] Painel público atualiza.
- [ ] Login admin funciona em produção.
- [ ] Cron job listado no dashboard Vercel.

---

## Self-review

1. **Cobertura do prompt.md:**
   - Painel de vagas em tempo real ✅ (Fase 6, `PainelVagas`)
   - Formulário com fluxos condicionais ✅ (Fase 6)
   - Validação cruzada de refeições ✅ (Fase 3 + Fase 6)
   - Café domingo automático para alojados ✅ (Fase 3, `validarRefeicoes`)
   - Código único MES+ANO-NNN ✅ (Fase 3 + 6)
   - Tela de impressão ✅ (Fase 6)
   - Cancelamento público ✅ (Fase 7)
   - Auth restrita 5 gestores ✅ (Fase 4)
   - Abrir/fechar conferência manual ✅ (Fase 8)
   - Apenas 1 ativa por vez ✅ (DB constraint Fase 2 + check Fase 8)
   - Histórico permanente ✅ (sem delete; status fechada)
   - Lista de inscritos + edit + cancel + export ✅ (Fase 9)
   - 6 dashboards do prompt: Resumo Geral ✅, Gênero ✅, Discipulado ✅, Cidade/Estado ✅, Refeições ✅, Lista exportável ✅
   - Não há jantar de sexta nem café de sábado (decisão Q7 = B)
   - Não há atribuição de cama numerada (decisão Q8 = A)
   - Sem rascunho, sem countdown (decisão Q9)
   - Cron de fechamento ✅ (Fase 10)
   - Anti-spam honeypot + rate limit ✅ (Fase 6)
   - Email só armazenado, sem envio ✅
2. **Sem placeholders TBD.**
3. **Consistência de tipos:** `Inscricao` usa `tipoCama: "baixo"|"cima"|null`, `dataChegada: "sabado_manha"|"sabado_tarde"|null`, refeições booleanas — coerente entre schema, lib/, actions e componentes.

Plano completo e auditado.
