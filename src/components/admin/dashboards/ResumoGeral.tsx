"use client";

import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";
import type { Vagas } from "@/lib/vagas";

export function ResumoGeral({ vagas }: { vagas: Vagas }) {
  const data = [
    {
      nome: "Fem · baixo",
      ocupado: vagas.capacidade.feminino.baixo - vagas.feminino.baixo,
      livre: vagas.feminino.baixo,
    },
    {
      nome: "Fem · cima",
      ocupado: vagas.capacidade.feminino.cima - vagas.feminino.cima,
      livre: vagas.feminino.cima,
    },
    {
      nome: "Mas · baixo",
      ocupado: vagas.capacidade.masculino.baixo - vagas.masculino.baixo,
      livre: vagas.masculino.baixo,
    },
    {
      nome: "Mas · cima",
      ocupado: vagas.capacidade.masculino.cima - vagas.masculino.cima,
      livre: vagas.masculino.cima,
    },
  ];
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data}>
        <XAxis dataKey="nome" stroke="#1A1611" fontSize={12} />
        <YAxis stroke="#1A1611" fontSize={12} />
        <Tooltip />
        <Legend />
        <Bar dataKey="ocupado" stackId="a" fill="#8B5E3C" />
        <Bar dataKey="livre" stackId="a" fill="#D4A24C" />
      </BarChart>
    </ResponsiveContainer>
  );
}
