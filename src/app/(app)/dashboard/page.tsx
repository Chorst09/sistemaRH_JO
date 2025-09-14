import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Activity,
  Users,
  Briefcase,
  UserCheck,
  UserX,
  ArrowUpRight,
} from 'lucide-react';
import HeadcountChart from '@/components/reports/headcount-chart';

const kpis = [
  {
    title: 'Total de Funcionários',
    value: '10',
    icon: Users,
    change: '+2% do último mês',
  },
  {
    title: 'Em Licença',
    value: '1',
    icon: Briefcase,
    change: '+1 desde a última semana',
  },
  {
    title: 'Novas Contratações',
    value: '3',
    icon: UserCheck,
    change: 'neste trimestre',
  },
  {
    title: 'Desligamentos',
    value: '1',
    icon: UserX,
    change: 'neste trimestre',
  },
];

const upcomingHolidays = [
  { date: '2024-11-15', name: "Proclamação da República" },
  { date: '2024-11-20', name: "Dia da Consciência Negra" },
  { date: '2024-12-25', name: 'Natal' },
];

const recentActivities = [
  {
    person: 'Julia Martins',
    action: 'enviou uma solicitação de ausência.',
    time: '2 horas atrás',
  },
  {
    person: 'Arthur Costa',
    action: 'aprovou um pedido de férias para Lucas Almeida.',
    time: '5 horas atrás',
  },
  {
    person: 'HR Bot',
    action: 'sinalizou um contrato expirando para Bernardo Pereira.',
    time: '1 dia atrás',
  },
];

export default function DashboardPage() {
  return (
    <div className="grid gap-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <Card key={kpi.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
              <kpi.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpi.value}</div>
              <p className="text-xs text-muted-foreground">{kpi.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Crescimento do Efetivo</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <HeadcountChart />
          </CardContent>
        </Card>
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Atividades Recentes</CardTitle>
            <CardDescription>
              Um registro de ações recentes relacionadas ao RH no sistema.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentActivities.map((activity, index) => (
              <div key={index} className="flex items-start gap-4">
                <Activity className="mt-1 h-5 w-5" />
                <div className="space-y-1">
                  <p className="text-sm">
                    <span className="font-medium">{activity.person}</span>{' '}
                    {activity.action}
                  </p>
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Próximos Feriados</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Feriado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {upcomingHolidays.map((holiday) => (
                <TableRow key={holiday.name}>
                  <TableCell className="font-medium">
                    {new Date(holiday.date).toLocaleDateString('pt-BR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      timeZone: 'UTC',
                    })}
                  </TableCell>
                  <TableCell>{holiday.name}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
