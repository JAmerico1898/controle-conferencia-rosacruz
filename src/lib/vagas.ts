import { CAPACIDADE } from "./constants";

export type InscricaoMin = {
  genero: "Masculino" | "Feminino";
  alojamento: boolean;
  tipoCama: "baixo" | "cima" | null;
  status: "ativo" | "cancelado";
};

export type Vagas = {
  feminino: { baixo: number; cima: number };
  masculino: { baixo: number; cima: number };
  totalAlojados: number;
};

export function calcularVagas(inscricoes: InscricaoMin[]): Vagas {
  const v: Vagas = {
    feminino: { ...CAPACIDADE.feminino },
    masculino: { ...CAPACIDADE.masculino },
    totalAlojados: 0,
  };
  for (const i of inscricoes) {
    if (i.status !== "ativo" || !i.alojamento || !i.tipoCama) continue;
    const grupo = i.genero === "Feminino" ? v.feminino : v.masculino;
    grupo[i.tipoCama] -= 1;
    v.totalAlojados += 1;
  }
  return v;
}

export function vagasEsgotadas(
  v: Vagas,
  genero: "Masculino" | "Feminino",
  tipo: "baixo" | "cima",
): boolean {
  const g = genero === "Feminino" ? v.feminino : v.masculino;
  return g[tipo] <= 0;
}
