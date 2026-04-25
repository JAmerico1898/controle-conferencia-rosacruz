"use client";

import { Pie, PieChart, ResponsiveContainer, Cell, Tooltip, Legend } from "recharts";

export function PorGenero({ rows }: { rows: { genero: string; n: number }[] }) {
  const cores = ["#D4A24C", "#8B5E3C"];
  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie data={rows} dataKey="n" nameKey="genero" outerRadius={90} label>
          {rows.map((_, i) => (
            <Cell key={i} fill={cores[i % cores.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
