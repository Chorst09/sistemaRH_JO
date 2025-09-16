'use client';

import { Pie, PieChart, ResponsiveContainer, Tooltip, Cell } from 'recharts';
import {
  ChartContainer,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { absenceRequests } from '@/lib/data';

const absenceData = absenceRequests.reduce((acc, request) => {
    acc[request.type] = (acc[request.type] || 0) + 1;
    return acc;
}, {} as Record<string, number>);

const chartData = Object.entries(absenceData).map(([name, value]) => ({ name, value }));

const chartConfig = {
  value: {
    label: 'Dias',
  },
  'Férias': {
    label: 'Férias',
    color: 'hsl(var(--chart-1))',
  },
  'Licença Médica': {
    label: 'Licença Médica',
    color: 'hsl(var(--chart-2))',
  },
  'Pessoal': {
    label: 'Pessoal',
    color: 'hsl(var(--chart-3))',
  },
};

export default function AbsenceChart() {
  return (
    <ChartContainer config={chartConfig} className="min-h-[200px] w-full aspect-auto">
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Tooltip content={<ChartTooltipContent nameKey="name" />} />
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={100}
            innerRadius={60}
            paddingAngle={5}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={chartConfig[entry.name as keyof typeof chartConfig].color} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
