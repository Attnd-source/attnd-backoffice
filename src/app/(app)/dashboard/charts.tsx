"use client";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from "recharts";

const COLORS = ["#5507cf", "#7C3AED", "#ef5a29", "#22c55e", "#ef4444", "#0ea5e9"];

export function StatusBar({ data }: { data: { name: string; value: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#eef2f4" vertical={false} />
        <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#64748b" }} interval={0} angle={-12} textAnchor="end" height={48} />
        <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#64748b" }} />
        <Tooltip cursor={{ fill: "rgba(10,91,103,0.06)" }} />
        <Bar dataKey="value" radius={[6, 6, 0, 0]} fill="#5507cf" />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function StatusPie({ data }: { data: { name: string; value: number }[] }) {
  const nonZero = data.filter((d) => d.value > 0);
  if (nonZero.length === 0) {
    return <p className="py-16 text-center text-sm text-muted-foreground">No data yet.</p>;
  }
  return (
    <ResponsiveContainer width="100%" height={240}>
      <PieChart>
        <Pie data={nonZero} dataKey="value" nameKey="name" innerRadius={50} outerRadius={90} paddingAngle={2}>
          {nonZero.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
      {/* legend */}
    </ResponsiveContainer>
  );
}

export function Legend({ data }: { data: { name: string; value: number }[] }) {
  const nonZero = data.filter((d) => d.value > 0);
  return (
    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
      {nonZero.map((d, i) => (
        <span key={d.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
          {d.name} ({d.value})
        </span>
      ))}
    </div>
  );
}
