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
            <CardTitle className="text-sm font-medium">Avg. Salary</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$96,150</div>
            <p className="text-xs text-muted-foreground">+3.2% from last year</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Turnover Rate</CardTitle>
            <UserMinus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">10%</div>
            <p className="text-xs text-muted-foreground">Annualized</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hiring Rate</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">25%</div>
            <p className="text-xs text-muted-foreground">Vs. previous quarter</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Absence Rate</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3.1%</div>
            <p className="text-xs text-muted-foreground">YTD Average</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
              <CardHeader>
                  <CardTitle>Turnover Rate by Month</CardTitle>
                  <CardDescription>Shows the monthly employee turnover percentage.</CardDescription>
              </CardHeader>
              <CardContent>
                  <TurnoverChart />
              </CardContent>
          </Card>
          <Card>
              <CardHeader>
                  <CardTitle>Absence by Type</CardTitle>
                  <CardDescription>Breakdown of employee absences this year.</CardDescription>
              </CardHeader>
              <CardContent>
                  <AbsenceChart />
              </CardContent>
          </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Headcount by Department</CardTitle>
          <CardDescription>The number of active employees in each department.</CardDescription>
        </CardHeader>
        <CardContent>
          <HeadcountChart />
        </CardContent>
      </Card>
    </div>
  );
}
