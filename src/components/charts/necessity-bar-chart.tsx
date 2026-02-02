"use client";

import { formatCurrency } from "@/lib/utils";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface NecessityBarChartProps {
  necessary: number;
  unnecessary: number;
  debatable: number;
}

const COLORS = {
  necessary: "#22C55E",
  unnecessary: "#EF4444",
  debatable: "#F59E0B",
};

interface BarTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: {
      name: string;
      amount: number;
      percent: number;
    };
  }>;
}

function CustomTooltip({ active, payload }: BarTooltipProps) {
  if (!active || !payload?.length) return null;
  const item = payload[0].payload;
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-md">
      <p className="text-sm font-medium capitalize">{item.name}</p>
      <p className="text-sm font-mono text-muted-foreground">
        {formatCurrency(item.amount)} ({item.percent.toFixed(1)}%)
      </p>
    </div>
  );
}

export function NecessityBarChart({
  necessary,
  unnecessary,
  debatable,
}: NecessityBarChartProps) {
  const total = necessary + unnecessary + debatable;

  const data = [
    {
      name: "Necessary",
      amount: necessary,
      color: COLORS.necessary,
      percent: total > 0 ? (necessary / total) * 100 : 0,
    },
    {
      name: "Unnecessary",
      amount: unnecessary,
      color: COLORS.unnecessary,
      percent: total > 0 ? (unnecessary / total) * 100 : 0,
    },
    {
      name: "Debatable",
      amount: debatable,
      color: COLORS.debatable,
      percent: total > 0 ? (debatable / total) * 100 : 0,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm text-muted-foreground">
          Spending by Necessity
        </CardTitle>
      </CardHeader>
      <CardContent>
        {total === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-8">
            No expense data for this period
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data} layout="vertical">
              <XAxis
                type="number"
                hide
                domain={[0, Math.max(necessary, unnecessary, debatable) * 1.1]}
              />
              <YAxis
                type="category"
                dataKey="name"
                width={90}
                tick={{ fill: "#A1A1AA", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} cursor={false} />
              <Bar dataKey="amount" radius={[0, 6, 6, 0]} barSize={28}>
                {data.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
