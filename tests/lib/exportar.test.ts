import { describe, it, expect } from "vitest";
import { gerarCSV } from "@/lib/exportar";

describe("gerarCSV", () => {
  it("escapa vírgulas e aspas", () => {
    const csv = gerarCSV(["nome", "obs"], [{ nome: 'Ana, "a"', obs: "ok" }]);
    expect(csv).toContain('"Ana, ""a""",ok');
  });
  it("ordem das colunas é preservada", () => {
    const csv = gerarCSV(["b", "a"], [{ a: 1, b: 2 }]);
    expect(csv.split("\n")[0]).toBe("b,a");
    expect(csv.split("\n")[1]).toBe("2,1");
  });
});
