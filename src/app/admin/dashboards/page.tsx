import { eq, desc } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { conferencias, inscricoes } from "@/lib/db/schema";
import { calcularVagas, type InscricaoMin } from "@/lib/vagas";
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
  const todas = await db
    .select()
    .from(conferencias)
    .orderBy(desc(conferencias.ano), desc(conferencias.mes));
  if (todas.length === 0) {
    return <p className="text-ink/60">Sem conferências.</p>;
  }
  const sel = sp.conferenciaId
    ? todas.find((c) => c.id === Number(sp.conferenciaId)) ?? todas[0]
    : todas.find((c) => c.status === "aberta") ?? todas[0];

  const rowsAll = await db
    .select()
    .from(inscricoes)
    .where(eq(inscricoes.conferenciaId, sel.id));
  const ativos = rowsAll.filter((r) => r.status === "ativo");

  const vagas = calcularVagas(
    rowsAll as InscricaoMin[],
    sel.predioFeminino,
    sel.predioMasculino,
  );
  const porGenero = ["Masculino", "Feminino"].map((g) => ({
    genero: g,
    n: ativos.filter((a) => a.genero === g).length,
  }));
  const porDiscMap = new Map<string, number>();
  ativos.forEach((a) =>
    porDiscMap.set(a.discipulado, (porDiscMap.get(a.discipulado) ?? 0) + 1),
  );
  const porDisc = [...porDiscMap.entries()]
    .map(([discipulado, n]) => ({ discipulado, n }))
    .sort((a, b) => b.n - a.n);
  const porEstMap = new Map<string, number>();
  ativos.forEach((a) =>
    porEstMap.set(a.estado, (porEstMap.get(a.estado) ?? 0) + 1),
  );
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
      <header className="flex items-baseline justify-between gap-4 flex-wrap">
        <h1 className="font-display text-4xl">
          Dashboards · <span className="display-italic">{sel.nome}</span>
        </h1>
        <form>
          <select
            name="conferenciaId"
            defaultValue={sel.id}
            className="border border-rule px-2 py-1 bg-transparent text-sm"
          >
            {todas.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </select>
          <button className="ml-2 border border-rule px-3 py-1 text-sm">
            Trocar
          </button>
        </form>
      </header>

      <section className="grid grid-cols-1 sm:grid-cols-3 gap-6 num">
        <Stat rotulo="Total inscritos" valor={ativos.length} />
        <Stat rotulo="Alojados" valor={vagas.totalAlojados} />
        <Stat rotulo="Não alojados" valor={ativos.length - vagas.totalAlojados} />
      </section>

      <Bloco titulo="Ocupação por alojamento">
        <ResumoGeral vagas={vagas} />
      </Bloco>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <Bloco titulo="Por gênero">
          <PorGenero rows={porGenero} />
        </Bloco>
        <Bloco titulo="Refeições">
          <ContagemRefeicoes contagem={refs} />
        </Bloco>
      </div>
      <Bloco titulo="Por discipulado">
        <PorDiscipulado rows={porDisc} />
      </Bloco>
      <Bloco titulo="Por estado (top 12)">
        <PorEstado rows={porEst} />
      </Bloco>
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

function Bloco({
  titulo,
  children,
}: {
  titulo: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="font-display text-2xl mb-4">{titulo}</h2>
      {children}
    </section>
  );
}
