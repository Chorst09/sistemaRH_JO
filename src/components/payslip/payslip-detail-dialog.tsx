'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Employee, Payslip } from '@/types';
import { getMonthName } from '@/lib/utils';
import { Download } from 'lucide-react';

type PayslipDetailDialogProps = {
  children: React.ReactNode;
  employee: Employee;
  payslip: Payslip;
};

export default function PayslipDetailDialog({ children, employee, payslip }: PayslipDetailDialogProps) {
  const [open, setOpen] = useState(false);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  }

  // Exemplo de proventos e descontos (em uma aplicação real, estes dados viriam do banco)
  const earnings = [
    { description: 'Salário Base', amount: payslip.gross_salary },
    // Adicione outros proventos conforme necessário
  ];

  const deductions = [
    { description: 'INSS', amount: payslip.total_deductions * 0.6 }, // 60% dos descontos
    { description: 'IRRF', amount: payslip.total_deductions * 0.4 }, // 40% dos descontos
    // Adicione outros descontos conforme necessário
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Holerite - {getMonthName(payslip.month)}/{payslip.year}</DialogTitle>
          <DialogDescription>
            Detalhes do seu recibo de pagamento.
          </DialogDescription>
        </DialogHeader>
        
        <div className="text-sm">
            <div className="grid grid-cols-2 gap-4 mb-4 p-4 bg-muted/50 rounded-lg">
                <div>
                    <p className="font-semibold">{employee.name}</p>
                    <p className="text-muted-foreground">{employee.role}</p>
                    <p className="text-muted-foreground">Departamento: {employee.department}</p>
                </div>
                <div className="text-right">
                    <p className="font-semibold">HR Vision Inc.</p>
                    <p className="text-muted-foreground">CNPJ: 12.345.678/0001-99</p>
                    <p className="text-muted-foreground">Data de Pagamento: {new Date(payslip.payment_date).toLocaleDateString('pt-BR', {timeZone: 'UTC'})}</p>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-8">
                <div>
                    <h4 className="font-semibold mb-2 text-primary">Proventos</h4>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Descrição</TableHead>
                                <TableHead className="text-right">Valor</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {earnings.map((item, index) => (
                                <TableRow key={`earning-${index}`}>
                                    <TableCell>{item.description}</TableCell>
                                    <TableCell className="text-right">{formatCurrency(item.amount)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
                 <div>
                    <h4 className="font-semibold mb-2 text-destructive">Descontos</h4>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Descrição</TableHead>
                                <TableHead className="text-right">Valor</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {deductions.map((item, index) => (
                                <TableRow key={`deduction-${index}`}>
                                    <TableCell>{item.description}</TableCell>
                                    <TableCell className="text-right text-red-600">{formatCurrency(item.amount)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
            
            <Separator className="my-4" />

            <div className="grid grid-cols-3 gap-4 font-medium">
                <div className="p-2 rounded-md">
                    <p className="text-sm text-muted-foreground">Total de Proventos</p>
                    <p className="text-lg">{formatCurrency(payslip.gross_salary)}</p>
                </div>
                <div className="p-2 rounded-md">
                    <p className="text-sm text-muted-foreground">Total de Descontos</p>
                    <p className="text-lg text-red-600">{formatCurrency(payslip.total_deductions)}</p>
                </div>
                 <div className="p-2 rounded-md bg-green-100 dark:bg-green-900/50">
                    <p className="text-sm text-green-800 dark:text-green-300">Valor Líquido a Receber</p>
                    <p className="text-lg font-bold text-green-800 dark:text-green-300">{formatCurrency(payslip.net_salary)}</p>
                </div>
            </div>
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => setOpen(false)}>Fechar</Button>
          <Button asChild>
            <a href={payslip.url} target="_blank" rel="noopener noreferrer">
                <Download className="mr-2 h-4 w-4" />
                Baixar Holerite (PDF)
            </a>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
