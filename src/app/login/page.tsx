"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { loginAction } from "@/server/actions/auth";

function Botao() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full bg-ink text-bone py-3 font-display tracking-wide hover:bg-clay transition-colors disabled:opacity-50"
    >
      {pending ? "Entrando…" : "Entrar"}
    </button>
  );
}

export default function LoginPage() {
  const [state, action] = useActionState(loginAction, { erro: "" });
  const [mostrarSenha, setMostrarSenha] = useState(false);
  return (
    <main className="min-h-screen grid place-items-center px-6">
      <div className="w-full max-w-sm">
        <p className="text-xs uppercase tracking-[0.2em] text-clay">Área restrita</p>
        <h1 className="font-display text-4xl mt-2">
          <span className="display-italic">Coordenação</span>
        </h1>
        <hr className="my-6" />
        <form action={action} className="space-y-4">
          <label className="block">
            <span className="text-sm text-ink/70">Login</span>
            <input
              name="login"
              required
              autoFocus
              className="mt-1 w-full border border-rule bg-transparent px-3 py-2 outline-none focus:border-ink"
            />
          </label>
          <label className="block">
            <span className="text-sm text-ink/70">Senha</span>
            <div className="relative mt-1">
              <input
                name="senha"
                type={mostrarSenha ? "text" : "password"}
                required
                className="w-full border border-rule bg-transparent pl-3 pr-10 py-2 outline-none focus:border-ink"
              />
              <button
                type="button"
                onClick={() => setMostrarSenha((v) => !v)}
                aria-label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-ink/50 hover:text-ink"
              >
                {mostrarSenha ? (
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a18.5 18.5 0 0 1 5.06-5.94" />
                    <path d="M9.9 4.24A10.94 10.94 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </label>
          {state?.erro && <p className="text-sm text-red-700">{state.erro}</p>}
          <Botao />
        </form>
        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-xs uppercase tracking-[0.2em] text-clay hover:text-ink"
          >
            ← voltar à página pública
          </Link>
        </div>
      </div>
    </main>
  );
}
