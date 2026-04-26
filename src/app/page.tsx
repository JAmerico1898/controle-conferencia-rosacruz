import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";

export const dynamic = "force-dynamic";
import { conferencias } from "@/lib/db/schema";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Hero } from "@/components/public/Hero/Hero";
import { PainelVagas } from "@/components/public/PainelVagas";
import { FormularioInscricao } from "@/components/public/FormularioInscricao";

export default async function Home() {
  const [conf] = await db
    .select()
    .from(conferencias)
    .where(eq(conferencias.status, "aberta"));
  return (
    <>
      <div className="relative">
        <SiteHeader variant="overlay" />
        <Hero />
      </div>
      <main className="mx-auto max-w-3xl px-6 py-12 space-y-12 relative">
        <div className="grain absolute inset-0 -z-10" />
        <p className="text-xs uppercase tracking-[0.2em] text-clay">
          Próxima conferência:{" "}
          <span className="font-display normal-case tracking-normal text-base text-ink">
            {conf?.nome ?? "a anunciar"}
          </span>
        </p>
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
