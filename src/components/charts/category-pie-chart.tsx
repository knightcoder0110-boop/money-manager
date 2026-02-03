"use client";

import { formatCurrency } from "@/lib/utils";
import type { CategoryBreakdownItem } from "@/types";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CategoryIcon } from "@/components/icons/category-icon";

interface CategoryPieChartProps {
  data: CategoryBreakdownItem[];
  title?: string;
}

const DEFAULT_COLORS = [
  "#3B82F6",
  "#EF4444",
  "#22C55E",
  "#F59E0B",
  "#8B5CF6",
  "#EC4899",
  "#14B8A6",
  "#F97316",
  "#6366F1",
  "#84CC16",
];

interface PieTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: {
      category_name: string;
      category_icon: string;
      total: number;
      percent: number;
    };
  }>;
}

function CustomTooltip({ active, payload }: PieTooltipProps) {
  if (!active || !payload?.length) return null;
  const item = payload[0].payload;
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-md">
      <p className="text-sm font-medium flex items-center gap-1">
        <CategoryIcon icon={item.category_icon} size={14} /> {item.category_name}
      </p>
      <p className="text-sm font-mono text-muted-foreground">
        {formatCurrency(item.total)} ({item.percent.toFixed(1)}%)
      </p>
    </div>
  );
}

export function CategoryPieChart({
  data,
  title = "Category Breakdown",
}: CategoryPieChartProps) {
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm text-muted-foreground">
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-sm text-muted-foreground py-8">
            No expense data for this period
          </p>
        </CardContent>
      </Card>
    );
  }

  const total = data.reduce((sum, item) => sum + item.total, 0);
  const chartData = data.map((item) => ({
    ...item,
    percent: total > 0 ? (item.total / total) * 100 : 0,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={90}
              paddingAngle={2}
              dataKey="total"
              nameKey="category_name"
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={entry.category_id}
                  fill={
                    entry.category_color ||
                    DEFAULT_COLORS[index % DEFAULT_COLORS.length]
                  }
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              formatter={(value: string) => (
                <span className="text-xs text-muted-foreground">{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
