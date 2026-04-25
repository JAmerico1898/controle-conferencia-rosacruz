"use client";

import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

export function PorEstado({ rows }: { rows: { estado: string; n: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={rows} layout="vertical">
        <XAxis type="number" stroke="#1A1611" fontSize={12} />
        <YAxis
          type="category"
          dataKey="estado"
          stroke="#1A1611"
          fontSize={12}
          width={50}
        />
        <Tooltip />
        <Bar dataKey="n" fill="#8B5E3C" />
      </BarChart>
    </ResponsiveContainer>
  );
}
