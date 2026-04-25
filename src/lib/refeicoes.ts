import type { DataChegada } from "./constants";

type Permissao = boolean | "auto";

export function refeicoesPermitidas(args: {
  alojamento: boolean;
  dataChegada?: DataChegada;
}): {
  almocoSabado: boolean;
  jantarSabado: boolean;
  lancheDomingo: boolean;
  cafeDomingo: Permissao;
} {
  if (!args.alojamento) {
    return {
      almocoSabado: true, jantarSabado: true,
      lancheDomingo: true, cafeDomingo: false,
    };
  }
  if (args.dataChegada === "sabado_tarde") {
    return {
      almocoSabado: false, jantarSabado: true,
      lancheDomingo: true, cafeDomingo: "auto",
    };
  }
  return {
    almocoSabado: true, jantarSabado: true,
    lancheDomingo: true, cafeDomingo: "auto",
  };
}

type Resultado<T> = { ok: true; value: T } | { ok: false; erro: string };

export function validarRefeicoes(input: {
  alojamento: boolean;
  dataChegada?: DataChegada;
  almocoSabado: boolean;
  jantarSabado: boolean;
  lancheDomingo: boolean;
}): Resultado<{
  almocoSabado: boolean;
  jantarSabado: boolean;
  lancheDomingo: boolean;
  cafeDomingo: boolean;
}> {
  const p = refeicoesPermitidas(input);
  if (input.almocoSabado && p.almocoSabado === false) {
    return { ok: false, erro: "Almoço de sábado não disponível para chegada à tarde." };
  }
  return {
    ok: true,
    value: {
      almocoSabado: input.almocoSabado,
      jantarSabado: input.jantarSabado,
      lancheDomingo: input.lancheDomingo,
      cafeDomingo: p.cafeDomingo === "auto",
    },
  };
}
