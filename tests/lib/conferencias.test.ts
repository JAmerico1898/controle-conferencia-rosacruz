import { describe, it, expect } from "vitest";
import {
  validarAberturaConferencia,
  deveEstarFechada,
  formatarNomeConferencia,
} from "@/lib/conferencias";

describe("formatarNomeConferencia", () => {
  it("formata 'Março 2025'", () => {
    expect(formatarNomeConferencia(3, 2025)).toBe("Março 2025");
  });
});

describe("validarAberturaConferencia", () => {
  it("rejeita janeiro e julho", () => {
    expect(validarAberturaConferencia({ mes: 1, ano: 2025 }).ok).toBe(false);
    expect(validarAberturaConferencia({ mes: 7, ano: 2025 }).ok).toBe(false);
  });
  it("rejeita fim antes da abertura", () => {
    const r = validarAberturaConferencia({
      mes: 3, ano: 2025,
      inscricoesAbertura: new Date("2025-03-10"),
      inscricoesFim: new Date("2025-03-05"),
    });
    expect(r.ok).toBe(false);
  });
  it("aceita mês válido + datas coerentes", () => {
    const r = validarAberturaConferencia({
      mes: 3, ano: 2025,
      inscricoesAbertura: new Date("2025-02-01"),
      inscricoesFim: new Date("2025-03-01"),
    });
    expect(r.ok).toBe(true);
  });
});

describe("deveEstarFechada", () => {
  it("true se inscricoesFim já passou", () => {
    expect(
      deveEstarFechada({
        inscricoesFim: new Date("2025-01-01"),
        agora: new Date("2025-02-01"),
      }),
    ).toBe(true);
  });
  it("false se ainda no prazo", () => {
    expect(
      deveEstarFechada({
        inscricoesFim: new Date("2025-12-31"),
        agora: new Date("2025-06-01"),
      }),
    ).toBe(false);
  });
});
