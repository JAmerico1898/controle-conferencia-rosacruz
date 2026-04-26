import { describe, it, expect } from "vitest";
import {
  calcularVagas,
  vagasEsgotadas,
  type ConfPredios,
  type InscricaoMin,
  type Vagas,
} from "@/lib/vagas";

const conf: ConfPredios = {
  predioFeminino: "antigo",
  predioMasculino: "novo",
  extraFeminino: false,
  extraMasculino: false,
};

const confExtraF: ConfPredios = { ...conf, extraFeminino: true };

describe("calcularVagas", () => {
  it("sem inscritos: tudo disponível", () => {
    const v = calcularVagas([], conf);
    expect(v.feminino).toEqual({ baixo: 25, cima: 25 });
    expect(v.masculino).toEqual({ baixo: 24, cima: 24 });
    expect(v.totalAlojados).toBe(0);
  });
  it("ignora cancelados", () => {
    const ins: InscricaoMin[] = [
      { genero: "Feminino", alojamento: true, tipoCama: "baixo", status: "cancelado" },
      { genero: "Feminino", alojamento: true, tipoCama: "baixo", status: "ativo" },
    ];
    const v = calcularVagas(ins, conf);
    expect(v.feminino.baixo).toBe(24);
    expect(v.totalAlojados).toBe(1);
  });
  it("ignora não alojados", () => {
    const ins: InscricaoMin[] = [
      { genero: "Masculino", alojamento: false, tipoCama: null, status: "ativo" },
    ];
    expect(calcularVagas(ins, conf).masculino.baixo).toBe(24);
  });
  it("decrementa por gênero e tipo", () => {
    const ins: InscricaoMin[] = [
      { genero: "Masculino", alojamento: true, tipoCama: "cima", status: "ativo" },
      { genero: "Masculino", alojamento: true, tipoCama: "cima", status: "ativo" },
      { genero: "Feminino", alojamento: true, tipoCama: "baixo", status: "ativo" },
    ];
    const v = calcularVagas(ins, conf);
    expect(v.masculino.cima).toBe(22);
    expect(v.feminino.baixo).toBe(24);
    expect(v.totalAlojados).toBe(3);
  });
  it("soma capacidade do prédio extra ao gênero atribuído", () => {
    const v = calcularVagas([], confExtraF);
    expect(v.capacidade.feminino.baixo).toBe(25 + 2);
    expect(v.capacidade.masculino.baixo).toBe(24);
  });
});

describe("vagasEsgotadas", () => {
  it("retorna true quando o tipo está zerado", () => {
    const v: Vagas = {
      capacidade: { feminino: { baixo: 25, cima: 25 }, masculino: { baixo: 24, cima: 24 } },
      feminino: { baixo: 0, cima: 5 },
      masculino: { baixo: 10, cima: 10 },
      totalAlojados: 30,
    };
    expect(vagasEsgotadas(v, "Feminino", "baixo")).toBe(true);
    expect(vagasEsgotadas(v, "Feminino", "cima")).toBe(false);
  });
});
