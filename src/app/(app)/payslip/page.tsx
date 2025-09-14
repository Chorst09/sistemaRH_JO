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
import { payslips, employees } from '@/lib/data';
import { Download, ReceiptText } from 'lucide-react';
import { getMonthName } from '@/lib/utils';

export default function PayslipPage() {
  const currentUser = employees.find(e => e.id === '1'); // Assuming current user is CEO

  if (!currentUser) {
    return null;
  }

  const userPayslips = payslips.filter(p => p.employeeId === currentUser.id)
    .sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime());

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
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
              <TableHead className="text-right">Ação</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {userPayslips.length > 0 ? userPayslips.map(payslip => (
              <TableRow key={payslip.id}>
                <TableCell className="font-medium">{getMonthName(payslip.month)}/{payslip.year}</TableCell>
                <TableCell>{new Date(payslip.paymentDate).toLocaleDateString('pt-BR', {timeZone: 'UTC'})}</TableCell>
                <TableCell>{formatCurrency(payslip.grossSalary)}</TableCell>
                <TableCell className="text-red-600">{formatCurrency(payslip.deductions)}</TableCell>
                <TableCell className="font-semibold">{formatCurrency(payslip.netSalary)}</TableCell>
                <TableCell className="text-right">
                  <Button variant="outline" size="sm" asChild>
                    <a href={payslip.url}>
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
