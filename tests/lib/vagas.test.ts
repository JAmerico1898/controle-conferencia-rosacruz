import { describe, it, expect } from "vitest";
import { calcularVagas, vagasEsgotadas, type InscricaoMin } from "@/lib/vagas";

describe("calcularVagas", () => {
  it("sem inscritos: tudo disponível", () => {
    expect(calcularVagas([])).toEqual({
      feminino: { baixo: 26, cima: 24 },
      masculino: { baixo: 25, cima: 25 },
      totalAlojados: 0,
    });
  });
  it("ignora cancelados", () => {
    const ins: InscricaoMin[] = [
      { genero: "Feminino", alojamento: true, tipoCama: "baixo", status: "cancelado" },
      { genero: "Feminino", alojamento: true, tipoCama: "baixo", status: "ativo" },
    ];
    const v = calcularVagas(ins);
    expect(v.feminino.baixo).toBe(25);
    expect(v.totalAlojados).toBe(1);
  });
  it("ignora não alojados", () => {
    const ins: InscricaoMin[] = [
      { genero: "Masculino", alojamento: false, tipoCama: null, status: "ativo" },
    ];
    expect(calcularVagas(ins).masculino.baixo).toBe(25);
  });
  it("decrementa por gênero e tipo", () => {
    const ins: InscricaoMin[] = [
      { genero: "Masculino", alojamento: true, tipoCama: "cima", status: "ativo" },
      { genero: "Masculino", alojamento: true, tipoCama: "cima", status: "ativo" },
      { genero: "Feminino", alojamento: true, tipoCama: "baixo", status: "ativo" },
    ];
    const v = calcularVagas(ins);
    expect(v.masculino.cima).toBe(23);
    expect(v.feminino.baixo).toBe(25);
    expect(v.totalAlojados).toBe(3);
  });
});

describe("vagasEsgotadas", () => {
  it("retorna true quando o tipo está zerado", () => {
    const v = { feminino: { baixo: 0, cima: 5 }, masculino: { baixo: 10, cima: 10 }, totalAlojados: 30 };
    expect(vagasEsgotadas(v, "Feminino", "baixo")).toBe(true);
    expect(vagasEsgotadas(v, "Feminino", "cima")).toBe(false);
  });
});
