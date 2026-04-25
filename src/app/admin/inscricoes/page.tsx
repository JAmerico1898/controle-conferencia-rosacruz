import { desc } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { conferencias } from "@/lib/db/schema";
import { ListaInscricoes } from "@/components/admin/ListaInscricoes";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ conferenciaId?: string }>;
}) {
  const sp = await searchParams;
  const todas = await db
    .select()
    .from(conferencias)
    .orderBy(desc(conferencias.ano), desc(conferencias.mes));
  if (todas.length === 0) {
    return <p className="text-ink/60">Nenhuma conferência cadastrada.</p>;
  }
  const ativa = todas.find((c) => c.status === "aberta") ?? todas[0];
  const selecionada = sp.conferenciaId
    ? todas.find((c) => c.id === Number(sp.conferenciaId)) ?? ativa
    : ativa;
  return (
    <div className="space-y-8">
      <header className="flex items-baseline justify-between gap-4 flex-wrap">
        <h1 className="font-display text-4xl">
          Inscrições · <span className="display-italic">{selecionada.nome}</span>
        </h1>
        <div className="flex gap-3 text-sm items-center">
          <form className="flex gap-2">
            <select
              name="conferenciaId"
              defaultValue={selecionada.id}
              className="border border-rule px-2 py-1 bg-transparent"
            >
              {todas.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nome}
                </option>
              ))}
            </select>
            <button className="border border-rule px-3">Trocar</button>
          </form>
          <a
            href={`/admin/inscricoes/exportar?conferenciaId=${selecionada.id}`}
            className="border border-rule px-3 py-1 hover:bg-ink hover:text-bone"
          >
            Exportar CSV
          </a>
        </div>
      </header>
      <ListaInscricoes conferenciaId={selecionada.id} />
    </div>
  );
}
