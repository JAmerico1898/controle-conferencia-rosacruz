import { desc } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { conferencias } from "@/lib/db/schema";
import { fecharConferenciaAction } from "@/server/actions/conferencia";

export async function HistoricoConferencias() {
  const lista = await db
    .select()
    .from(conferencias)
    .orderBy(desc(conferencias.ano), desc(conferencias.mes));
  if (lista.length === 0) {
    return <p className="text-ink/60 text-sm">Nenhuma conferência registrada.</p>;
  }
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
              {new Date(c.inscricoesAbertura).toLocaleDateString("pt-BR")} –{" "}
              {new Date(c.inscricoesFim).toLocaleDateString("pt-BR")}
            </td>
            <td>
              <span
                className={`px-2 py-0.5 text-xs ${
                  c.status === "aberta" ? "bg-saffron/30" : "bg-ink/10"
                }`}
              >
                {c.status}
              </span>
            </td>
            <td className="text-right">
              {c.status === "aberta" && (
                <form action={fecharConferenciaAction}>
                  <input type="hidden" name="id" value={c.id} />
                  <button className="text-clay hover:text-ink underline">
                    fechar
                  </button>
                </form>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
