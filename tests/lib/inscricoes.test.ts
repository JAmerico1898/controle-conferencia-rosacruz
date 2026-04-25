import { describe, it, expect } from "vitest";
import { validarPayloadInscricao } from "@/lib/inscricoes";

const base = {
  nome: "Ana Silva",
  genero: "Feminino" as const,
  cidade: "Niterói",
  estado: "RJ",
  discipulado: "1º Aspecto",
  email: "ana@x.com",
};

describe("validarPayloadInscricao", () => {
  it("aceita inscrição sem alojamento", () => {
    const r = validarPayloadInscricao({
      ...base, alojamento: false,
      almocoSabado: true, jantarSabado: false, lancheDomingo: false,
    });
    expect(r.ok).toBe(true);
  });
  it("exige tipo_cama e data_chegada quando alojado", () => {
    const r = validarPayloadInscricao({
      ...base, alojamento: true,
      almocoSabado: false, jantarSabado: false, lancheDomingo: false,
    });
    expect(r.ok).toBe(false);
  });
  it("rejeita estado inválido", () => {
    const r = validarPayloadInscricao({
      ...base, estado: "ZZ", alojamento: false,
      almocoSabado: false, jantarSabado: false, lancheDomingo: false,
    });
    expect(r.ok).toBe(false);
  });
  it("rejeita email vazio", () => {
    const r = validarPayloadInscricao({
      ...base, email: "", alojamento: false,
      almocoSabado: false, jantarSabado: false, lancheDomingo: false,
    });
    expect(r.ok).toBe(false);
  });
  it("seta cafeDomingo automaticamente para alojado", () => {
    const r = validarPayloadInscricao({
      ...base, alojamento: true, tipoCama: "baixo", dataChegada: "sabado_manha",
      almocoSabado: true, jantarSabado: true, lancheDomingo: true,
    });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.cafeDomingo).toBe(true);
  });
});
