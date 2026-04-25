"use client";

import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

export function PorDiscipulado({
  rows,
}: {
  rows: { discipulado: string; n: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={rows} layout="vertical">
        <XAxis type="number" stroke="#1A1611" fontSize={12} />
        <YAxis
          type="category"
          dataKey="discipulado"
          stroke="#1A1611"
          fontSize={12}
          width={130}
        />
        <Tooltip />
        <Bar dataKey="n" fill="#D4A24C" />
      </BarChart>
    </ResponsiveContainer>
  );
}
