import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

export type AdminUser = { login: string; hash: string };
export type Sessao = { login: string };

const COOKIE = "novosol_session";
const ALG = "HS256";

export function parseAdminUsers(envValue: string): AdminUser[] {
  return envValue
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((entry) => {
      const idx = entry.indexOf(":");
      return { login: entry.slice(0, idx), hash: entry.slice(idx + 1) };
    });
}

export async function verificarCredenciais(
  login: string,
  senha: string,
  envValue = process.env.ADMIN_USERS ?? "",
): Promise<boolean> {
  const user = parseAdminUsers(envValue).find((u) => u.login === login);
  if (!user) return false;
  return bcrypt.compare(senha, user.hash);
}

function chave() {
  const s = process.env.SESSION_SECRET;
  if (!s) throw new Error("SESSION_SECRET não configurada");
  return new TextEncoder().encode(s);
}

export async function criarSessao(login: string) {
  const token = await new SignJWT({ login })
    .setProtectedHeader({ alg: ALG })
    .setIssuedAt()
    .setExpirationTime("12h")
    .sign(chave());
  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12,
  });
}

export async function destruirSessao() {
  (await cookies()).delete(COOKIE);
}

export async function getSessao(): Promise<Sessao | null> {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, chave());
    return { login: payload.login as string };
  } catch {
    return null;
  }
}
