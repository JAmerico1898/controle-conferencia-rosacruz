import { MESES_CONFERENCIA } from "./constants";

export function formatarNomeConferencia(mes: number, ano: number): string {
  const m = MESES_CONFERENCIA.find((x) => x.num === mes);
  if (!m) throw new Error(`Mês inválido: ${mes}`);
  return `${m.nome} ${ano}`;
}

type Resultado = { ok: true } | { ok: false; erro: string };

export function validarAberturaConferencia(input: {
  mes: number;
  ano: number;
  inscricoesAbertura?: Date;
  inscricoesFim?: Date;
}): Resultado {
  if (!MESES_CONFERENCIA.some((m) => m.num === input.mes)) {
    return { ok: false, erro: "Não há conferências em janeiro nem julho." };
  }
  if (
    input.inscricoesAbertura &&
    input.inscricoesFim &&
    input.inscricoesFim < input.inscricoesAbertura
  ) {
    return { ok: false, erro: "A data de fim deve ser posterior à abertura." };
  }
  return { ok: true };
}

export function deveEstarFechada(args: {
  inscricoesFim: Date;
  agora: Date;
}): boolean {
  return args.agora > args.inscricoesFim;
}
