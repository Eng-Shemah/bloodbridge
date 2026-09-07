import { Bar, BarChart, CartesianGrid, Cell, ReferenceLine, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { StockEntry } from "@/types";

const chartConfig = {
  units_available: { label: "Units available" },
} satisfies ChartConfig;

export function StockChart({ stock }: { stock: StockEntry[] }) {
  const data = [...stock].sort((a, b) => a.blood_type.localeCompare(b.blood_type));
  const threshold = data[0]?.low_stock_threshold ?? 5;

  return (
    <ChartContainer config={chartConfig} className="aspect-auto h-56 w-full">
      <BarChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis
          dataKey="blood_type"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          fontSize={12}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          fontSize={12}
          allowDecimals={false}
        />
        <ReferenceLine
          y={threshold}
          stroke="var(--color-destructive)"
          strokeDasharray="4 4"
          strokeOpacity={0.6}
          label={{
            value: "Low-stock line",
            position: "insideTopRight",
            fontSize: 10,
            fill: "var(--color-destructive)",
          }}
        />
        <ChartTooltip
          cursor={{ fill: "var(--color-muted)", opacity: 0.4 }}
          content={<ChartTooltipContent />}
        />
        <Bar
          dataKey="units_available"
          radius={[6, 6, 0, 0]}
          animationDuration={700}
          animationEasing="ease-out"
        >
          {data.map((entry) => (
            <Cell
              key={entry.id}
              fill={
                entry.units_available <= entry.low_stock_threshold
                  ? "var(--color-destructive)"
                  : "var(--color-primary)"
              }
            />
          ))}
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}
