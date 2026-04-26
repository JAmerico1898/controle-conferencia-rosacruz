import Link from "next/link";

type Props = { variant?: "solid" | "overlay" };

export function SiteHeader({ variant = "solid" }: Props) {
  const overlay = variant === "overlay";
  return (
    <header
      className={
        overlay
          ? "absolute inset-x-0 top-0 z-20 bg-transparent"
          : "border-b border-rule"
      }
    >
      <div className="mx-auto max-w-4xl px-6 py-6 flex items-baseline justify-end">
        <Link
          href="/cancelamento"
          className={
            overlay
              ? "text-sm text-goldDeep/70 hover:text-goldDeep"
              : "text-sm text-ink/60 hover:text-ink"
          }
        >
          Cancelar inscrição
        </Link>
      </div>
    </header>
  );
}
