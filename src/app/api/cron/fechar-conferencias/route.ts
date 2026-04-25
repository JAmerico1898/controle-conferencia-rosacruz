import { and, eq, lt } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { conferencias } from "@/lib/db/schema";

export async function GET(req: Request) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }
  const fechadas = await db
    .update(conferencias)
    .set({ status: "fechada" })
    .where(
      and(
        eq(conferencias.status, "aberta"),
        lt(conferencias.inscricoesFim, new Date()),
      ),
    )
    .returning({ id: conferencias.id });
  return Response.json({ fechadas: fechadas.length });
}
