'use client';

import { useState, useMemo } from 'react';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Loader2, Calculator } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Employee } from '@/types';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';

type RequestVacationDialogProps = {
  children: React.ReactNode;
  employee: Employee;
};

type VacationCalculation = {
    grossVacation: number;
    oneThird: number;
    abonoPecuniario: number;
    totalGross: number;
    inss: number;
    irrf: number;
    totalNet: number;
}

export default function RequestVacationDialog({ children, employee }: RequestVacationDialogProps) {
  const [open, setOpen] = useState(false);
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  });
  const [sellOneThird, setSellOneThird] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [calculation, setCalculation] = useState<VacationCalculation | null>(null);

  const vacationDays = useMemo(() => {
    if (dateRange.from && dateRange.to) {
      return differenceInDays(dateRange.to, dateRange.from) + 1;
    }
    return 0;
  }, [dateRange]);

  const handleSimulate = () => {
    if (!dateRange.from || !dateRange.to) return;
    
    setIsSimulating(true);

    // Simulate API call and calculation
    setTimeout(() => {
        const salary = employee.salary / 12; // Assuming annual salary, get monthly
        const dailyRate = salary / 30;
        const grossVacation = dailyRate * vacationDays;
        const oneThird = grossVacation / 3;

        let abonoPecuniario = 0;
        if (sellOneThird) {
            const daysToSell = Math.floor(vacationDays / 3);
            abonoPecuniario = dailyRate * daysToSell;
        }

        const totalGross = grossVacation + oneThird + abonoPecuniario;

        // Simplified tax calculation for demonstration
        const inss = totalGross * 0.11 > 800 ? 800 : totalGross * 0.11; // Dummy INSS
        const irrfBase = totalGross - inss;
        const irrf = irrfBase > 4664 ? irrfBase * 0.275 : 0; // Dummy IRRF

        const totalNet = totalGross - inss - irrf;

        setCalculation({
            grossVacation,
            oneThird,
            abonoPecuniario,
            totalGross,
            inss,
            irrf,
            totalNet
        });
        setIsSimulating(false);
    }, 1000);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Solicitar Férias</DialogTitle>
          <DialogDescription>
            Planeje e simule o cálculo de suas próximas férias.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
            <div className="space-y-4">
                 <div>
                    <Label htmlFor="dates">Período de Férias</Label>
                    <Popover>
                        <PopoverTrigger asChild>
                        <Button
                            id="dates"
                            variant={'outline'}
                            className={cn(
                            'w-full justify-start text-left font-normal',
                            !dateRange.from && 'text-muted-foreground'
                            )}
                        >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {dateRange.from ? (
                            dateRange.to ? (
                                <>
                                {format(dateRange.from, 'dd/MM/yyyy')} - {format(dateRange.to, 'dd/MM/yyyy')}
                                </>
                            ) : (
                                format(dateRange.from, 'dd/MM/yyyy')
                            )
                            ) : (
                            <span>Selecione o período</span>
                            )}
                        </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                            mode="range"
                            selected={{ from: dateRange.from!, to: dateRange.to }}
                            onSelect={(range) => setDateRange(range || { from: undefined, to: undefined })}
                            numberOfMonths={2}
                            locale={ptBR}
                        />
                        </PopoverContent>
                    </Popover>
                    {vacationDays > 0 && <p className="text-sm text-muted-foreground mt-2">Total de dias: {vacationDays}</p>}
                </div>
                
                <div className="flex items-center space-x-2">
                    <Switch id="sell-one-third" checked={sellOneThird} onCheckedChange={setSellOneThird} />
                    <Label htmlFor="sell-one-third">Vender 1/3 das férias (Abono Pecuniário)</Label>
                </div>
                
                <Button onClick={handleSimulate} disabled={isSimulating || vacationDays <= 0}>
                    {isSimulating ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Simulando...
                        </>
                        ) : (
                        <>
                            <Calculator className="mr-2 h-4 w-4" />
                            Simular Cálculo
                        </>
                    )}
                </Button>
            </div>
            
            <div className="space-y-4">
                {calculation ? (
                    <Alert>
                        <Calculator className="h-4 w-4"/>
                        <AlertTitle>Simulação de Valores</AlertTitle>
                        <AlertDescription>
                           <div className="space-y-2 mt-2 text-sm">
                                <div className="flex justify-between"><span>Salário de Férias:</span> <span className="font-medium">{formatCurrency(calculation.grossVacation)}</span></div>
                                <div className="flex justify-between"><span>Adicional de 1/3:</span> <span className="font-medium">{formatCurrency(calculation.oneThird)}</span></div>
                                {calculation.abonoPecuniario > 0 && <div className="flex justify-between"><span>Abono Pecuniário:</span> <span className="font-medium">{formatCurrency(calculation.abonoPecuniario)}</span></div>}
                                <hr className="my-2"/>
                                <div className="flex justify-between font-bold"><span>Total Bruto:</span> <span>{formatCurrency(calculation.totalGross)}</span></div>
                                <hr className="my-2"/>
                                <div className="flex justify-between text-red-600"><span>- INSS (aprox.):</span> <span>{formatCurrency(calculation.inss)}</span></div>
                                <div className="flex justify-between text-red-600"><span>- IRRF (aprox.):</span> <span>{formatCurrency(calculation.irrf)}</span></div>
                                <hr className="my-2"/>
                                <div className="flex justify-between font-bold text-lg"><span>Total Líquido (aprox.):</span> <span>{formatCurrency(calculation.totalNet)}</span></div>
                           </div>
                           <p className="text-xs text-muted-foreground mt-4">Estes valores são uma simulação e podem variar no cálculo final da folha de pagamento.</p>
                        </AlertDescription>
                    </Alert>
                ) : (
                     <div className="flex items-center justify-center h-full text-center text-muted-foreground bg-gray-50 dark:bg-gray-900 rounded-md p-4">
                        <p>Preencha o período e clique em "Simular Cálculo" para ver uma estimativa dos valores.</p>
                    </div>
                )}
            </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button disabled={!calculation}>Enviar Solicitação</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
