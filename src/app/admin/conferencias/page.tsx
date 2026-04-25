import { ConferenciaForm } from "@/components/admin/ConferenciaForm";
import { HistoricoConferencias } from "@/components/admin/HistoricoConferencias";

export default function Page() {
  return (
    <div className="space-y-12">
      <header>
        <h1 className="font-display text-4xl">Gestão de conferências</h1>
        <p className="text-ink/60 mt-1">Abrir, fechar e consultar o histórico.</p>
      </header>
      <ConferenciaForm ano={new Date().getFullYear()} />
      <section>
        <h2 className="font-display text-2xl mb-4">Histórico</h2>
        <HistoricoConferencias />
      </section>
    </div>
  );
}
