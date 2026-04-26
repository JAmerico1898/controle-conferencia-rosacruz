import { z } from "zod";
import {
  ESTADOS_BR, GENEROS, DISCIPULADOS, TIPOS_CAMA, DATAS_CHEGADA,
} from "./constants";
import { validarRefeicoes } from "./refeicoes";

const schema = z.object({
  nome: z.string().trim().min(3, "Nome muito curto"),
  genero: z.enum(GENEROS),
  cidade: z.string().trim().min(2, "Cidade obrigatória"),
  estado: z.enum(ESTADOS_BR, { message: "Estado inválido" }),
  discipulado: z.enum(DISCIPULADOS, { message: "Discipulado inválido" }),
  alojamento: z.boolean(),
  tipoCama: z.enum(TIPOS_CAMA).optional(),
  dataChegada: z.enum(DATAS_CHEGADA).optional(),
  almocoSabado: z.boolean(),
  jantarSabado: z.boolean(),
  lancheDomingo: z.boolean(),
  whatsapp: z
    .string()
    .trim()
    .refine((v) => v.replace(/\D/g, "").length === 11, {
      message: "WhatsApp deve ter 11 dígitos com DDD: (xx) xxxxx-xxxx",
    }),
});

export type PayloadInscricao = z.infer<typeof schema>;
export type InscricaoValidada = PayloadInscricao & { cafeDomingo: boolean };

type Resultado<T> = { ok: true; value: T } | { ok: false; erro: string };

export function formatarWhatsapp(raw: string): string {
  const d = raw.replace(/\D/g, "").slice(0, 11);
  if (d.length < 11) return raw;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7, 11)}`;
}

export function validarPayloadInscricao(input: unknown): Resultado<InscricaoValidada> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, erro: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }
  const v = { ...parsed.data, whatsapp: formatarWhatsapp(parsed.data.whatsapp) };
  if (v.alojamento && (!v.tipoCama || !v.dataChegada)) {
    return { ok: false, erro: "Alojamento exige tipo de cama e data de chegada." };
  }
  const ref = validarRefeicoes({
    alojamento: v.alojamento,
    dataChegada: v.dataChegada,
    almocoSabado: v.almocoSabado,
    jantarSabado: v.jantarSabado,
    lancheDomingo: v.lancheDomingo,
  });
  if (!ref.ok) return { ok: false, erro: ref.erro };
  return { ok: true, value: { ...v, ...ref.value } };
}
