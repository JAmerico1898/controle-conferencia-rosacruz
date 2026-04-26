import {
  pgTable, serial, text, integer, boolean, timestamp,
  pgEnum, uniqueIndex, index,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const generoEnum = pgEnum("genero", ["Masculino", "Feminino"]);
export const tipoCamaEnum = pgEnum("tipo_cama", ["baixo", "cima"]);
export const dataChegadaEnum = pgEnum("data_chegada", ["sabado_manha", "sabado_tarde"]);
export const statusConfEnum = pgEnum("status_conferencia", ["aberta", "fechada"]);
export const statusInscEnum = pgEnum("status_inscricao", ["ativo", "cancelado"]);
export const predioEnum = pgEnum("predio", ["novo", "antigo"]);

export const conferencias = pgTable(
  "conferencias",
  {
    id: serial("id").primaryKey(),
    mes: integer("mes").notNull(),
    ano: integer("ano").notNull(),
    nome: text("nome").notNull(),
    inscricoesAbertura: timestamp("inscricoes_abertura", { withTimezone: true }).notNull(),
    inscricoesFim: timestamp("inscricoes_fim", { withTimezone: true }).notNull(),
    status: statusConfEnum("status").notNull().default("aberta"),
    predioFeminino: predioEnum("predio_feminino").notNull().default("antigo"),
    predioMasculino: predioEnum("predio_masculino").notNull().default("novo"),
    extraFeminino: boolean("extra_feminino").notNull().default(false),
    extraMasculino: boolean("extra_masculino").notNull().default(false),
    criadoEm: timestamp("criado_em", { withTimezone: true }).notNull().defaultNow(),
    criadoPor: text("criado_por").notNull(),
  },
  (t) => ({
    mesAnoUnique: uniqueIndex("conferencias_mes_ano_uq").on(t.mes, t.ano),
    apenasUmaAberta: uniqueIndex("conferencias_uma_aberta_uq")
      .on(t.status)
      .where(sql`${t.status} = 'aberta'`),
  }),
);

export const inscricoes = pgTable(
  "inscricoes",
  {
    id: serial("id").primaryKey(),
    codigo: text("codigo").notNull().unique(),
    conferenciaId: integer("conferencia_id")
      .notNull()
      .references(() => conferencias.id, { onDelete: "restrict" }),
    nome: text("nome").notNull(),
    nomeNormalizado: text("nome_normalizado").notNull(),
    genero: generoEnum("genero").notNull(),
    cidade: text("cidade").notNull(),
    estado: text("estado").notNull(),
    discipulado: text("discipulado").notNull(),
    alojamento: boolean("alojamento").notNull(),
    tipoCama: tipoCamaEnum("tipo_cama"),
    dataChegada: dataChegadaEnum("data_chegada"),
    almocoSabado: boolean("almoco_sabado").notNull().default(false),
    jantarSabado: boolean("jantar_sabado").notNull().default(false),
    lancheDomingo: boolean("lanche_domingo").notNull().default(false),
    cafeDomingo: boolean("cafe_domingo").notNull().default(false),
    whatsapp: text("whatsapp").notNull(),
    status: statusInscEnum("status").notNull().default("ativo"),
    criadoEm: timestamp("criado_em", { withTimezone: true }).notNull().defaultNow(),
    canceladoEm: timestamp("cancelado_em", { withTimezone: true }),
    canceladoPor: text("cancelado_por"),
    alteradoEm: timestamp("alterado_em", { withTimezone: true }),
    alteradoPor: text("alterado_por"),
  },
  (t) => ({
    nomePorConfUnique: uniqueIndex("inscricoes_nome_conf_uq")
      .on(t.conferenciaId, t.nomeNormalizado),
    statusIdx: index("inscricoes_status_idx").on(t.conferenciaId, t.status),
  }),
);

export type Conferencia = typeof conferencias.$inferSelect;
export type ConferenciaNova = typeof conferencias.$inferInsert;
export type Inscricao = typeof inscricoes.$inferSelect;
export type InscricaoNova = typeof inscricoes.$inferInsert;
