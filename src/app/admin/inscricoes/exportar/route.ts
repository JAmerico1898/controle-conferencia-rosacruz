import { eq, desc } from "drizzle-orm";
import ExcelJS from "exceljs";
import { db } from "@/lib/db/client";
import { conferencias, inscricoes } from "@/lib/db/schema";
import { getSessao } from "@/lib/auth";

const COLUNAS: { key: keyof typeof inscricoes.$inferSelect; header: string; width: number }[] = [
  { key: "codigo", header: "Código", width: 14 },
  { key: "nome", header: "Nome", width: 32 },
  { key: "genero", header: "Gênero", width: 12 },
  { key: "cidade", header: "Cidade", width: 20 },
  { key: "estado", header: "UF", width: 6 },
  { key: "discipulado", header: "Discipulado", width: 18 },
  { key: "alojamento", header: "Alojamento", width: 12 },
  { key: "tipoCama", header: "Tipo cama", width: 12 },
  { key: "dataChegada", header: "Chegada", width: 16 },
  { key: "almocoSabado", header: "Almoço sáb", width: 12 },
  { key: "jantarSabado", header: "Jantar sáb", width: 12 },
  { key: "lancheDomingo", header: "Lanche dom", width: 12 },
  { key: "cafeDomingo", header: "Café dom", width: 12 },
  { key: "whatsapp", header: "WhatsApp", width: 18 },
  { key: "status", header: "Status", width: 12 },
  { key: "criadoEm", header: "Criado em", width: 22 },
  { key: "canceladoEm", header: "Cancelado em", width: 22 },
];

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

  const wb = new ExcelJS.Workbook();
  wb.creator = "controle-conferencia";
  wb.created = new Date();
  const ws = wb.addWorksheet(conf.nome.slice(0, 30));
  ws.columns = COLUNAS.map((c) => ({ header: c.header, key: c.key, width: c.width }));
  ws.getRow(1).font = { bold: true };

  for (const r of rows) {
    ws.addRow({
      ...r,
      criadoEm: r.criadoEm ? new Date(r.criadoEm) : null,
      canceladoEm: r.canceladoEm ? new Date(r.canceladoEm) : null,
    });
  }

  const buffer = await wb.xlsx.writeBuffer();
  const filename = `${conf.nome.replace(/\s+/g, "-")}.xlsx`;

  return new Response(buffer, {
    headers: {
      "content-type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "content-disposition": `attachment; filename="${filename}"`,
      "cache-control": "no-store",
    },
  });
}
