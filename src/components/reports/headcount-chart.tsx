'use client';

import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getEmployees } from '@/lib/data';
import { Employee } from '@/types';

export default function HeadcountChart() {
  const [chartData, setChartData] = useState<{ name: string; total: number }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const employees = await getEmployees();
        const data = employees.reduce((acc: Record<string, number>, employee: Employee) => {
          if (employee.status === 'active') {
            acc[employee.department] = (acc[employee.department] || 0) + 1;
          }
          return acc;
        }, {} as Record<string, number>);

        setChartData(
          Object.entries(data).map(([name, total]) => ({
            name,
            total: total as number,
          }))
        );
      } catch (error) {
        console.error('Erro ao carregar dados do gráfico:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-[200px] w-full aspect-auto flex items-center justify-center">
        <p className="text-muted-foreground">Carregando gráfico...</p>
      </div>
    );
  }

  if (chartData.length === 0) {
    return (
      <div className="min-h-[200px] w-full aspect-auto flex items-center justify-center">
        <p className="text-muted-foreground">Nenhum dado disponível</p>
      </div>
    );
  }

  return (
    <div className="min-h-[200px] w-full aspect-auto">
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
          <Tooltip />
          <Bar dataKey="total" fill="var(--color-total)" radius={4} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
