import { config } from "dotenv";
import postgres from "postgres";

config({ path: ".env.local" });
config();

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL não definido");

const sql = postgres(url, { prepare: false });

async function main() {
  const [{ count: i0 }] = await sql<{ count: number }[]>`
    SELECT COUNT(*)::int AS count FROM inscricoes
  `;
  const [{ count: c0 }] = await sql<{ count: number }[]>`
    SELECT COUNT(*)::int AS count FROM conferencias
  `;
  console.log(`antes: inscricoes=${i0}, conferencias=${c0}`);

  await sql`TRUNCATE TABLE inscricoes RESTART IDENTITY CASCADE`;
  await sql`TRUNCATE TABLE conferencias RESTART IDENTITY CASCADE`;

  const [{ count: i1 }] = await sql<{ count: number }[]>`
    SELECT COUNT(*)::int AS count FROM inscricoes
  `;
  const [{ count: c1 }] = await sql<{ count: number }[]>`
    SELECT COUNT(*)::int AS count FROM conferencias
  `;
  console.log(`depois: inscricoes=${i1}, conferencias=${c1}`);
  await sql.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
