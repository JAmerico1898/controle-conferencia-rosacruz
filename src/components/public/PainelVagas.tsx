import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { conferencias, inscricoes } from "@/lib/db/schema";
import { calcularVagas, type InscricaoMin } from "@/lib/vagas";

export async function PainelVagas() {
  const [conf] = await db
    .select()
    .from(conferencias)
    .where(eq(conferencias.status, "aberta"));
  if (!conf) {
    return (
      <section className="border border-rule p-8 text-center font-display">
        <p className="text-ink/70">
          As inscrições para a próxima conferência ainda não foram abertas.
          Aguarde comunicação da coordenação.
        </p>
      </section>
    );
  }
  const lista = await db
    .select({
      genero: inscricoes.genero,
      alojamento: inscricoes.alojamento,
      tipoCama: inscricoes.tipoCama,
      status: inscricoes.status,
    })
    .from(inscricoes)
    .where(eq(inscricoes.conferenciaId, conf.id));
  const v = calcularVagas(
    lista as InscricaoMin[],
    conf.predioFeminino,
    conf.predioMasculino,
  );
  const ativos = lista.filter((i) => i.status === "ativo").length;
  const fim = new Date(conf.inscricoesFim).toLocaleDateString("pt-BR");
  return (
    <section className="border border-rule p-8 space-y-6 font-display">
      <header className="flex items-baseline justify-between gap-4 flex-wrap">
        <h2 className="text-2xl">
          Conferência de {conf.nome}
        </h2>
        <span className="text-xs uppercase tracking-[0.2em] text-clay">
          inscrições até {fim}
        </span>
      </header>
      <div className="grid grid-cols-2 gap-4 num">
        <Bloco
          titulo="Alojamento feminino"
          baixo={v.feminino.baixo}
          cima={v.feminino.cima}
          align="left"
        />
        <Bloco
          titulo="Alojamento masculino"
          baixo={v.masculino.baixo}
          cima={v.masculino.cima}
          align="right"
        />
      </div>
      <hr />
      <p className="text-sm text-ink/60">
        <span className="num text-ink">{v.totalAlojados}</span> alojados ·{" "}
        <span className="num text-ink">{ativos}</span> inscritos no total
      </p>
    </section>
  );
}

function Bloco({
  titulo,
  baixo,
  cima,
  align,
}: {
  titulo: string;
  baixo: number;
  cima: number;
  align: "left" | "right";
}) {
  const side = align === "left" ? "text-left pl-10" : "text-right pr-10";
  return (
    <div className={side}>
      <p className="text-xs uppercase tracking-[0.18em] text-clay">{titulo}</p>
      <p className="mt-2 text-3xl">
        <span className={baixo === 0 ? "text-ink/30" : ""}>{baixo}</span>
        <span className="text-ink/30 text-xl mx-2">/</span>
        <span className={cima === 0 ? "text-ink/30" : ""}>{cima}</span>
      </p>
      <p className="text-xs text-ink/50">camas baixo · cima</p>
    </div>
  );
}
