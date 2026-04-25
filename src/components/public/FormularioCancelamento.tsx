"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import {
  buscarInscricaoPorNomeAction,
  cancelarInscricaoPublicaAction,
} from "@/server/actions/inscricao";

function Btn({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      disabled={pending}
      className="bg-ink text-bone px-6 py-3 disabled:opacity-50 hover:bg-clay transition-colors"
    >
      {pending ? "…" : label}
    </button>
  );
}

export function FormularioCancelamento() {
  const [busca, buscar] = useActionState(buscarInscricaoPorNomeAction, {} as any);
  const [cancel, cancelar] = useActionState(cancelarInscricaoPublicaAction, {} as any);

  if (cancel?.ok) {
    return (
      <p className="border border-rule p-8 font-display text-xl">
        Sua inscrição foi cancelada com sucesso.
      </p>
    );
  }

  if (busca?.ok) {
    const i = busca.inscricao;
    return (
      <div className="space-y-6">
        <p className="text-ink/70">Confirme o cancelamento da inscrição abaixo:</p>
        <dl className="border border-rule p-6 grid grid-cols-[max-content_1fr] gap-x-8 gap-y-2 text-sm">
          <dt className="text-ink/50">Nome</dt>
          <dd>{i.nome}</dd>
          <dt className="text-ink/50">Código</dt>
          <dd className="num">{i.codigo}</dd>
          <dt className="text-ink/50">Conferência</dt>
          <dd>{busca.conferenciaNome}</dd>
        </dl>
        <form action={cancelar} className="flex gap-4">
          <input type="hidden" name="codigo" value={i.codigo} />
          <Btn label="Confirmar cancelamento" />
          <a href="/cancelamento" className="px-6 py-3 border border-rule">
            Voltar
          </a>
        </form>
        {cancel?.erro && <p className="text-red-700 text-sm">{cancel.erro}</p>}
      </div>
    );
  }

  return (
    <form action={buscar} className="space-y-4">
      <label className="block">
        <span className="text-sm text-ink/70">
          Nome completo (exatamente como cadastrado)
        </span>
        <input
          name="nome"
          required
          className="mt-1 w-full border border-rule bg-transparent px-3 py-2 outline-none focus:border-ink"
        />
      </label>
      {busca?.erro && <p className="text-red-700 text-sm">{busca.erro}</p>}
      <Btn label="Buscar inscrição" />
    </form>
  );
}
