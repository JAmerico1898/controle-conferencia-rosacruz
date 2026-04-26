"use client";

import { useState } from "react";
import { cancelarInscricaoAdminAction } from "@/server/actions/admin-inscricao";
import { EditarInscricaoDialog } from "./EditarInscricaoDialog";
import type { Inscricao } from "@/lib/db/schema";

const ROTULO_CHEGADA: Record<string, string> = {
  sabado_manha: "Sáb manhã",
  sabado_tarde: "Sáb tarde",
};

function refeicoes(i: Inscricao): string {
  const r: string[] = [];
  if (i.almocoSabado) r.push("Almoço sáb");
  if (i.jantarSabado) r.push("Jantar sáb");
  if (i.cafeDomingo) r.push("Café dom");
  if (i.lancheDomingo) r.push("Lanche dom");
  return r.length ? r.join(", ") : "—";
}

export function LinhaInscricao({ inscricao }: { inscricao: Inscricao }) {
  const [editando, setEditando] = useState(false);
  const i = inscricao;
  return (
    <>
      <tr className="border-b border-rule/50 align-top">
        <td className="py-3 num">{i.codigo}</td>
        <td>{i.nome}</td>
        <td className="text-xs num">{i.whatsapp}</td>
        <td>{i.genero}</td>
        <td>
          {i.cidade}/{i.estado}
        </td>
        <td className="text-xs">{i.discipulado}</td>
        <td>{i.alojamento ? "sim" : "—"}</td>
        <td>{i.alojamento ? i.tipoCama : "—"}</td>
        <td className="text-xs">
          {i.dataChegada ? ROTULO_CHEGADA[i.dataChegada] ?? i.dataChegada : "—"}
        </td>
        <td className="text-xs">{refeicoes(i)}</td>
        <td>
          <span
            className={
              i.status === "ativo" ? "text-clay" : "text-ink/40 line-through"
            }
          >
            {i.status}
          </span>
        </td>
        <td className="text-right space-x-3 whitespace-nowrap">
          <button
            onClick={() => setEditando((e) => !e)}
            className="text-saffron underline"
          >
            {editando ? "fechar" : "editar"}
          </button>
          {i.status === "ativo" && (
            <form action={cancelarInscricaoAdminAction} className="inline">
              <input type="hidden" name="id" value={i.id} />
              <button className="text-red-700 underline">cancelar</button>
            </form>
          )}
        </td>
      </tr>
      {editando && (
        <EditarInscricaoDialog inscricao={i} onClose={() => setEditando(false)} />
      )}
    </>
  );
}
