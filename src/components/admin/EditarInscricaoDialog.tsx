"use client";

import { useActionState, useEffect } from "react";
import { editarInscricaoAction } from "@/server/actions/admin-inscricao";
import { ESTADOS_BR, GENEROS, DISCIPULADOS } from "@/lib/constants";
import type { Inscricao } from "@/lib/db/schema";

export function EditarInscricaoDialog({
  inscricao: i,
  onClose,
}: {
  inscricao: Inscricao;
  onClose: () => void;
}) {
  const [state, action] = useActionState(editarInscricaoAction, {
    erro: "",
  } as { erro?: string; ok?: true });

  useEffect(() => {
    if (state?.ok) onClose();
  }, [state, onClose]);

  return (
    <tr>
      <td colSpan={7} className="bg-bone/60 p-6 border-b border-rule">
        <form action={action} className="space-y-3 max-w-2xl">
          <input type="hidden" name="id" value={i.id} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Nome" name="nome" defaultValue={i.nome} />
            <Field label="Email" name="email" defaultValue={i.email} />
            <Field label="Cidade" name="cidade" defaultValue={i.cidade} />
            <SelectField
              label="Estado"
              name="estado"
              defaultValue={i.estado}
              options={[...ESTADOS_BR]}
            />
            <SelectField
              label="Gênero"
              name="genero"
              defaultValue={i.genero}
              options={[...GENEROS]}
            />
            <SelectField
              label="Discipulado"
              name="discipulado"
              defaultValue={i.discipulado}
              options={[...DISCIPULADOS]}
            />
          </div>
          <fieldset>
            <legend className="text-xs text-ink/60">Alojamento</legend>
            <label className="mr-4">
              <input
                type="radio"
                name="alojamento"
                value="sim"
                defaultChecked={i.alojamento}
              />{" "}
              Sim
            </label>
            <label>
              <input
                type="radio"
                name="alojamento"
                value="nao"
                defaultChecked={!i.alojamento}
              />{" "}
              Não
            </label>
          </fieldset>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <SelectField
              label="Tipo cama"
              name="tipoCama"
              defaultValue={i.tipoCama ?? ""}
              options={["", "baixo", "cima"]}
              labels={["—", "baixo", "cima"]}
            />
            <SelectField
              label="Chegada"
              name="dataChegada"
              defaultValue={i.dataChegada ?? ""}
              options={["", "sabado_manha", "sabado_tarde"]}
              labels={["—", "Sábado manhã", "Sábado tarde"]}
            />
          </div>
          <fieldset className="space-y-1">
            <legend className="text-xs text-ink/60">Refeições</legend>
            <label className="block">
              <input
                type="checkbox"
                name="almocoSabado"
                defaultChecked={i.almocoSabado}
              />{" "}
              Almoço sábado
            </label>
            <label className="block">
              <input
                type="checkbox"
                name="jantarSabado"
                defaultChecked={i.jantarSabado}
              />{" "}
              Jantar sábado
            </label>
            <label className="block">
              <input
                type="checkbox"
                name="lancheDomingo"
                defaultChecked={i.lancheDomingo}
              />{" "}
              Lanche domingo
            </label>
          </fieldset>
          {state?.erro && <p className="text-red-700 text-sm">{state.erro}</p>}
          <div className="flex gap-3">
            <button className="bg-ink text-bone px-4 py-2 hover:bg-clay">Salvar</button>
            <button
              type="button"
              onClick={onClose}
              className="border border-rule px-4 py-2"
            >
              Cancelar
            </button>
          </div>
        </form>
      </td>
    </tr>
  );
}

function Field({
  label,
  name,
  defaultValue,
}: {
  label: string;
  name: string;
  defaultValue: string;
}) {
  return (
    <label className="block">
      <span className="text-xs text-ink/60">{label}</span>
      <input
        name={name}
        defaultValue={defaultValue}
        className="w-full border border-rule px-2 py-1 bg-transparent"
      />
    </label>
  );
}

function SelectField({
  label,
  name,
  defaultValue,
  options,
  labels,
}: {
  label: string;
  name: string;
  defaultValue: string;
  options: string[];
  labels?: string[];
}) {
  return (
    <label className="block">
      <span className="text-xs text-ink/60">{label}</span>
      <select
        name={name}
        defaultValue={defaultValue}
        className="w-full border border-rule px-2 py-1 bg-transparent"
      >
        {options.map((o, i) => (
          <option key={o || "_"} value={o}>
            {labels?.[i] ?? o}
          </option>
        ))}
      </select>
    </label>
  );
}
