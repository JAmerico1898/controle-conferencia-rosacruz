import { eq } from "drizzle-orm";
import {
  Document,
  HeadingLevel,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from "docx";
import { db } from "@/lib/db/client";
import { conferencias, inscricoes } from "@/lib/db/schema";
import { getSessao } from "@/lib/auth";
import { PREDIOS, type Predio } from "@/lib/constants";
import {
  alocarCamas,
  generoDoPredio,
  nomeArquivoRelatorio,
} from "@/lib/relatorio";

export async function GET(
  _: Request,
  ctx: { params: Promise<{ predio: string }> },
) {
  const sessao = await getSessao();
  if (!sessao) return new Response("Não autenticado", { status: 401 });

  const { predio: rawPredio } = await ctx.params;
  if (rawPredio !== "novo" && rawPredio !== "antigo") {
    return new Response("Prédio inválido", { status: 400 });
  }
  const predio = rawPredio as Predio;

  const [conf] = await db
    .select()
    .from(conferencias)
    .where(eq(conferencias.status, "aberta"))
    .limit(1);
  if (!conf) {
    return new Response("Sem conferência aberta", { status: 404 });
  }

  const rows = await db
    .select({
      nome: inscricoes.nome,
      genero: inscricoes.genero,
      alojamento: inscricoes.alojamento,
      tipoCama: inscricoes.tipoCama,
      criadoEm: inscricoes.criadoEm,
    })
    .from(inscricoes)
    .where(eq(inscricoes.conferenciaId, conf.id));

  const linhas = alocarCamas(rows, predio, conf);
  const genero = generoDoPredio(predio, conf);
  const cfg = PREDIOS[predio];

  const headerCells = ["Nome do Aluno(a)", "Quarto", "Tipo de Cama", "Nº Cama"];

  const tabela = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        tableHeader: true,
        children: headerCells.map(
          (txt) =>
            new TableCell({
              children: [
                new Paragraph({
                  children: [new TextRun({ text: txt, bold: true })],
                }),
              ],
            }),
        ),
      }),
      ...linhas.map(
        (l) =>
          new TableRow({
            children: [
              cell(l.nome),
              cell(String(l.quarto)),
              cell(l.tipoCama === "baixo" ? "Cama de baixo" : "Cama de cima"),
              cell(String(l.numeroCama)),
            ],
          }),
      ),
    ],
  });

  const doc = new Document({
    sections: [
      {
        children: [
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            children: [new TextRun({ text: `Relatório — ${cfg.label}` })],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `Conferência: ${conf.nome} · Alojamento ${genero === "Feminino" ? "feminino" : "masculino"} · Total: ${linhas.length} aluno(a)s`,
              }),
            ],
          }),
          new Paragraph({ text: "" }),
          tabela,
        ],
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  const filename = nomeArquivoRelatorio(predio, conf.ano, conf.mes);

  return new Response(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}

function cell(text: string): TableCell {
  return new TableCell({
    children: [new Paragraph({ children: [new TextRun({ text })] })],
  });
}
