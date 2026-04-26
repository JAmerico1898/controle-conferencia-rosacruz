import type { Metadata } from "next";
import { Fraunces, DM_Sans, Cinzel } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const cinzel = Cinzel({
  subsets: ["latin"],
  weight: ["500", "600"],
  variable: "--font-title",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Conferências — O Novo Sol",
  description:
    "Inscrições para as conferências mensais do centro O Novo Sol — Escola Espiritual da Rosacruz Áurea.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="pt-BR"
      className={`${fraunces.variable} ${dmSans.variable} ${cinzel.variable}`}
    >
      <body className="min-h-screen bg-bone text-ink antialiased">
        {children}
      </body>
    </html>
  );
}
