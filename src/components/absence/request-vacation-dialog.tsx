'use client';

import { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

type VacationCalculation = {
  grossVacation: number;
  oneThird: number;
  abonoPecuniario: number;
  totalGross: number;
  inss: number;
  irrf: number;
  totalNet: number;
}

type RequestVacationDialogProps = {
  employee: Employee;
}

export default function RequestVacationDialog({ employee }: RequestVacationDialogProps) {
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  });
  const [sellOneThird, setSellOneThird] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [calculation, setCalculation] = useState<VacationCalculation | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const vacationDays = useMemo(() => {
    if (dateRange.from && dateRange.to) {
      return differenceInDays(dateRange.to, dateRange.from) + 1;
    }
    return 0;
  }, [dateRange]);

  const calculateVacation = (salary: number, days: number, sellOneThird: boolean) => {
    const monthlyRate = salary / 12;
    const dailyRate = monthlyRate / 30;
    const grossVacation = dailyRate * days;
    const oneThird = grossVacation / 3;

    let abonoPecuniario = 0;
    if (sellOneThird) {
      const daysToSell = Math.floor(days / 3);
      abonoPecuniario = dailyRate * daysToSell;
    }

    const totalGross = grossVacation + oneThird + abonoPecuniario;

    // Cálculo simplificado de impostos
    const inss = Math.min(totalGross * 0.11, 800);
    const irrfBase = totalGross - inss;
    const irrf = irrfBase > 4664 ? irrfBase * 0.275 : 0;

    const totalNet = totalGross - inss - irrf;

    return {
      grossVacation,
      oneThird,
      abonoPecuniario,
      totalGross,
      inss,
      irrf,
      totalNet
    };
  };

  const handleSimulate = () => {
    if (!dateRange.from || !dateRange.to) return;

    setIsSimulating(true);

    try {
      const calculation = calculateVacation((employee as any).salary || 50000, vacationDays, sellOneThird);
      setCalculation(calculation);
    } catch (error) {
      console.error('Erro ao calcular férias:', error);
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro ao calcular os valores. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsSimulating(false);
    }
  };

  const handleSubmit = async () => {
    if (!dateRange.from || !dateRange.to || !calculation) return;

    setIsSubmitting(true);

    try {
      const { error } = await (supabase as any)
        .from('vacation_requests')
        .insert({
          employee_id: employee.id,
          start_date: dateRange.from.toISOString(),
          end_date: dateRange.to.toISOString(),
          sell_one_third: sellOneThird,
          status: 'pending',
          gross_vacation: calculation.grossVacation,
          one_third: calculation.oneThird,
          abono_pecuniario: calculation.abonoPecuniario,
          total_gross: calculation.totalGross,
          inss: calculation.inss,
          irrf: calculation.irrf,
          total_net: calculation.totalNet,
          days: vacationDays,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: 'Solicitação enviada',
        description: 'Sua solicitação de férias foi enviada para aprovação.',
      });

      setIsOpen(false);
      setDateRange({ from: undefined, to: undefined });
      setSellOneThird(false);
      setCalculation(null);
    } catch (error) {
      console.error('Erro ao enviar solicitação:', error);
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro ao enviar sua solicitação. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Solicitar Férias</Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Solicitar Férias</DialogTitle>
          <DialogDescription>
            Simule e solicite suas férias. Você pode escolher o período e optar por vender 1/3 das férias.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
                <Calculator className="h-4 w-4" />
                <AlertTitle>Simulação de Valores</AlertTitle>
                <AlertDescription>
                  <div className="space-y-2 mt-2 text-sm">
                    <div className="flex justify-between"><span>Salário de Férias:</span> <span className="font-medium">{formatCurrency(calculation.grossVacation)}</span></div>
                    <div className="flex justify-between"><span>Adicional de 1/3:</span> <span className="font-medium">{formatCurrency(calculation.oneThird)}</span></div>
                    {calculation.abonoPecuniario > 0 && <div className="flex justify-between"><span>Abono Pecuniário:</span> <span className="font-medium">{formatCurrency(calculation.abonoPecuniario)}</span></div>}
                    <hr className="my-2" />
                    <div className="flex justify-between font-bold"><span>Total Bruto:</span> <span>{formatCurrency(calculation.totalGross)}</span></div>
                    <hr className="my-2" />
                    <div className="flex justify-between text-red-600"><span>- INSS (aprox.):</span> <span>{formatCurrency(calculation.inss)}</span></div>
                    <div className="flex justify-between text-red-600"><span>- IRRF (aprox.):</span> <span>{formatCurrency(calculation.irrf)}</span></div>
                    <hr className="my-2" />
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

            {calculation && (
              <Button onClick={handleSubmit} disabled={isSubmitting} className="w-full">
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  'Enviar Solicitação'
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
