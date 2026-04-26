import { PREDIOS, type Predio, type PredioPrincipal } from "./constants";

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

export type ConfPredios = {
  predioFeminino: PredioPrincipal;
  predioMasculino: PredioPrincipal;
  extraFeminino: boolean;
  extraMasculino: boolean;
};

function somar(a: Capacidade, b: Capacidade): Capacidade {
  return { baixo: a.baixo + b.baixo, cima: a.cima + b.cima };
}

function capacidadeDe(predios: Predio[]): Capacidade {
  return predios.reduce<Capacidade>(
    (acc, p) => somar(acc, { baixo: PREDIOS[p].baixo, cima: PREDIOS[p].cima }),
    { baixo: 0, cima: 0 },
  );
}

export function prediosDoGenero(
  conf: ConfPredios,
  genero: "Masculino" | "Feminino",
): Predio[] {
  if (genero === "Feminino") {
    return conf.extraFeminino
      ? [conf.predioFeminino, "extra"]
      : [conf.predioFeminino];
  }
  return conf.extraMasculino
    ? [conf.predioMasculino, "extra"]
    : [conf.predioMasculino];
}

export function calcularVagas(
  inscricoes: InscricaoMin[],
  conf: ConfPredios,
): Vagas {
  const capF = capacidadeDe(prediosDoGenero(conf, "Feminino"));
  const capM = capacidadeDe(prediosDoGenero(conf, "Masculino"));
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
