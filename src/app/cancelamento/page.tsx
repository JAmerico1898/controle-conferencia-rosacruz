import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { FormularioCancelamento } from "@/components/public/FormularioCancelamento";

export default function Page() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-2xl px-6 py-16 space-y-8">
        <header>
          <p className="text-xs uppercase tracking-[0.2em] text-clay">Cancelamento</p>
          <h1 className="mt-3 font-display text-4xl">
            Cancelar <span className="display-italic">inscrição</span>
          </h1>
        </header>
        <hr />
        <FormularioCancelamento />
      </main>
      <SiteFooter />
    </>
  );
}
