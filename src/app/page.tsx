import Link from "next/link";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";

export const dynamic = "force-dynamic";
import { conferencias } from "@/lib/db/schema";
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
      <Hero />
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
            <header className="flex items-baseline justify-between gap-4 flex-wrap mb-6">
              <h2 className="font-display text-3xl">Formulário de inscrição</h2>
              <Link
                href="/cancelamento"
                className="text-sm text-ink/60 hover:text-ink"
              >
                Cancelar inscrição
              </Link>
            </header>
            <FormularioInscricao />
          </section>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
