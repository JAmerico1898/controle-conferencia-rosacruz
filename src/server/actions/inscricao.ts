"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq, and, sql } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { conferencias, inscricoes } from "@/lib/db/schema";
import { validarPayloadInscricao } from "@/lib/inscricoes";
import { calcularVagas, vagasEsgotadas } from "@/lib/vagas";
import { gerarCodigoInscricao } from "@/lib/codigo-inscricao";
import { normalizarNome } from "@/lib/nome";
import { limiterInscricao } from "@/lib/rate-limit";

export async function criarInscricaoAction(_: unknown, formData: FormData) {
  if (formData.get("website")) {
    return { erro: "Erro de validação." };
  }
  const ip =
    (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!limiterInscricao.permite(ip)) {
    return { erro: "Muitas tentativas. Tente novamente em alguns minutos." };
  }

  const payload = {
    nome: String(formData.get("nome") ?? ""),
    genero: formData.get("genero"),
    cidade: String(formData.get("cidade") ?? ""),
    estado: formData.get("estado"),
    discipulado: formData.get("discipulado"),
    alojamento: formData.get("alojamento") === "sim",
    tipoCama: (formData.get("tipoCama") || undefined) as any,
    dataChegada: (formData.get("dataChegada") || undefined) as any,
    almocoSabado: formData.get("almocoSabado") === "on",
    jantarSabado: formData.get("jantarSabado") === "on",
    lancheDomingo: formData.get("lancheDomingo") === "on",
    email: String(formData.get("email") ?? ""),
  };
  const v = validarPayloadInscricao(payload);
  if (!v.ok) return { erro: v.erro };

  let codigo: string;
  try {
    codigo = await db.transaction(async (tx) => {
      const [conf] = await tx
        .select()
        .from(conferencias)
        .where(eq(conferencias.status, "aberta"))
        .for("update");
      if (!conf) throw new Error("Não há conferência aberta no momento.");

      const ativos = await tx
        .select({
          genero: inscricoes.genero,
          alojamento: inscricoes.alojamento,
          tipoCama: inscricoes.tipoCama,
          status: inscricoes.status,
        })
        .from(inscricoes)
        .where(eq(inscricoes.conferenciaId, conf.id));

      if (v.value.alojamento && v.value.tipoCama) {
        const vagas = calcularVagas(ativos as any);
        if (vagasEsgotadas(vagas, v.value.genero, v.value.tipoCama)) {
          throw new Error("As vagas para o tipo de cama solicitado se esgotaram.");
        }
      }

      const nomeNorm = normalizarNome(v.value.nome);
      const dup = await tx
        .select({ id: inscricoes.id })
        .from(inscricoes)
        .where(
          and(
            eq(inscricoes.conferenciaId, conf.id),
            eq(inscricoes.nomeNormalizado, nomeNorm),
            eq(inscricoes.status, "ativo"),
          ),
        );
      if (dup.length > 0) {
        throw new Error(
          "Já existe uma inscrição registrada com este nome. Caso precise alterar, utilize a opção de cancelamento.",
        );
      }

      const [{ count }] = await tx
        .select({ count: sql<number>`count(*)::int` })
        .from(inscricoes)
        .where(eq(inscricoes.conferenciaId, conf.id));

      const cod = gerarCodigoInscricao({
        mes: conf.mes,
        ano: conf.ano,
        sequencial: count + 1,
      });

      await tx.insert(inscricoes).values({
        codigo: cod,
        conferenciaId: conf.id,
        nome: v.value.nome.trim(),
        nomeNormalizado: nomeNorm,
        genero: v.value.genero,
        cidade: v.value.cidade.trim(),
        estado: v.value.estado,
        discipulado: v.value.discipulado,
        alojamento: v.value.alojamento,
        tipoCama: v.value.tipoCama ?? null,
        dataChegada: v.value.dataChegada ?? null,
        almocoSabado: v.value.almocoSabado,
        jantarSabado: v.value.jantarSabado,
        lancheDomingo: v.value.lancheDomingo,
        cafeDomingo: v.value.cafeDomingo,
        email: v.value.email.trim(),
      });

      return cod;
    });
  } catch (e: any) {
    return { erro: e?.message ?? "Erro ao processar inscrição." };
  }

  revalidatePath("/");
  redirect(`/inscricao/${codigo}/imprimir`);
}

export async function buscarInscricaoPorNomeAction(_: unknown, formData: FormData) {
  const nome = String(formData.get("nome") ?? "");
  const norm = normalizarNome(nome);
  const [conf] = await db
    .select()
    .from(conferencias)
    .where(eq(conferencias.status, "aberta"));
  if (!conf) return { erro: "Não há conferência aberta no momento." };
  const [reg] = await db
    .select()
    .from(inscricoes)
    .where(
      and(
        eq(inscricoes.conferenciaId, conf.id),
        eq(inscricoes.nomeNormalizado, norm),
        eq(inscricoes.status, "ativo"),
      ),
    );
  if (!reg) return { erro: "Não encontramos uma inscrição ativa com esse nome." };
  return { ok: true as const, inscricao: reg, conferenciaNome: conf.nome };
}

export async function cancelarInscricaoPublicaAction(_: unknown, formData: FormData) {
  const codigo = String(formData.get("codigo") ?? "");
  const [reg] = await db
    .select()
    .from(inscricoes)
    .where(eq(inscricoes.codigo, codigo));
  if (!reg || reg.status !== "ativo") {
    return { erro: "Inscrição não encontrada ou já cancelada." };
  }
  await db
    .update(inscricoes)
    .set({
      status: "cancelado",
      canceladoEm: new Date(),
      canceladoPor: "auto-cancelamento",
    })
    .where(eq(inscricoes.id, reg.id));
  revalidatePath("/");
  return { ok: true as const };
}
