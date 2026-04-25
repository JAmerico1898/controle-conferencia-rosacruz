CREATE TYPE "public"."data_chegada" AS ENUM('sabado_manha', 'sabado_tarde');--> statement-breakpoint
CREATE TYPE "public"."genero" AS ENUM('Masculino', 'Feminino');--> statement-breakpoint
CREATE TYPE "public"."status_conferencia" AS ENUM('aberta', 'fechada');--> statement-breakpoint
CREATE TYPE "public"."status_inscricao" AS ENUM('ativo', 'cancelado');--> statement-breakpoint
CREATE TYPE "public"."tipo_cama" AS ENUM('baixo', 'cima');--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "conferencias" (
	"id" serial PRIMARY KEY NOT NULL,
	"mes" integer NOT NULL,
	"ano" integer NOT NULL,
	"nome" text NOT NULL,
	"inscricoes_abertura" timestamp with time zone NOT NULL,
	"inscricoes_fim" timestamp with time zone NOT NULL,
	"status" "status_conferencia" DEFAULT 'aberta' NOT NULL,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL,
	"criado_por" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "inscricoes" (
	"id" serial PRIMARY KEY NOT NULL,
	"codigo" text NOT NULL,
	"conferencia_id" integer NOT NULL,
	"nome" text NOT NULL,
	"nome_normalizado" text NOT NULL,
	"genero" "genero" NOT NULL,
	"cidade" text NOT NULL,
	"estado" text NOT NULL,
	"discipulado" text NOT NULL,
	"alojamento" boolean NOT NULL,
	"tipo_cama" "tipo_cama",
	"data_chegada" "data_chegada",
	"almoco_sabado" boolean DEFAULT false NOT NULL,
	"jantar_sabado" boolean DEFAULT false NOT NULL,
	"lanche_domingo" boolean DEFAULT false NOT NULL,
	"cafe_domingo" boolean DEFAULT false NOT NULL,
	"email" text NOT NULL,
	"status" "status_inscricao" DEFAULT 'ativo' NOT NULL,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL,
	"cancelado_em" timestamp with time zone,
	"cancelado_por" text,
	"alterado_em" timestamp with time zone,
	"alterado_por" text,
	CONSTRAINT "inscricoes_codigo_unique" UNIQUE("codigo")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "inscricoes" ADD CONSTRAINT "inscricoes_conferencia_id_conferencias_id_fk" FOREIGN KEY ("conferencia_id") REFERENCES "public"."conferencias"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "conferencias_mes_ano_uq" ON "conferencias" USING btree ("mes","ano");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "conferencias_uma_aberta_uq" ON "conferencias" USING btree ("status") WHERE "conferencias"."status" = 'aberta';--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "inscricoes_nome_conf_uq" ON "inscricoes" USING btree ("conferencia_id","nome_normalizado");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "inscricoes_status_idx" ON "inscricoes" USING btree ("conferencia_id","status");