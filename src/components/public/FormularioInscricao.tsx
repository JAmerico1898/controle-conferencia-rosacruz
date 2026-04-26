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
      className="bg-ink text-bone px-10 py-3 font-display tracking-wide hover:bg-clay transition-colors disabled:opacity-50"
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
    <form action={action} className="space-y-6">
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        className="absolute -left-[9999px] opacity-0"
        aria-hidden
      />

      <Card title="Identificação">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
          <Campo label="Nome completo" name="nome" required full />
          <Radios
            label="Gênero"
            name="genero"
            opcoes={[...GENEROS]}
            required
            full
          />
          <Campo label="Cidade" name="cidade" required />
          <Select label="Estado" name="estado" opcoes={[...ESTADOS_BR]} required />
          <Select
            label="Discipulado"
            name="discipulado"
            opcoes={[...DISCIPULADOS]}
            required
            full
          />
          <CampoWhatsapp />
        </div>
      </Card>

      <Card title="Estadia & Refeições">
        <div className="space-y-6">
          <Radios
            label="Precisa de alojamento?"
            name="alojamento"
            opcoes={["sim", "nao"]}
            rotulos={["Sim", "Não"]}
            required
            onChange={(v) => setAlojamento(v as "sim" | "nao")}
          />

          {alojamento === "sim" && (
            <div className="space-y-6 border-t border-rule pt-6">
              <Aviso variant="info">
                Camas de baixo são prioridade para pessoas com mais idade. A
                Secretaria pode alterar quarto e cama conforme necessidade do
                Centro de Conferências.
              </Aviso>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
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
                  rotulos={["Sáb. manhã", "Sáb. tarde"]}
                  required
                  onChange={(v) =>
                    setChegada(v as "sabado_manha" | "sabado_tarde")
                  }
                />
              </div>
              <Refeicoes alojado chegada={chegada} />
              <p className="text-sm text-ink/60 italic">
                O café da manhã de domingo está incluído para todos os alunos
                alojados.
              </p>
            </div>
          )}

          {alojamento === "nao" && (
            <div className="border-t border-rule pt-6">
              <Refeicoes />
            </div>
          )}
        </div>
      </Card>

      {state?.erro && (
        <p className="border border-red-700 bg-red-50 text-red-700 p-3 text-sm">
          {state.erro}
        </p>
      )}

      <div className="flex justify-end pt-2">
        <Submit />
      </div>
    </form>
  );
}

function Card({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border border-rule bg-white/55 shadow-[0_1px_2px_rgba(26,22,17,0.04)] p-6 sm:p-8">
      <h3 className="font-display uppercase tracking-[0.18em] text-xs text-ink/70 border-b border-rule pb-3 mb-6">
        {title}
      </h3>
      {children}
    </section>
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
      className={`border-l-4 px-5 py-4 ${
        variant === "warn"
          ? "border-saffron bg-saffron/10"
          : "border-clay/50 bg-clay/5"
      }`}
    >
      {children ?? (
        <p className="font-display text-lg leading-snug">
          <strong>Leia com atenção.</strong> O nome informado é a chave da
          inscrição — uma vez registrado, alterações exigem cancelamento e nova
          inscrição.
        </p>
      )}
    </div>
  );
}

function mascararWhatsapp(raw: string): string {
  const d = raw.replace(/\D/g, "").slice(0, 11);
  if (d.length === 0) return "";
  if (d.length <= 2) return `(${d}`;
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

function CampoWhatsapp() {
  const [valor, setValor] = useState("");
  return (
    <label className="block sm:col-span-2">
      <span className="text-xs uppercase tracking-[0.12em] text-ink/60">
        WhatsApp (com DDD) *
      </span>
      <input
        type="tel"
        name="whatsapp"
        required
        inputMode="numeric"
        placeholder="(xx) xxxxx-xxxx"
        value={valor}
        onChange={(e) => setValor(mascararWhatsapp(e.target.value))}
        className="mt-2 w-full border border-rule bg-white/70 px-3 py-2 outline-none focus:border-ink focus:bg-white transition-colors num"
      />
    </label>
  );
}

function Campo({
  label,
  name,
  type = "text",
  required = false,
  full = false,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  full?: boolean;
}) {
  return (
    <label className={`block ${full ? "sm:col-span-2" : ""}`}>
      <span className="text-xs uppercase tracking-[0.12em] text-ink/60">
        {label}
        {required && " *"}
      </span>
      <input
        type={type}
        name={name}
        required={required}
        className="mt-2 w-full border border-rule bg-white/70 px-3 py-2 outline-none focus:border-ink focus:bg-white transition-colors"
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
  full = false,
}: {
  label: string;
  name: string;
  opcoes: string[];
  rotulos?: string[];
  required?: boolean;
  onChange?: (v: string) => void;
  full?: boolean;
}) {
  return (
    <fieldset className={full ? "sm:col-span-2" : ""}>
      <legend className="text-xs uppercase tracking-[0.12em] text-ink/60">
        {label}
        {required && " *"}
      </legend>
      <div className="mt-2 flex flex-wrap gap-2">
        {opcoes.map((o, i) => (
          <label
            key={o}
            className="border border-rule bg-white/60 px-4 py-2 cursor-pointer has-[:checked]:bg-ink has-[:checked]:text-bone has-[:checked]:border-ink transition-colors"
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
  full = false,
}: {
  label: string;
  name: string;
  opcoes: string[];
  required?: boolean;
  full?: boolean;
}) {
  return (
    <label className={`block ${full ? "sm:col-span-2" : ""}`}>
      <span className="text-xs uppercase tracking-[0.12em] text-ink/60">
        {label}
        {required && " *"}
      </span>
      <select
        name={name}
        required={required}
        defaultValue=""
        className="mt-2 w-full border border-rule bg-white/70 px-3 py-2 outline-none focus:border-ink focus:bg-white transition-colors"
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
      <legend className="text-xs uppercase tracking-[0.12em] text-ink/60">
        Refeições
      </legend>
      <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Check
          name="almocoSabado"
          rotulo="Almoço de sábado"
          disabled={!podeAlmoco}
        />
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
    <label
      className={`flex items-center gap-3 border border-rule bg-white/60 px-3 py-2 cursor-pointer ${
        disabled ? "opacity-40 cursor-not-allowed" : "hover:border-ink/40"
      }`}
    >
      <input
        type="checkbox"
        name={name}
        disabled={disabled}
        className="accent-saffron"
      />
      <span className="text-sm">{rotulo}</span>
    </label>
  );
}
