'use client';

import { useEffect, useState } from 'react';
import { Pie, PieChart, ResponsiveContainer, Tooltip, Cell } from 'recharts';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { supabase } from '@/lib/supabase';

type AbsenceRequest = {
  type: string;
};

export default function AbsenceChart() {
  const [chartData, setChartData] = useState<{ name: string; value: number }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const { data: absenceRequests, error } = await supabase
          .from('absence_requests')
          .select('type');

        if (error) {
          console.error('Erro ao carregar dados de ausências:', error);
          return;
        }

        const absenceData = (absenceRequests || []).reduce((acc, request: any) => {
          acc[request.type] = (acc[request.type] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        setChartData(
          Object.entries(absenceData).map(([name, value]) => ({ name, value }))
        );
      } catch (error) {
        console.error('Erro ao processar dados de ausências:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

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
            {chartData.map((entry, index) => {
              const config = chartConfig[entry.name as keyof typeof chartConfig];
              const color = (config && 'color' in config) ? config.color : 'hsl(var(--chart-1))';
              return <Cell key={`cell-${index}`} fill={color} />;
            })}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
