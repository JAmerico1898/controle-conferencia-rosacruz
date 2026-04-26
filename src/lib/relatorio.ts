import { PREDIOS, type Predio, MESES_CONFERENCIA } from "./constants";
import type { ConfPredios } from "./vagas";

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
  conf: ConfPredios,
): "Masculino" | "Feminino" | null {
  if (predio === "extra") {
    if (conf.extraFeminino) return "Feminino";
    if (conf.extraMasculino) return "Masculino";
    return null;
  }
  if (conf.predioFeminino === predio) return "Feminino";
  if (conf.predioMasculino === predio) return "Masculino";
  return null;
}

export function alocarCamas(
  alunos: AlunoBruto[],
  predio: Predio,
  conf: ConfPredios,
): LinhaRelatorio[] {
  const genero = generoDoPredio(predio, conf);
  if (!genero) return [];

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

  const principal =
    genero === "Feminino" ? conf.predioFeminino : conf.predioMasculino;
  const usaExtra =
    genero === "Feminino" ? conf.extraFeminino : conf.extraMasculino;
  const principalBaixo = PREDIOS[principal].baixo;

  for (const tipo of ["baixo", "cima"] as const) {
    const grupo = elegiveis.filter((a) => a.tipoCama === tipo);

    if (predio === "extra") {
      // Extra só recebe overflow de "baixo", após esgotar o principal.
      if (tipo === "cima" || !usaExtra) continue;
      const overflow = grupo.slice(principalBaixo);
      overflow.forEach((a, i) => {
        const quarto = Math.floor(i / cfg.camasPorQuarto) + 1;
        const numeroCama = (i % cfg.camasPorQuarto) + 1;
        linhas.push({ nome: a.nome, quarto, tipoCama: tipo, numeroCama });
      });
      continue;
    }

    // Prédio principal: limita "baixo" à própria capacidade quando há extra.
    const ocupantes =
      tipo === "baixo" && usaExtra ? grupo.slice(0, principalBaixo) : grupo;
    ocupantes.forEach((a, i) => {
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
