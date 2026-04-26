export const PREDIOS = {
  novo: {
    baixo: 24,
    cima: 24,
    label: "Prédio novo",
    quartos: 4,
    camasPorQuarto: 6,
  },
  antigo: {
    baixo: 25,
    cima: 25,
    label: "Prédio antigo",
    quartos: 1,
    camasPorQuarto: 25,
  },
  extra: {
    baixo: 2,
    cima: 0,
    label: "Prédio extra",
    quartos: 1,
    camasPorQuarto: 2,
  },
} as const;
export type Predio = keyof typeof PREDIOS;
export type PredioPrincipal = "novo" | "antigo";
export const PREDIO_VALUES = ["novo", "antigo"] as const;
export const PREDIO_PRINCIPAIS: readonly PredioPrincipal[] = ["novo", "antigo"];

export const MESES_CONFERENCIA = [
  { num: 2, nome: "Fevereiro", abrev: "FEV" },
  { num: 3, nome: "Março", abrev: "MAR" },
  { num: 4, nome: "Abril", abrev: "ABR" },
  { num: 5, nome: "Maio", abrev: "MAI" },
  { num: 6, nome: "Junho", abrev: "JUN" },
  { num: 8, nome: "Agosto", abrev: "AGO" },
  { num: 9, nome: "Setembro", abrev: "SET" },
  { num: 10, nome: "Outubro", abrev: "OUT" },
  { num: 11, nome: "Novembro", abrev: "NOV" },
  { num: 12, nome: "Dezembro", abrev: "DEZ" },
] as const;

export const ESTADOS_BR = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA",
  "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN",
  "RS", "RO", "RR", "SC", "SP", "SE", "TO",
] as const;

export const DISCIPULADOS = [
  "1º Aspecto",
  "2º Aspecto",
  "3º Aspecto",
  "4º Aspecto",
  "Graal",
  "Escola Interior",
] as const;

export const GENEROS = ["Masculino", "Feminino"] as const;
export const TIPOS_CAMA = ["baixo", "cima"] as const;
export const DATAS_CHEGADA = ["sabado_manha", "sabado_tarde"] as const;
export const STATUS_CONFERENCIA = ["aberta", "fechada"] as const;
export const STATUS_INSCRICAO = ["ativo", "cancelado"] as const;

export type Genero = (typeof GENEROS)[number];
export type TipoCama = (typeof TIPOS_CAMA)[number];
export type DataChegada = (typeof DATAS_CHEGADA)[number];
export type StatusConferencia = (typeof STATUS_CONFERENCIA)[number];
export type StatusInscricao = (typeof STATUS_INSCRICAO)[number];
export type Discipulado = (typeof DISCIPULADOS)[number];
export type Estado = (typeof ESTADOS_BR)[number];
