import { describe, it, expect } from "vitest";
import { normalizarNome } from "@/lib/nome";

describe("normalizarNome", () => {
  it("trim + colapsa espaços + lowercase + sem acentos", () => {
    expect(normalizarNome("  José   da Silva  ")).toBe("jose da silva");
  });
  it("trata diferentes capitalizações como o mesmo nome", () => {
    expect(normalizarNome("MARIA DAS DORES")).toBe(normalizarNome("maria das dores"));
  });
  it("remove acentos compostos", () => {
    expect(normalizarNome("João D'Ávila")).toBe("joao d'avila");
  });
});
