import { describe, it, expect } from "vitest";
import { criarRateLimiter } from "@/lib/rate-limit";

describe("criarRateLimiter", () => {
  it("permite até N hits dentro da janela", () => {
    const rl = criarRateLimiter({ janelaMs: 1000, max: 3 });
    expect(rl.permite("1.1.1.1")).toBe(true);
    expect(rl.permite("1.1.1.1")).toBe(true);
    expect(rl.permite("1.1.1.1")).toBe(true);
    expect(rl.permite("1.1.1.1")).toBe(false);
  });
  it("isola por chave", () => {
    const rl = criarRateLimiter({ janelaMs: 1000, max: 1 });
    expect(rl.permite("a")).toBe(true);
    expect(rl.permite("b")).toBe(true);
    expect(rl.permite("a")).toBe(false);
  });
});
