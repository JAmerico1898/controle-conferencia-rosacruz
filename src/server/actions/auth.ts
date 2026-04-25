"use server";

import { redirect } from "next/navigation";
import { criarSessao, destruirSessao, verificarCredenciais } from "@/lib/auth";

export async function loginAction(_: unknown, formData: FormData) {
  const login = String(formData.get("login") ?? "").trim();
  const senha = String(formData.get("senha") ?? "");
  if (!(await verificarCredenciais(login, senha))) {
    return { erro: "Login ou senha inválidos." };
  }
  await criarSessao(login);
  redirect("/admin/conferencias");
}

export async function logoutAction() {
  await destruirSessao();
  redirect("/");
}
