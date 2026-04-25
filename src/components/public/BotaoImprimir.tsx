"use client";

export function BotaoImprimir() {
  return (
    <button
      onClick={() => window.print()}
      className="px-6 py-3 bg-ink text-bone hover:bg-clay transition-colors"
    >
      Imprimir / Salvar PDF
    </button>
  );
}
