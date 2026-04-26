import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-rule mt-16">
      <div className="mx-auto max-w-4xl px-6 py-6 flex items-center justify-between text-xs text-ink/50">
        <span>
          Escola Espiritual da Rosacruz Áurea · Centro de Conferências O NOVO
          SOL · Rio Bonito-RJ
        </span>
        <Link href="/login" className="hover:text-ink">
          ⚙ área administrativa
        </Link>
      </div>
    </footer>
  );
}
