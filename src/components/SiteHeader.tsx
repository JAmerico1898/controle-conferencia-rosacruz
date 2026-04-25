import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="border-b border-rule">
      <div className="mx-auto max-w-4xl px-6 py-6 flex items-baseline justify-between">
        <Link href="/" className="font-display text-2xl">
          O <span className="display-italic text-saffron">Novo Sol</span>
        </Link>
        <Link href="/cancelamento" className="text-sm text-ink/60 hover:text-ink">
          Cancelar inscrição
        </Link>
      </div>
    </header>
  );
}
