import { describe, it, expect } from "vitest";
import bcrypt from "bcryptjs";
import { parseAdminUsers, verificarCredenciais } from "@/lib/auth";

const hashSenha = bcrypt.hashSync("segredo", 4);
const env = `admin:${hashSenha},maria:${hashSenha}`;

describe("parseAdminUsers", () => {
  it("parseia múltiplos usuários separados por vírgula", () => {
    const users = parseAdminUsers(env);
    expect(users).toHaveLength(2);
    expect(users[0].login).toBe("admin");
    expect(users[1].login).toBe("maria");
  });
  it("ignora entradas vazias", () => {
    expect(parseAdminUsers("")).toHaveLength(0);
  });
});

describe("verificarCredenciais", () => {
  it("aceita login+senha corretos", async () => {
    expect(await verificarCredenciais("admin", "segredo", env)).toBe(true);
  });
  it("rejeita senha errada", async () => {
    expect(await verificarCredenciais("admin", "errada", env)).toBe(false);
  });
  it("rejeita login inexistente", async () => {
    expect(await verificarCredenciais("nope", "segredo", env)).toBe(false);
  });
});
