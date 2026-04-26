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
    WHERE table_name = 'inscricoes' AND column_name IN ('email', 'whatsapp')
  `;
  const tem = (n: string) => cols.some((c) => c.column_name === n);

  if (tem("whatsapp") && !tem("email")) {
    console.log("já migrado: coluna 'whatsapp' presente.");
  } else if (tem("email") && !tem("whatsapp")) {
    await sql`ALTER TABLE "inscricoes" RENAME COLUMN "email" TO "whatsapp"`;
    console.log("ok: email → whatsapp");
  } else {
    throw new Error(
      `estado inesperado: cols=${cols.map((c) => c.column_name).join(",")}`,
    );
  }

  await sql.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
