import { describe, it, expect } from "vitest";
import { refeicoesPermitidas, validarRefeicoes } from "@/lib/refeicoes";

describe("refeicoesPermitidas", () => {
  it("sábado manhã + alojado: tudo + café domingo automático", () => {
    expect(refeicoesPermitidas({ alojamento: true, dataChegada: "sabado_manha" })).toEqual({
      almocoSabado: true, jantarSabado: true,
      lancheDomingo: true, cafeDomingo: "auto",
    });
  });
  it("sábado tarde + alojado: sem almoço, café domingo automático", () => {
    expect(refeicoesPermitidas({ alojamento: true, dataChegada: "sabado_tarde" })).toEqual({
      almocoSabado: false, jantarSabado: true,
      lancheDomingo: true, cafeDomingo: "auto",
    });
  });
  it("não alojado: sem café domingo, refeições livres", () => {
    expect(refeicoesPermitidas({ alojamento: false })).toEqual({
      almocoSabado: true, jantarSabado: true,
      lancheDomingo: true, cafeDomingo: false,
    });
  });
});

describe("validarRefeicoes", () => {
  it("rejeita almoço sábado se chegada é sábado tarde", () => {
    const r = validarRefeicoes({
      alojamento: true, dataChegada: "sabado_tarde",
      almocoSabado: true, jantarSabado: false, lancheDomingo: false,
    });
    expect(r.ok).toBe(false);
  });
  it("força café domingo=true para alojado", () => {
    const r = validarRefeicoes({
      alojamento: true, dataChegada: "sabado_manha",
      almocoSabado: false, jantarSabado: false, lancheDomingo: false,
    });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.cafeDomingo).toBe(true);
  });
  it("força café domingo=false para não alojado", () => {
    const r = validarRefeicoes({
      alojamento: false,
      almocoSabado: true, jantarSabado: false, lancheDomingo: false,
    });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.cafeDomingo).toBe(false);
  });
});
