"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { abrirConferenciaAction } from "@/server/actions/conferencia";
import { MESES_CONFERENCIA, PREDIOS } from "@/lib/constants";

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

function GrupoPredios({
  genero,
  prefixo,
  defaultPrincipal,
}: {
  genero: "Feminino" | "Masculino";
  prefixo: "feminino" | "masculino";
  defaultPrincipal: "novo" | "antigo";
}) {
  return (
    <fieldset className="border border-rule p-4">
      <legend className="text-sm text-ink/70 px-1">
        Alojamento {genero.toLowerCase()} — prédios
      </legend>
      <div className="space-y-2 mt-1">
        <p className="text-xs text-ink/50">
          Selecione 1 prédio principal (novo ou antigo). Opcionalmente marque o
          extra para 2 camas adicionais de baixo.
        </p>
        <label className="block">
          <input
            type="radio"
            name={`predio_${prefixo}`}
            value="novo"
            defaultChecked={defaultPrincipal === "novo"}
          />{" "}
          {PREDIOS.novo.label} ({PREDIOS.novo.baixo} baixo /{" "}
          {PREDIOS.novo.cima} cima)
        </label>
        <label className="block">
          <input
            type="radio"
            name={`predio_${prefixo}`}
            value="antigo"
            defaultChecked={defaultPrincipal === "antigo"}
          />{" "}
          {PREDIOS.antigo.label} ({PREDIOS.antigo.baixo} baixo /{" "}
          {PREDIOS.antigo.cima} cima)
        </label>
        <label className="block">
          <input type="checkbox" name={`extra_${prefixo}`} /> +{" "}
          {PREDIOS.extra.label} ({PREDIOS.extra.baixo} baixo)
        </label>
      </div>
    </fieldset>
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
        <GrupoPredios
          genero="Feminino"
          prefixo="feminino"
          defaultPrincipal="antigo"
        />
        <GrupoPredios
          genero="Masculino"
          prefixo="masculino"
          defaultPrincipal="novo"
        />
      </div>
      <p className="text-xs text-ink/50">
        Os prédios principais (novo/antigo) feminino e masculino devem ser
        diferentes. O prédio extra pode ser atribuído a apenas um dos gêneros.
        A escolha é fixa após a abertura.
      </p>
      {state?.erro && <p className="text-red-700 text-sm">{state.erro}</p>}
      {state?.ok && (
        <p className="text-clay text-sm">Conferência aberta com sucesso.</p>
      )}
      <Btn />
    </form>
  );
}
