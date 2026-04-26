import { eq, desc } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { conferencias } from "@/lib/db/schema";
import { PREDIOS } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function Page() {
  const [conf] = await db
    .select()
    .from(conferencias)
    .orderBy(desc(conferencias.ano), desc(conferencias.mes))
    .where(eq(conferencias.status, "aberta"))
    .limit(1);

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-display text-4xl">Relatórios</h1>
        <p className="text-ink/60 mt-1">
          Gere o documento de distribuição de camas por prédio.
        </p>
      </header>

      {!conf ? (
        <p className="border border-rule p-6 text-ink/70">
          Não há conferência aberta. Abra uma conferência para gerar relatórios.
        </p>
      ) : (
        <section className="space-y-4">
          <p className="text-sm text-ink/70">
            Conferência:{" "}
            <span className="font-display text-ink">{conf.nome}</span> ·
            Feminino em{" "}
            <span className="text-ink">
              {PREDIOS[conf.predioFeminino].label}
            </span>{" "}
            · Masculino em{" "}
            <span className="text-ink">
              {PREDIOS[conf.predioMasculino].label}
            </span>
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <BotaoRelatorio predio="antigo" />
            <BotaoRelatorio predio="novo" />
          </div>
        </section>
      )}
    </div>
  );
}

function BotaoRelatorio({ predio }: { predio: "antigo" | "novo" }) {
  const cfg = PREDIOS[predio];
  return (
    <a
      href={`/admin/relatorios/${predio}`}
      className="border border-rule p-6 hover:border-ink transition-colors flex flex-col gap-2"
    >
      <span className="font-display text-2xl">{cfg.label}</span>
      <span className="text-xs uppercase tracking-[0.18em] text-clay">
        {cfg.quartos} quarto{cfg.quartos > 1 ? "s" : ""} ·{" "}
        {cfg.baixo} baixo / {cfg.cima} cima
      </span>
      <span className="text-xs text-ink/50 mt-2">
        ↓ baixar <span className="num">.docx</span>
      </span>
    </a>
  );
}
