import { eq, desc } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { conferencias, inscricoes } from "@/lib/db/schema";
import { gerarCSV } from "@/lib/exportar";
import { getSessao } from "@/lib/auth";

export async function GET(req: Request) {
  if (!(await getSessao())) {
    return new Response("Unauthorized", { status: 401 });
  }
  const url = new URL(req.url);
  const confId = Number(url.searchParams.get("conferenciaId"));
  const conf = confId
    ? (await db.select().from(conferencias).where(eq(conferencias.id, confId)))[0]
    : (
        await db
          .select()
          .from(conferencias)
          .orderBy(desc(conferencias.ano), desc(conferencias.mes))
      )[0];
  if (!conf) return new Response("conf não encontrada", { status: 404 });
  const rows = await db
    .select()
    .from(inscricoes)
    .where(eq(inscricoes.conferenciaId, conf.id));
  const csv = gerarCSV(
    [
      "codigo",
      "nome",
      "genero",
      "cidade",
      "estado",
      "discipulado",
      "alojamento",
      "tipoCama",
      "dataChegada",
      "almocoSabado",
      "jantarSabado",
      "lancheDomingo",
      "cafeDomingo",
      "email",
      "status",
      "criadoEm",
      "canceladoEm",
    ] as any,
    rows as any,
  );
  return new Response("﻿" + csv, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="${conf.nome.replace(
        " ",
        "-",
      )}.csv"`,
    },
  });
}
