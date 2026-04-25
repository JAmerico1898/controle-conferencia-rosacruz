import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { conferencias } from "@/lib/db/schema";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { PainelVagas } from "@/components/public/PainelVagas";
import { FormularioInscricao } from "@/components/public/FormularioInscricao";

export default async function Home() {
  const [conf] = await db
    .select()
    .from(conferencias)
    .where(eq(conferencias.status, "aberta"));
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-6 py-12 space-y-12 relative">
        <div className="grain absolute inset-0 -z-10" />
        <header>
          <p className="text-xs uppercase tracking-[0.2em] text-clay">
            Centro de Conferências O Novo Sol · Rio Bonito-RJ
          </p>
          <h1 className="mt-3 font-display text-5xl leading-[1.05]">
            Inscrições
            <br />
            <span className="display-italic text-saffron">
              {conf?.nome ?? "próxima conferência"}
            </span>
          </h1>
        </header>
        <PainelVagas />
        {conf && (
          <section>
            <h2 className="font-display text-3xl mb-6">Formulário de inscrição</h2>
            <FormularioInscricao />
          </section>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
