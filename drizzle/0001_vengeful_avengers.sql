CREATE TYPE "public"."predio" AS ENUM('novo', 'antigo');--> statement-breakpoint
ALTER TABLE "conferencias" ADD COLUMN "predio_feminino" "predio" DEFAULT 'antigo' NOT NULL;--> statement-breakpoint
ALTER TABLE "conferencias" ADD COLUMN "predio_masculino" "predio" DEFAULT 'novo' NOT NULL;