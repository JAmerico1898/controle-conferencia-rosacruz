import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { db } from "@/lib/db/client";
import { inscricoes, conferencias } from "@/lib/db/schema";
import { BotaoImprimir } from "@/components/public/BotaoImprimir";

export const dynamic = "force-dynamic";

export default async function Page({
  params,
}: {
  params: Promise<{ codigo: string }>;
}) {
  const { codigo } = await params;
  const [reg] = await db
    .select()
    .from(inscricoes)
    .innerJoin(conferencias, eq(inscricoes.conferenciaId, conferencias.id))
    .where(eq(inscricoes.codigo, codigo));
  if (!reg) notFound();
  const i = reg.inscricoes;
  const c = reg.conferencias;
  const refs = [
    i.almocoSabado && "Almoço sábado",
    i.jantarSabado && "Jantar sábado",
    i.lancheDomingo && "Lanche domingo",
    i.cafeDomingo && "Café domingo",
  ]
    .filter(Boolean)
    .join(" · ") || "—";
  return (
    <main className="mx-auto max-w-2xl px-6 py-16 print:py-0">
      <p className="text-xs uppercase tracking-[0.2em] text-clay">Inscrição confirmada</p>
      <h1 className="mt-3 font-display text-4xl">
        <span className="display-italic">{i.nome}</span>
      </h1>
      <p className="mt-1 text-ink/60">
        Conferência de {c.nome} · código <span className="num">{i.codigo}</span>
      </p>
      <hr className="my-8" />
      <dl className="grid grid-cols-[max-content_1fr] gap-x-8 gap-y-3 text-sm">
        <Linha k="Gênero" v={i.genero} />
        <Linha k="Cidade/Estado" v={`${i.cidade} / ${i.estado}`} />
        <Linha k="Discipulado" v={i.discipulado} />
        <Linha
          k="Alojamento"
          v={
            i.alojamento
              ? `Sim · ${i.tipoCama === "baixo" ? "cama de baixo" : "cama de cima"}`
              : "Não"
          }
        />
        {i.alojamento && (
          <Linha
            k="Chegada"
            v={i.dataChegada === "sabado_manha" ? "Sábado de manhã" : "Sábado à tarde"}
          />
        )}
        <Linha k="Refeições" v={refs} />
        <Linha k="Email" v={i.email} />
      </dl>
      {i.cafeDomingo && (
        <p className="mt-6 text-sm italic text-ink/60">
          O café da manhã de domingo está incluído para todos os alunos alojados.
        </p>
      )}
      <hr className="my-8" />
      <div className="flex gap-4 print:hidden">
        <BotaoImprimir />
        <a href="/" className="px-6 py-3 border border-rule">
          Voltar
        </a>
      </div>
    </main>
  );
}

function Linha({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <>
      <dt className="text-ink/50 uppercase tracking-wide text-xs">{k}</dt>
      <dd>{v}</dd>
    </>
  );
}
