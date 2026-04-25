import Link from "next/link";
import { logoutAction } from "@/server/actions/auth";

const itens = [
  { href: "/admin/conferencias", label: "Conferência" },
  { href: "/admin/inscricoes", label: "Inscrições" },
  { href: "/admin/dashboards", label: "Dashboards" },
];

export function AdminNav({ login }: { login: string }) {
  return (
    <header className="border-b border-rule bg-bone/80 backdrop-blur sticky top-0 z-10">
      <div className="mx-auto max-w-6xl px-6 py-4 flex items-baseline justify-between gap-6">
        <Link href="/admin/conferencias" className="font-display text-xl">
          O <span className="display-italic text-saffron">Novo Sol</span>
          <span className="ml-2 text-xs uppercase tracking-[0.2em] text-clay">
            coordenação
          </span>
        </Link>
        <nav className="flex items-center gap-6 text-sm">
          {itens.map((i) => (
            <Link
              key={i.href}
              href={i.href}
              className="text-ink/70 hover:text-ink transition-colors"
            >
              {i.label}
            </Link>
          ))}
          <Link href="/" className="text-ink/50 hover:text-ink transition-colors">
            ↗ Área pública
          </Link>
          <form action={logoutAction}>
            <button className="text-ink/50 hover:text-ink">{login} · sair</button>
          </form>
        </nav>
      </div>
    </header>
  );
}
