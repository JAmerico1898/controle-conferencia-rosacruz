import { MESES_CONFERENCIA } from "./constants";

export function gerarCodigoInscricao(params: {
  mes: number;
  ano: number;
  sequencial: number;
}): string {
  const m = MESES_CONFERENCIA.find((x) => x.num === params.mes);
  if (!m) throw new Error(`Mês inválido para conferência: ${params.mes}`);
  const seq = String(params.sequencial).padStart(3, "0");
  return `${m.abrev}${params.ano}-${seq}`;
}
