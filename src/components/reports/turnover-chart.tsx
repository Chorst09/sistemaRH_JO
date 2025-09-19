'use client';

import { useEffect, useState } from 'react';
import { Line, LineChart, CartesianGrid, XAxis, ResponsiveContainer, YAxis, Tooltip } from 'recharts';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { supabase } from '@/lib/supabase';

type TurnoverData = {
  month: string;
  rate: number;
};

export default function TurnoverChart() {
  const [chartData, setChartData] = useState<TurnoverData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        // TODO: Criar tabela turnover_rates no banco de dados
        // const { data: turnoverData, error } = await supabase
        //   .from('turnover_rates')
        //   .select('month, rate')
        //   .order('month', { ascending: true });

        // if (error) {
        //   console.error('Erro ao carregar dados de turnover:', error);
        //   return;
        // }

        // setChartData(turnoverData);
        
        // Dados mockados temporariamente
        setChartData([
          { month: 'Jan', rate: 5.2 },
          { month: 'Fev', rate: 4.8 },
          { month: 'Mar', rate: 6.1 },
          { month: 'Abr', rate: 5.5 },
          { month: 'Mai', rate: 4.9 },
          { month: 'Jun', rate: 5.8 }
        ]);
      } catch (error) {
        console.error('Erro ao processar dados de turnover:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  const chartConfig = {
    rate: {
      label: 'Taxa de Turnover (%)',
      color: 'hsl(var(--chart-2))',
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
