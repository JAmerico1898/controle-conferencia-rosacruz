type Janela = { hits: number[] };

export function criarRateLimiter(opts: { janelaMs: number; max: number }) {
  const mapa = new Map<string, Janela>();
  return {
    permite(chave: string): boolean {
      const agora = Date.now();
      const j = mapa.get(chave) ?? { hits: [] };
      j.hits = j.hits.filter((t) => agora - t < opts.janelaMs);
      if (j.hits.length >= opts.max) {
        mapa.set(chave, j);
        return false;
      }
      j.hits.push(agora);
      mapa.set(chave, j);
      return true;
    },
  };
}

export const limiterInscricao = criarRateLimiter({
  janelaMs: 60 * 60 * 1000,
  max: 5,
});
