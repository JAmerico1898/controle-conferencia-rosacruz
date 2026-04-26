import { describe, it, expect } from "vitest";
import { validarPayloadInscricao, formatarWhatsapp } from "@/lib/inscricoes";

const base = {
  nome: "Ana Silva",
  genero: "Feminino" as const,
  cidade: "Niterói",
  estado: "RJ",
  discipulado: "1º Aspecto",
  whatsapp: "(21) 98765-4321",
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
  it("rejeita whatsapp vazio", () => {
    const r = validarPayloadInscricao({
      ...base, whatsapp: "", alojamento: false,
      almocoSabado: false, jantarSabado: false, lancheDomingo: false,
    });
    expect(r.ok).toBe(false);
  });
  it("rejeita whatsapp com menos de 11 dígitos", () => {
    const r = validarPayloadInscricao({
      ...base, whatsapp: "(21) 9876-4321", alojamento: false,
      almocoSabado: false, jantarSabado: false, lancheDomingo: false,
    });
    expect(r.ok).toBe(false);
  });
  it("normaliza whatsapp para (xx) xxxxx-xxxx", () => {
    const r = validarPayloadInscricao({
      ...base, whatsapp: "21987654321", alojamento: false,
      almocoSabado: false, jantarSabado: false, lancheDomingo: false,
    });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.whatsapp).toBe("(21) 98765-4321");
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

describe("formatarWhatsapp", () => {
  it("formata 11 dígitos puros", () => {
    expect(formatarWhatsapp("21987654321")).toBe("(21) 98765-4321");
  });
  it("preserva já formatado", () => {
    expect(formatarWhatsapp("(21) 98765-4321")).toBe("(21) 98765-4321");
  });
});
