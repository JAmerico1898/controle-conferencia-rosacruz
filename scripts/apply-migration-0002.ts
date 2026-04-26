import { config } from "dotenv";
import postgres from "postgres";

config({ path: ".env.local" });
config();

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL não definido");

const sql = postgres(url, { prepare: false });

async function main() {
  const cols = await sql<{ column_name: string }[]>`
    SELECT column_name FROM information_schema.columns
    WHERE table_name = 'conferencias'
      AND column_name IN ('extra_feminino', 'extra_masculino')
  `;
  const presentes = new Set(cols.map((c) => c.column_name));

  if (!presentes.has("extra_feminino")) {
    await sql`ALTER TABLE "conferencias" ADD COLUMN "extra_feminino" boolean DEFAULT false NOT NULL`;
    console.log("ok: extra_feminino adicionada");
  } else {
    console.log("já existe: extra_feminino");
  }

  if (!presentes.has("extra_masculino")) {
    await sql`ALTER TABLE "conferencias" ADD COLUMN "extra_masculino" boolean DEFAULT false NOT NULL`;
    console.log("ok: extra_masculino adicionada");
  } else {
    console.log("já existe: extra_masculino");
  }

  await sql.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
