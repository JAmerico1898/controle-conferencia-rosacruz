import { redirect } from "next/navigation";
import { getSessao } from "@/lib/auth";
import { AdminNav } from "@/components/admin/AdminNav";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const sessao = await getSessao();
  if (!sessao) redirect("/login");
  return (
    <div className="min-h-screen flex flex-col">
      <AdminNav login={sessao.login} />
      <main className="flex-1 mx-auto w-full max-w-6xl px-6 py-10">
        {children}
      </main>
    </div>
  );
}
