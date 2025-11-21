import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import HeadcountChart from '@/components/reports/headcount-chart';
import TurnoverChart from '@/components/reports/turnover-chart';
import AbsenceChart from '@/components/reports/absence-chart';
import { DollarSign, UserPlus, UserMinus, BarChart3 } from 'lucide-react';

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Salário Médio</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$96.150</div>
            <p className="text-xs text-muted-foreground">+3.2% do ano passado</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Rotatividade</CardTitle>
            <UserMinus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">10%</div>
            <p className="text-xs text-muted-foreground">Anualizado</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Contratação</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">25%</div>
            <p className="text-xs text-muted-foreground">Vs. trimestre anterior</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Ausência</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3.1%</div>
            <p className="text-xs text-muted-foreground">Média YTD</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
              <CardHeader>
                  <CardTitle>Taxa de Rotatividade por Mês</CardTitle>
                  <CardDescription>Mostra a porcentagem mensal de rotatividade de funcionários.</CardDescription>
              </CardHeader>
              <CardContent>
                  <TurnoverChart />
              </CardContent>
          </Card>
          <Card>
              <CardHeader>
                  <CardTitle>Ausência por Tipo</CardTitle>
                  <CardDescription>Detalhamento das ausências de funcionários este ano.</CardDescription>
              </CardHeader>
              <CardContent>
                  <AbsenceChart />
              </CardContent>
          </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Efetivo por Departamento</CardTitle>
          <CardDescription>O número de funcionários ativos em cada departamento.</CardDescription>
        </CardHeader>
        <CardContent>
          <HeadcountChart />
        </CardContent>
      </Card>
    </div>
  );
}
