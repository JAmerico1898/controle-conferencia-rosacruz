"use server";

import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db/client";
import { conferencias } from "@/lib/db/schema";
import { getSessao } from "@/lib/auth";
import {
  validarAberturaConferencia,
  formatarNomeConferencia,
} from "@/lib/conferencias";

async function exigirSessao() {
  const s = await getSessao();
  if (!s) throw new Error("Não autenticado");
  return s;
}

export async function abrirConferenciaAction(_: unknown, fd: FormData) {
  const sessao = await exigirSessao();
  const mes = Number(fd.get("mes"));
  const ano = Number(fd.get("ano"));
  const inicio = new Date(String(fd.get("inicio")));
  const fim = new Date(String(fd.get("fim")));
  const v = validarAberturaConferencia({
    mes,
    ano,
    inscricoesAbertura: inicio,
    inscricoesFim: fim,
  });
  if (!v.ok) return { erro: v.erro };
  const predioFeminino = String(fd.get("predio_feminino") ?? "");
  const predioMasculino = String(fd.get("predio_masculino") ?? "");
  const extraFeminino = fd.get("extra_feminino") === "on";
  const extraMasculino = fd.get("extra_masculino") === "on";
  if (predioFeminino !== "novo" && predioFeminino !== "antigo") {
    return { erro: "Selecione o prédio principal do alojamento feminino." };
  }
  if (predioMasculino !== "novo" && predioMasculino !== "antigo") {
    return { erro: "Selecione o prédio principal do alojamento masculino." };
  }
  if (predioFeminino === predioMasculino) {
    return {
      erro: "Os prédios principais feminino e masculino devem ser diferentes.",
    };
  }
  if (extraFeminino && extraMasculino) {
    return {
      erro: "O prédio extra pode ser atribuído a apenas um dos gêneros.",
    };
  }
  const aberta = await db
    .select()
    .from(conferencias)
    .where(eq(conferencias.status, "aberta"));
  if (aberta.length > 0) {
    return {
      erro: "Já existe uma conferência aberta. Feche-a antes de abrir outra.",
    };
  }
  try {
    await db.insert(conferencias).values({
      mes,
      ano,
      nome: formatarNomeConferencia(mes, ano),
      inscricoesAbertura: inicio,
      inscricoesFim: fim,
      status: "aberta",
      predioFeminino,
      predioMasculino,
      extraFeminino,
      extraMasculino,
      criadoPor: sessao.login,
    });
  } catch (e: any) {
    if (String(e?.message ?? "").includes("conferencias_mes_ano_uq")) {
      return { erro: "Já existe uma conferência para esse mês/ano." };
    }
    throw e;
  }
  revalidatePath("/admin/conferencias");
  revalidatePath("/");
  return { ok: true as const };
}

export async function fecharConferenciaAction(fd: FormData) {
  await exigirSessao();
  const id = Number(fd.get("id"));
  await db
    .update(conferencias)
    .set({ status: "fechada" })
    .where(and(eq(conferencias.id, id), eq(conferencias.status, "aberta")));
  revalidatePath("/admin/conferencias");
  revalidatePath("/");
}
