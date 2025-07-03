"use client";

import { useTheme } from "next-themes";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const data = [
  {
    name: "Leads",
    value: 2350,
  },
  {
    name: "Qualified",
    value: 1423,
  },
  {
    name: "Proposals",
    value: 892,
  },
  {
    name: "Negotiations",
    value: 573,
  },
  {
    name: "Closed Won",
    value: 349,
  },
];

export function SalesFunnelChart() {
  const { theme } = useTheme();

  return (
    <div className="bg-gray-100 p-4 rounded-lg border border-blue-200">
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} layout="vertical">
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={theme === "dark" ? "#4B5563" : "#E5E7EB"}
            opacity={0.3}
            horizontal={false}
          />
          <XAxis
            type="number"
            stroke={theme === "dark" ? "#D1D5DB" : "#4B5563"}
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            dataKey="name"
            type="category"
            stroke={theme === "dark" ? "#D1D5DB" : "#4B5563"}
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            cursor={{ fill: theme === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)" }}
            contentStyle={{
              backgroundColor: theme === "dark" ? "#1E293B" : "#FFFFFF",
              borderColor: theme === "dark" ? "#374151" : "#BFDBFE",
              borderRadius: "4px",
              color: theme === "dark" ? "#F9FAFB" : "#1E3A8A",
            }}
            itemStyle={{ color: theme === "dark" ? "#F9FAFB" : "#1E3A8A" }}
          />
          <Bar
            dataKey="value"
            fill="#2563EB"
            radius={[0, 4, 4, 0]}
            barSize={20}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}