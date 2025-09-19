'use client';

import { useEffect, useState } from 'react';
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
import { Button } from '@/components/ui/button';
import { Download, ReceiptText, Eye } from 'lucide-react';
import { getMonthName } from '@/lib/utils';
import PayslipDetailDialog from '@/components/payslip/payslip-detail-dialog';
import { getEmployee, getPayslips } from '@/lib/data';
import { Employee, Payslip } from '@/types';
import { supabase } from '@/lib/supabase';

export default function PayslipPage() {
  const [currentUser, setCurrentUser] = useState<Employee | null>(null);
  const [payslips, setPayslips] = useState<Payslip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        // Buscar o primeiro funcionário disponível
        const { data: employees, error: employeesError } = await supabase
          .from('employees')
          .select('*')
          .limit(1);

        if (employeesError) throw employeesError;

        if (employees && employees.length > 0) {
          const employee = employees[0] as any;
          // Mapear os dados para o formato esperado
           const mappedEmployee: Employee = {
             id: employee.id,
             name: employee.name,
             email: employee.email,
             role: employee.role,
             department: employee.department,
             admission_date: employee.hiredate || employee.created_at,
             birth_date: employee.birth_date || '1990-01-01',
             phone: employee.phone || '',
             address: employee.address || '',
             city: employee.city || 'São Paulo',
             state: employee.state || 'SP',
             zip_code: employee.zip_code || '00000-000',
             status: employee.status === 'Ativo' ? 'active' : 'inactive' as 'active' | 'inactive',
             created_at: employee.created_at,
             updated_at: employee.updated_at
           };
          setCurrentUser(mappedEmployee);

          // Buscar os holerites do usuário
          const userPayslips = await getPayslips(employee.id);
          setPayslips(userPayslips);
        } else {
          setError('Nenhum funcionário encontrado. Execute a migração do banco de dados.');
        }
      } catch (err) {
        console.error('Erro ao carregar dados:', err);
        setError(err instanceof Error ? err.message : 'Erro ao carregar dados');
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="h-24 flex items-center justify-center">
          <p className="text-muted-foreground">Carregando...</p>
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

  if (!currentUser) {
    return (
      <Card>
        <CardContent className="h-24 flex items-center justify-center">
          <p className="text-muted-foreground">Usuário não encontrado.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2"><ReceiptText /> Folha de Pagamento</CardTitle>
            <CardDescription>Acesse e baixe seus holerites mensais.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mês de Referência</TableHead>
              <TableHead>Data de Pagamento</TableHead>
              <TableHead>Salário Bruto</TableHead>
              <TableHead>Descontos</TableHead>
              <TableHead>Salário Líquido</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payslips.length > 0 ? payslips.map(payslip => (
              <TableRow key={payslip.id}>
                <TableCell className="font-medium">{getMonthName(payslip.month)}/{payslip.year}</TableCell>
                <TableCell>{new Date(payslip.payment_date).toLocaleDateString('pt-BR', {timeZone: 'UTC'})}</TableCell>
                <TableCell>{formatCurrency(payslip.gross_salary)}</TableCell>
                <TableCell className="text-red-600">{formatCurrency(payslip.total_deductions)}</TableCell>
                <TableCell className="font-semibold">{formatCurrency(payslip.net_salary)}</TableCell>
                <TableCell className="text-right space-x-2">
                  <PayslipDetailDialog payslip={payslip} employee={currentUser}>
                    <Button variant="outline" size="sm">
                        <Eye className="mr-2 h-4 w-4" />
                        Visualizar
                    </Button>
                  </PayslipDetailDialog>
                  <Button variant="outline" size="sm" asChild>
                    <a href={payslip.url} target="_blank" rel="noopener noreferrer">
                      <Download className="mr-2 h-4 w-4" />
                      Baixar
                    </a>
                  </Button>
                </TableCell>
              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">Nenhum holerite encontrado.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
