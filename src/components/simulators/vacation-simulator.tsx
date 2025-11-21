'use client';

import { useState, useMemo, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { getEmployees } from '@/lib/data';

type VacationCalculation = {
    grossVacation: number;
    oneThird: number;
    abonoPecuniario: number;
    totalGross: number;
    inss: number;
    irrf: number;
    totalNet: number;
}

export default function VacationSimulator() {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  });
  const [sellOneThird, setSellOneThird] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [calculation, setCalculation] = useState<VacationCalculation | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadEmployees() {
      try {
        const data = await getEmployees();
        setEmployees(data);
      } catch (error) {
        console.error('Erro ao carregar funcionários:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadEmployees();
  }, []);

  const selectedEmployee = useMemo(() => {
    return employees.find(e => e.id === selectedEmployeeId);
  }, [selectedEmployeeId, employees]);

  const vacationDays = useMemo(() => {
    if (dateRange.from && dateRange.to) {
      return differenceInDays(dateRange.to, dateRange.from) + 1;
    }
    return 0;
  }, [dateRange]);

  const handleSimulate = () => {
    if (!dateRange.from || !dateRange.to || !selectedEmployee) return;
    
    setIsSimulating(true);

    // Simulate API call and calculation
    setTimeout(() => {
        const salary = ((selectedEmployee as any).salary || 50000) / 12; // Assuming annual salary, get monthly
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
    <Card>
        <CardHeader>
            <CardTitle>Simulador de Férias</CardTitle>
            <CardDescription>
                Planeje e simule o cálculo de férias para um funcionário.
            </CardDescription>
        </CardHeader>
        <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                    <div>
                        <Label htmlFor="employee-vacation">Funcionário</Label>
                        <Select onValueChange={setSelectedEmployeeId} value={selectedEmployeeId || ''}>
                            <SelectTrigger id="employee-vacation">
                                <SelectValue placeholder={isLoading ? "Carregando..." : "Selecione um funcionário"} />
                            </SelectTrigger>
                            <SelectContent>
                                {employees.filter(e => e.status === 'active').map(e => (
                                    <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
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
                                onSelect={(range) => setDateRange(range ? { from: range.from, to: range.to } : { from: undefined, to: undefined })}
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
                    
                    <Button onClick={handleSimulate} disabled={isSimulating || vacationDays <= 0 || !selectedEmployee}>
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
                            <p>Preencha os campos para ver uma estimativa dos valores de férias.</p>
                        </div>
                    )}
                </div>
            </div>
        </CardContent>
    </Card>
  );
}
