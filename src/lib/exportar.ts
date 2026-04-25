function escapar(v: unknown): string {
  if (v == null) return "";
  const s = String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function gerarCSV<T extends Record<string, unknown>>(
  colunas: (keyof T)[],
  rows: T[],
): string {
  const head = colunas.map((c) => String(c)).join(",");
  const body = rows
    .map((r) => colunas.map((c) => escapar(r[c])).join(","))
    .join("\n");
  return `${head}\n${body}`;
}
