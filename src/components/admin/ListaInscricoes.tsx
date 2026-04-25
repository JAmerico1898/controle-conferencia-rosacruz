import { eq, desc } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { inscricoes } from "@/lib/db/schema";
import { LinhaInscricao } from "./LinhaInscricao";

export async function ListaInscricoes({
  conferenciaId,
}: {
  conferenciaId: number;
}) {
  const rows = await db
    .select()
    .from(inscricoes)
    .where(eq(inscricoes.conferenciaId, conferenciaId))
    .orderBy(desc(inscricoes.criadoEm));
  if (rows.length === 0) {
    return <p className="text-ink/60 text-sm">Sem inscrições para esta conferência.</p>;
  }
  return (
    <div className="overflow-x-auto">
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
          {rows.map((i) => (
            <LinhaInscricao key={i.id} inscricao={i} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
