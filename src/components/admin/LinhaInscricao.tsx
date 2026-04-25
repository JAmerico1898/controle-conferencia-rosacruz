"use client";

import { useState } from "react";
import { cancelarInscricaoAdminAction } from "@/server/actions/admin-inscricao";
import { EditarInscricaoDialog } from "./EditarInscricaoDialog";
import type { Inscricao } from "@/lib/db/schema";

export function LinhaInscricao({ inscricao }: { inscricao: Inscricao }) {
  const [editando, setEditando] = useState(false);
  const i = inscricao;
  return (
    <>
      <tr className="border-b border-rule/50">
        <td className="py-3 num">{i.codigo}</td>
        <td>{i.nome}</td>
        <td>{i.genero}</td>
        <td>
          {i.cidade}/{i.estado}
        </td>
        <td>{i.alojamento ? i.tipoCama : "—"}</td>
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
