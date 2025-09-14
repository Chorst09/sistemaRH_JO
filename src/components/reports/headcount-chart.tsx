'use client';

import { Bar, BarChart, CartesianGrid, XAxis, ResponsiveContainer, YAxis, Tooltip } from 'recharts';
import {
  ChartContainer,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { employees } from '@/lib/data';

const departmentData = employees.reduce((acc, employee) => {
    if (employee.status === 'Ativo') {
        acc[employee.department] = (acc[employee.department] || 0) + 1;
    }
    return acc;
}, {} as Record<string, number>);

const chartData = Object.entries(departmentData).map(([name, total]) => ({ name, total }));


const chartConfig = {
  total: {
    label: 'Efetivo',
    color: 'hsl(var(--chart-1))',
  },
};

export default function HeadcountChart() {
  return (
    <ChartContainer config={chartConfig} className="min-h-[200px] w-full aspect-auto">
      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={chartData} margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid vertical={false} />
            <XAxis
            dataKey="name"
            tickLine={false}
            tickMargin={10}
            axisLine={false}
            />
            <YAxis />
            <Tooltip content={<ChartTooltipContent />} />
            <Bar dataKey="total" fill="var(--color-total)" radius={4} />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
