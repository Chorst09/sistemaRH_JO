'use client';

import { Line, LineChart, CartesianGrid, XAxis, ResponsiveContainer, YAxis, Tooltip } from 'recharts';
import {
  ChartContainer,
  ChartTooltipContent,
} from '@/components/ui/chart';

const chartData = [
  { month: 'Jan', rate: 1.2 },
  { month: 'Feb', rate: 0.8 },
  { month: 'Mar', rate: 1.5 },
  { month: 'Apr', rate: 1.1 },
  { month: 'May', rate: 2.0 },
  { month: 'Jun', rate: 0.5 },
  { month: 'Jul', rate: 1.3 },
  { month: 'Aug', rate: 0.9 },
];

const chartConfig = {
  rate: {
    label: 'Turnover Rate (%)',
    color: 'hsl(var(--chart-2))',
  },
};

export default function TurnoverChart() {
  return (
    <ChartContainer config={chartConfig} className="min-h-[200px] w-full aspect-auto">
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="month"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
          />
           <YAxis 
            tickFormatter={(value) => `${value}%`}
          />
          <Tooltip content={<ChartTooltipContent />} />
          <Line
            type="monotone"
            dataKey="rate"
            stroke="var(--color-rate)"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
