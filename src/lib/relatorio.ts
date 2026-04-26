import { PREDIOS, type Predio, MESES_CONFERENCIA } from "./constants";

export type AlunoBruto = {
  nome: string;
  genero: "Masculino" | "Feminino";
  alojamento: boolean;
  tipoCama: "baixo" | "cima" | null;
  criadoEm: Date;
};

export type LinhaRelatorio = {
  nome: string;
  quarto: number;
  tipoCama: "baixo" | "cima";
  numeroCama: number;
};

export function generoDoPredio(
  predio: Predio,
  conf: { predioFeminino: Predio; predioMasculino: Predio },
): "Masculino" | "Feminino" {
  return conf.predioFeminino === predio ? "Feminino" : "Masculino";
}

export function alocarCamas(
  alunos: AlunoBruto[],
  predio: Predio,
  conf: { predioFeminino: Predio; predioMasculino: Predio },
): LinhaRelatorio[] {
  const genero = generoDoPredio(predio, conf);
  const elegiveis = alunos
    .filter(
      (a) =>
        a.genero === genero &&
        a.alojamento &&
        (a.tipoCama === "baixo" || a.tipoCama === "cima"),
    )
    .sort((a, b) => a.criadoEm.getTime() - b.criadoEm.getTime());

  const cfg = PREDIOS[predio];
  const linhas: LinhaRelatorio[] = [];

  for (const tipo of ["baixo", "cima"] as const) {
    const grupo = elegiveis.filter((a) => a.tipoCama === tipo);
    grupo.forEach((a, i) => {
      const quarto = Math.floor(i / cfg.camasPorQuarto) + 1;
      const numeroCama = (i % cfg.camasPorQuarto) + 1;
      linhas.push({ nome: a.nome, quarto, tipoCama: tipo, numeroCama });
    });
  }

  return linhas.sort(
    (a, b) =>
      a.quarto - b.quarto ||
      (a.tipoCama === "baixo" ? -1 : 1) - (b.tipoCama === "baixo" ? -1 : 1) ||
      a.numeroCama - b.numeroCama,
  );
}

export function nomeArquivoRelatorio(
  predio: Predio,
  ano: number,
  mes: number,
): string {
  const meta = MESES_CONFERENCIA.find((m) => m.num === mes);
  const nomeMes = meta?.nome ?? String(mes).padStart(2, "0");
  const mm = String(mes).padStart(2, "0");
  return `relatorio_predio_${predio}_${ano}-${mm}-${nomeMes}.docx`;
}
