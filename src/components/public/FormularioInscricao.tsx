"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { criarInscricaoAction } from "@/server/actions/inscricao";
import { ESTADOS_BR, DISCIPULADOS, GENEROS } from "@/lib/constants";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="bg-ink text-bone px-8 py-3 font-display tracking-wide hover:bg-clay transition-colors disabled:opacity-50"
    >
      {pending ? "Enviando…" : "Confirmar inscrição"}
    </button>
  );
}

export function FormularioInscricao() {
  const [state, action] = useActionState(criarInscricaoAction, { erro: "" });
  const [alojamento, setAlojamento] = useState<"sim" | "nao" | "">("");
  const [chegada, setChegada] = useState<"sabado_manha" | "sabado_tarde" | "">("");

  return (
    <form action={action} className="space-y-8">
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        className="absolute -left-[9999px] opacity-0"
        aria-hidden
      />

      <Aviso />

      <Campo label="Nome completo" name="nome" required />
      <Radios label="Gênero" name="genero" opcoes={[...GENEROS]} required />
      <Campo label="Cidade" name="cidade" required />
      <Select label="Estado" name="estado" opcoes={[...ESTADOS_BR]} required />
      <Select label="Discipulado" name="discipulado" opcoes={[...DISCIPULADOS]} required />

      <Radios
        label="Precisa de alojamento?"
        name="alojamento"
        opcoes={["sim", "nao"]}
        rotulos={["Sim", "Não"]}
        required
        onChange={(v) => setAlojamento(v as "sim" | "nao")}
      />

      {alojamento === "sim" && (
        <>
          <Aviso variant="info">
            Camas de baixo são prioridade para pessoas com mais idade. A
            Secretaria pode alterar quarto e cama conforme necessidade do
            Centro de Conferências.
          </Aviso>
          <Radios
            label="Tipo de cama"
            name="tipoCama"
            opcoes={["baixo", "cima"]}
            rotulos={["Baixo", "Cima"]}
            required
          />
          <Radios
            label="Data de chegada"
            name="dataChegada"
            opcoes={["sabado_manha", "sabado_tarde"]}
            rotulos={["Sábado de manhã", "Sábado à tarde"]}
            required
            onChange={(v) => setChegada(v as "sabado_manha" | "sabado_tarde")}
          />
          <Refeicoes alojado chegada={chegada} />
          <p className="text-sm text-ink/60 italic">
            O café da manhã de domingo está incluído para todos os alunos alojados.
          </p>
        </>
      )}

      {alojamento === "nao" && <Refeicoes />}

      <Campo label="Email" name="email" type="email" required />

      {state?.erro && (
        <p className="border border-red-700 text-red-700 p-3 text-sm">{state.erro}</p>
      )}

      <Submit />
    </form>
  );
}

function Aviso({
  children,
  variant = "warn",
}: {
  children?: React.ReactNode;
  variant?: "warn" | "info";
}) {
  return (
    <div
      className={`border-l-4 px-4 py-3 ${
        variant === "warn" ? "border-saffron bg-saffron/10" : "border-clay/50 bg-clay/5"
      }`}
    >
      {children ?? (
        <p className="font-display text-lg">
          <strong>Leia com atenção.</strong> O nome informado é a chave da inscrição —
          uma vez registrado, alterações exigem cancelamento e nova inscrição.
        </p>
      )}
    </div>
  );
}

function Campo({
  label,
  name,
  type = "text",
  required = false,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-sm text-ink/70">
        {label}
        {required && " *"}
      </span>
      <input
        type={type}
        name={name}
        required={required}
        className="mt-1 w-full border border-rule bg-transparent px-3 py-2 outline-none focus:border-ink"
      />
    </label>
  );
}

function Radios({
  label,
  name,
  opcoes,
  rotulos,
  required,
  onChange,
}: {
  label: string;
  name: string;
  opcoes: string[];
  rotulos?: string[];
  required?: boolean;
  onChange?: (v: string) => void;
}) {
  return (
    <fieldset>
      <legend className="text-sm text-ink/70">
        {label}
        {required && " *"}
      </legend>
      <div className="mt-2 flex flex-wrap gap-2">
        {opcoes.map((o, i) => (
          <label
            key={o}
            className="border border-rule px-4 py-2 cursor-pointer has-[:checked]:bg-ink has-[:checked]:text-bone transition-colors"
          >
            <input
              type="radio"
              name={name}
              value={o}
              required={required}
              onChange={(e) => onChange?.(e.target.value)}
              className="sr-only"
            />
            {rotulos?.[i] ?? o}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function Select({
  label,
  name,
  opcoes,
  required,
}: {
  label: string;
  name: string;
  opcoes: string[];
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-sm text-ink/70">
        {label}
        {required && " *"}
      </span>
      <select
        name={name}
        required={required}
        defaultValue=""
        className="mt-1 w-full border border-rule bg-transparent px-3 py-2 outline-none focus:border-ink"
      >
        <option value="">—</option>
        {opcoes.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}

function Refeicoes({
  alojado,
  chegada,
}: {
  alojado?: boolean;
  chegada?: "sabado_manha" | "sabado_tarde" | "";
}) {
  const podeAlmoco = !alojado || chegada === "sabado_manha";
  return (
    <fieldset>
      <legend className="text-sm text-ink/70">Refeições</legend>
      <div className="mt-2 space-y-2">
        <Check name="almocoSabado" rotulo="Almoço de sábado" disabled={!podeAlmoco} />
        <Check name="jantarSabado" rotulo="Jantar de sábado" />
        <Check name="lancheDomingo" rotulo="Lanche de domingo" />
      </div>
    </fieldset>
  );
}

function Check({
  name,
  rotulo,
  disabled,
}: {
  name: string;
  rotulo: string;
  disabled?: boolean;
}) {
  return (
    <label className={`flex items-center gap-3 ${disabled ? "opacity-40" : ""}`}>
      <input
        type="checkbox"
        name={name}
        disabled={disabled}
        className="accent-saffron"
      />
      <span>{rotulo}</span>
    </label>
  );
}
