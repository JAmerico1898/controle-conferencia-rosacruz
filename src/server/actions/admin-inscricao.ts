"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db/client";
import { inscricoes } from "@/lib/db/schema";
import { getSessao } from "@/lib/auth";
import { validarPayloadInscricao } from "@/lib/inscricoes";
import { normalizarNome } from "@/lib/nome";

async function gestor() {
  const s = await getSessao();
  if (!s) throw new Error("Não autenticado");
  return s;
}

export async function editarInscricaoAction(_: unknown, fd: FormData) {
  const s = await gestor();
  const id = Number(fd.get("id"));
  const payload = {
    nome: String(fd.get("nome") ?? ""),
    genero: fd.get("genero"),
    cidade: String(fd.get("cidade") ?? ""),
    estado: fd.get("estado"),
    discipulado: fd.get("discipulado"),
    alojamento: fd.get("alojamento") === "sim",
    tipoCama: (fd.get("tipoCama") || undefined) as any,
    dataChegada: (fd.get("dataChegada") || undefined) as any,
    almocoSabado: fd.get("almocoSabado") === "on",
    jantarSabado: fd.get("jantarSabado") === "on",
    lancheDomingo: fd.get("lancheDomingo") === "on",
    whatsapp: String(fd.get("whatsapp") ?? ""),
  };
  const v = validarPayloadInscricao(payload);
  if (!v.ok) return { erro: v.erro };
  await db
    .update(inscricoes)
    .set({
      nome: v.value.nome.trim(),
      nomeNormalizado: normalizarNome(v.value.nome),
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
      whatsapp: v.value.whatsapp,
      alteradoEm: new Date(),
      alteradoPor: s.login,
    })
    .where(eq(inscricoes.id, id));
  revalidatePath("/admin/inscricoes");
  revalidatePath("/");
  return { ok: true as const };
}

export async function cancelarInscricaoAdminAction(fd: FormData) {
  await gestor();
  const id = Number(fd.get("id"));
  await db.delete(inscricoes).where(eq(inscricoes.id, id));
  revalidatePath("/admin/inscricoes");
  revalidatePath("/");
}
