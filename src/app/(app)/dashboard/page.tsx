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
    title: 'Total Employees',
    value: '10',
    icon: Users,
    change: '+2% from last month',
  },
  {
    title: 'On Leave',
    value: '1',
    icon: Briefcase,
    change: '+1 since last week',
  },
  {
    title: 'New Hires',
    value: '3',
    icon: UserCheck,
    change: 'this quarter',
  },
  {
    title: 'Terminations',
    value: '1',
    icon: UserX,
    change: 'this quarter',
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
    action: 'submitted an absence request.',
    time: '2 hours ago',
  },
  {
    person: 'Arthur Costa',
    action: 'approved a vacation request for Lucas Almeida.',
    time: '5 hours ago',
  },
  {
    person: 'HR Bot',
    action: 'flagged an expiring contract for Bernardo Pereira.',
    time: '1 day ago',
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
            <CardTitle>Headcount Growth</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <HeadcountChart />
          </CardContent>
        </Card>
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
            <CardDescription>
              A log of recent HR-related actions in the system.
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
          <CardTitle>Upcoming Holidays</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Holiday</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {upcomingHolidays.map((holiday) => (
                <TableRow key={holiday.name}>
                  <TableCell className="font-medium">
                    {new Date(holiday.date).toLocaleDateString('en-US', {
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
