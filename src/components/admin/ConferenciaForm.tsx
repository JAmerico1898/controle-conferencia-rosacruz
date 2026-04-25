"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { abrirConferenciaAction } from "@/server/actions/conferencia";
import { MESES_CONFERENCIA } from "@/lib/constants";

function Btn() {
  const { pending } = useFormStatus();
  return (
    <button
      className="bg-ink text-bone px-6 py-3 disabled:opacity-50 hover:bg-clay transition-colors"
      disabled={pending}
    >
      {pending ? "Abrindo…" : "Abrir inscrições"}
    </button>
  );
}

export function ConferenciaForm({ ano }: { ano: number }) {
  const [state, action] = useActionState(abrirConferenciaAction, { erro: "" });
  return (
    <form action={action} className="space-y-4 border border-rule p-6">
      <h3 className="font-display text-2xl">Abrir nova conferência</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <label className="block">
          <span className="text-sm text-ink/70">Mês</span>
          <select
            name="mes"
            required
            defaultValue={MESES_CONFERENCIA[0].num}
            className="mt-1 w-full border border-rule px-3 py-2 bg-transparent"
          >
            {MESES_CONFERENCIA.map((m) => (
              <option key={m.num} value={m.num}>
                {m.nome}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-sm text-ink/70">Ano</span>
          <input
            name="ano"
            type="number"
            defaultValue={ano}
            required
            className="mt-1 w-full border border-rule px-3 py-2 bg-transparent num"
          />
        </label>
        <label className="block">
          <span className="text-sm text-ink/70">Início das inscrições</span>
          <input
            name="inicio"
            type="datetime-local"
            required
            className="mt-1 w-full border border-rule px-3 py-2 bg-transparent"
          />
        </label>
        <label className="block">
          <span className="text-sm text-ink/70">Fim das inscrições</span>
          <input
            name="fim"
            type="datetime-local"
            required
            className="mt-1 w-full border border-rule px-3 py-2 bg-transparent"
          />
        </label>
      </div>
      {state?.erro && <p className="text-red-700 text-sm">{state.erro}</p>}
      {state?.ok && <p className="text-clay text-sm">Conferência aberta com sucesso.</p>}
      <Btn />
    </form>
  );
}
