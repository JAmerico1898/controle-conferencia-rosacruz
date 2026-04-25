"use client";

import { useActionState } from "react";
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
            <input
              name="senha"
              type="password"
              required
              className="mt-1 w-full border border-rule bg-transparent px-3 py-2 outline-none focus:border-ink"
            />
          </label>
          {state?.erro && <p className="text-sm text-red-700">{state.erro}</p>}
          <Botao />
        </form>
      </div>
    </main>
  );
}
