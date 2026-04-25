import { describe, it, expect } from "vitest";
import { gerarCodigoInscricao } from "@/lib/codigo-inscricao";

describe("gerarCodigoInscricao", () => {
  it("formata MES+ANO-NNN com zero-padding", () => {
    expect(gerarCodigoInscricao({ mes: 3, ano: 2025, sequencial: 1 })).toBe("MAR2025-001");
    expect(gerarCodigoInscricao({ mes: 3, ano: 2025, sequencial: 42 })).toBe("MAR2025-042");
    expect(gerarCodigoInscricao({ mes: 11, ano: 2026, sequencial: 100 })).toBe("NOV2026-100");
  });
  it("rejeita meses inválidos (jan, jul)", () => {
    expect(() => gerarCodigoInscricao({ mes: 1, ano: 2025, sequencial: 1 })).toThrow();
    expect(() => gerarCodigoInscricao({ mes: 7, ano: 2025, sequencial: 1 })).toThrow();
  });
});
