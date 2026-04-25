# Controle de Conferências — O Novo Sol

Aplicativo Next.js para gerir inscrições nas conferências mensais do centro **O Novo Sol**, da Escola Espiritual da Rosacruz Áurea.

## Stack

- **Next.js 15** (App Router, Server Actions, RSC)
- **TypeScript** strict
- **Tailwind CSS** com tema editorial (Fraunces + DM Sans)
- **Drizzle ORM** + **Postgres** (Neon via Vercel Marketplace)
- **JWT cookie** (jose) + **bcryptjs** para auth dos 5 gestores
- **Recharts** nos dashboards
- **Vitest** nas regras de negócio (37 testes)
- **Vercel Cron** para fechamento automático

## Decisões de produto travadas

- Conferência começa **sábado** — chegada `Sábado manhã/tarde`; refeições: almoço sábado, jantar sábado, lanche domingo, café domingo (alojados).
- Atribuição de cama é **só contagem** (não há número de cama atribuído pelo sistema).
- Estados da conferência: `aberta` ou `fechada` (sem rascunho). Apenas 1 aberta por vez.
- Email do aluno é **só armazenado** (sem disparo automático).
- Anti-spam: honeypot + rate limit em memória (5/h por IP).
- Cancelamentos preservam o registro (`status='cancelado'`, nunca DELETE).

## Setup inicial (uma vez)

### 1. Provisionar Neon Postgres no Vercel

```bash
vercel login
vercel link        # criar projeto novo: controle-conferencia
```

No dashboard Vercel → **Storage → Marketplace → Neon** → instalar (free tier) e conectar ao projeto.

```bash
vercel env pull .env.local   # baixa DATABASE_URL
```

### 2. Configurar variáveis de ambiente

Gerar um `SESSION_SECRET` (mínimo 32 chars):

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Gerar hash bcrypt para cada um dos 5 gestores:

```bash
npx tsx scripts/hash-senha.ts senha_do_admin1
npx tsx scripts/hash-senha.ts senha_do_admin2
# ... etc
```

Adicione ao `.env.local`:

```
DATABASE_URL=postgres://...   # já vindo do vercel env pull
SESSION_SECRET=<hex de 96 chars>
ADMIN_USERS=admin1:$2a$10$hash1,admin2:$2a$10$hash2,admin3:$2a$10$hash3,admin4:$2a$10$hash4,admin5:$2a$10$hash5
CRON_SECRET=<hex aleatório, qualquer tamanho razoável>
```

Replique as 4 vars no Vercel:

```bash
vercel env add SESSION_SECRET production
vercel env add ADMIN_USERS production
vercel env add CRON_SECRET production
# DATABASE_URL já está lá automaticamente via Marketplace
```

### 3. Aplicar schema no Neon

```bash
npm run db:push
```

(Usa `drizzle/0000_*.sql` — apenas na primeira vez ou quando schema mudar.)

### 4. (opcional) Criar conferência inicial via seed

```bash
npm run db:seed
```

Cria a conferência "Maio 2026" como `aberta`, para validar o fluxo público.

## Desenvolvimento local

```bash
npm install
npm run dev          # http://localhost:3000
npm test             # 37 testes da camada de regras
npm run db:studio    # Drizzle Studio (browse no DB)
```

## Deploy

```bash
vercel --prod
```

Após deploy, no painel Vercel verificar **Settings → Cron Jobs** que o `/api/cron/fechar-conferencias` está agendado para 03:00 UTC diário.

## Estrutura

```
src/
├── app/                       App Router
│   ├── layout.tsx             fontes Fraunces+DM Sans, html lang=pt-BR
│   ├── page.tsx               área pública (painel + formulário)
│   ├── login/page.tsx
│   ├── cancelamento/page.tsx
│   ├── inscricao/[codigo]/imprimir/page.tsx
│   ├── admin/                 área restrita (guard via layout)
│   │   ├── layout.tsx
│   │   ├── conferencias/page.tsx
│   │   ├── inscricoes/page.tsx
│   │   ├── inscricoes/exportar/route.ts   (CSV)
│   │   └── dashboards/page.tsx
│   └── api/cron/fechar-conferencias/route.ts
├── components/
│   ├── public/                PainelVagas, FormularioInscricao, ...
│   ├── admin/                 Lista, Editar, ConferenciaForm, ...
│   └── admin/dashboards/      Recharts
├── lib/                       regras puras (testadas com Vitest)
│   ├── nome.ts                normalização de chave única
│   ├── codigo-inscricao.ts    MES+ANO-NNN
│   ├── refeicoes.ts           validação cruzada
│   ├── vagas.ts               cálculo de contadores
│   ├── conferencias.ts        validação de abertura
│   ├── inscricoes.ts          schema Zod + validação
│   ├── auth.ts                JWT cookie + bcrypt
│   ├── rate-limit.ts          honeypot/IP
│   ├── exportar.ts            CSV
│   ├── constants.ts           capacidades, estados, meses
│   └── db/                    Drizzle schema + client
└── server/actions/            Server Actions
    ├── auth.ts
    ├── inscricao.ts           pública: criar, buscar, cancelar
    ├── conferencia.ts         abrir, fechar
    └── admin-inscricao.ts     editar, cancelar (gestor)
```

## Regras de negócio cobertas por testes

```
tests/lib/
├── nome.test.ts               normalização (chave única)
├── codigo-inscricao.test.ts   formato MES+ANO-NNN, rejeição jan/jul
├── refeicoes.test.ts          permitidas + validação cruzada
├── vagas.test.ts              cálculo + esgotamento
├── conferencias.test.ts       validação abertura + fechamento automático
├── inscricoes.test.ts         schema Zod completo
├── auth.test.ts               parsing env + verificação bcrypt
├── rate-limit.test.ts         janela + isolamento por chave
└── exportar.test.ts           CSV com escape de aspas/vírgulas
```

`npm test` → **37 passed**.
