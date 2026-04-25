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

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
