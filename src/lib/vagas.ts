import { PREDIOS, type Predio } from "./constants";

export type InscricaoMin = {
  genero: "Masculino" | "Feminino";
  alojamento: boolean;
  tipoCama: "baixo" | "cima" | null;
  status: "ativo" | "cancelado";
};

export type Capacidade = { baixo: number; cima: number };

export type Vagas = {
  capacidade: { feminino: Capacidade; masculino: Capacidade };
  feminino: Capacidade;
  masculino: Capacidade;
  totalAlojados: number;
};

export function calcularVagas(
  inscricoes: InscricaoMin[],
  predioFeminino: Predio,
  predioMasculino: Predio,
): Vagas {
  const capF: Capacidade = {
    baixo: PREDIOS[predioFeminino].baixo,
    cima: PREDIOS[predioFeminino].cima,
  };
  const capM: Capacidade = {
    baixo: PREDIOS[predioMasculino].baixo,
    cima: PREDIOS[predioMasculino].cima,
  };
  const v: Vagas = {
    capacidade: { feminino: capF, masculino: capM },
    feminino: { ...capF },
    masculino: { ...capM },
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
