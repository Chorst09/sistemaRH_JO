'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getEmployees, getPayslips } from '@/lib/data';
import { getMonthName } from '@/lib/utils';
import { Employee, Payslip } from '@/types';
import PayslipDetailDialog from '@/components/payslip/payslip-detail-dialog';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';

type MonthlyTotal = {
  month: number;
  year: number;
  totalGross: number;
  totalDeductions: number;
  totalNet: number;
};

export default function AdminPayslipPage() {
  const { user, loading: authLoading } = useAuth();
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | undefined>();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [payslips, setPayslips] = useState<Payslip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadEmployees() {
      // Only load if user is authenticated
      if (authLoading || !user) return;
      
      try {
        const employeesList = await getEmployees();
        setEmployees(employeesList);
      } catch (err) {
        console.error('Erro ao carregar funcionários:', err);
        setError(err instanceof Error ? err.message : 'Erro ao carregar funcionários');
      } finally {
        setIsLoading(false);
      }
    }

    loadEmployees();
  }, [user, authLoading]);

  useEffect(() => {
    async function loadPayslips() {
      if (!selectedEmployeeId) return;

      try {
        const employeePayslips = await getPayslips(selectedEmployeeId);
        setPayslips(prevPayslips => {
          // Adiciona novos holerites mantendo os existentes de outros funcionários
          const otherEmployeesPayslips = prevPayslips.filter(p => p.employee_id !== selectedEmployeeId);
          return [...otherEmployeesPayslips, ...employeePayslips];
        });
      } catch (err) {
        console.error('Erro ao carregar holerites:', err);
        setError(err instanceof Error ? err.message : 'Erro ao carregar holerites');
      }
    }

    loadPayslips();
  }, [selectedEmployeeId]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const monthlyTotals: MonthlyTotal[] = payslips.reduce((acc: MonthlyTotal[], payslip) => {
    const existingMonth = acc.find(m => m.month === payslip.month && m.year === payslip.year);
    if (existingMonth) {
      existingMonth.totalGross += payslip.gross_salary;
      existingMonth.totalDeductions += payslip.total_deductions;
      existingMonth.totalNet += payslip.net_salary;
    } else {
      acc.push({
        month: payslip.month,
        year: payslip.year,
        totalGross: payslip.gross_salary,
        totalDeductions: payslip.total_deductions,
        totalNet: payslip.net_salary,
      });
    }
    return acc;
  }, []).sort((a, b) => new Date(b.year, b.month - 1).getTime() - new Date(a.year, a.month - 1).getTime());

  const selectedEmployee = employees.find(e => e.id === selectedEmployeeId);
  const selectedEmployeePayslips = selectedEmployeeId 
    ? payslips
        .filter(p => p.employee_id === selectedEmployeeId)
        .sort((a,b) => new Date(b.payment_date).getTime() - new Date(a.payment_date).getTime()) 
    : [];

  // Show loading while checking auth or loading data
  if (authLoading || (isLoading && user)) {
    return (
      <Card>
        <CardContent className="h-24 flex items-center justify-center">
          <p className="text-muted-foreground">Carregando...</p>
        </CardContent>
      </Card>
    );
  }

  // Show login message if not authenticated
  if (!user) {
    return (
      <Card>
        <CardContent className="h-24 flex items-center justify-center">
          <p className="text-muted-foreground">Você precisa estar logado para acessar esta página.</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="h-24 flex items-center justify-center">
          <p className="text-red-500">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="overview">Visão Geral</TabsTrigger>
        <TabsTrigger value="by-employee">Por Funcionário</TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="mt-4">
        <Card>
          <CardHeader>
            <CardTitle>Visão Geral da Folha de Pagamento</CardTitle>
            <CardDescription>Resumo dos totais da folha de pagamento da empresa por mês.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mês de Referência</TableHead>
                  <TableHead>Total Bruto</TableHead>
                  <TableHead>Total de Descontos</TableHead>
                  <TableHead>Total Líquido</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {monthlyTotals.length > 0 ? monthlyTotals.map(total => (
                  <TableRow key={`${total.year}-${total.month}`}>
                    <TableCell className="font-medium">{getMonthName(total.month)}/{total.year}</TableCell>
                    <TableCell>{formatCurrency(total.totalGross)}</TableCell>
                    <TableCell className="text-red-600">{formatCurrency(total.totalDeductions)}</TableCell>
                    <TableCell className="font-semibold">{formatCurrency(total.totalNet)}</TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">Nenhum holerite encontrado.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="by-employee" className="mt-4">
        <Card>
          <CardHeader>
            <CardTitle>Folha por Funcionário</CardTitle>
            <CardDescription>Selecione um funcionário para ver seus holerites.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="max-w-sm">
                <Select onValueChange={setSelectedEmployeeId}>
                    <SelectTrigger>
                        <SelectValue placeholder="Selecione um funcionário" />
                    </SelectTrigger>
                    <SelectContent>
                        {employees.map(e => (
                            <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            {selectedEmployee && (
                 <Table>
                    <TableHeader>
                        <TableRow>
                        <TableHead>Mês</TableHead>
                        <TableHead>Salário Líquido</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {selectedEmployeePayslips.length > 0 ? selectedEmployeePayslips.map(payslip => (
                        <TableRow key={payslip.id}>
                            <TableCell className="font-medium">{getMonthName(payslip.month)}/{payslip.year}</TableCell>
                            <TableCell className="font-semibold">{formatCurrency(payslip.net_salary)}</TableCell>
                            <TableCell className="text-right">
                                <PayslipDetailDialog payslip={payslip} employee={selectedEmployee}>
                                    <Button variant="outline" size="sm">
                                        <Eye className="mr-2 h-4 w-4" />
                                        Visualizar
                                    </Button>
                                </PayslipDetailDialog>
                            </TableCell>
                        </TableRow>
                        )) : (
                        <TableRow>
                            <TableCell colSpan={3} className="h-24 text-center">Nenhum holerite encontrado para este funcionário.</TableCell>
                        </TableRow>
                        )}
                    </TableBody>
                </Table>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
