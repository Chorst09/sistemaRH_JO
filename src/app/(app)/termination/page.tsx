'use client';

import { useState, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Employee } from '@/types';
import { employees } from '@/lib/data';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarIcon, Loader2, Calculator } from 'lucide-react';

type TerminationType = 'sem_justa_causa' | 'pedido_demissao' | 'termino_contrato';

type TerminationCalculation = {
    saldoSalario: number;
    avisoPrevio: number;
    decimoTerceiro: number;
    feriasVencidas: number;
    feriasProporcionais: number;
    totalBruto: number;
    fgts: number;
    multaFgts: number;
    totalRescisao: number;
};

export default function TerminationPage() {
    const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
    const [terminationType, setTerminationType] = useState<TerminationType | null>(null);
    const [noticeDate, setNoticeDate] = useState<Date | undefined>();
    const [lastDay, setLastDay] = useState<Date | undefined>();
    const [isSimulating, setIsSimulating] = useState(false);
    const [calculation, setCalculation] = useState<TerminationCalculation | null>(null);

    const selectedEmployee = useMemo(() => {
        return employees.find(e => e.id === selectedEmployeeId);
    }, [selectedEmployeeId]);

    const handleSimulate = () => {
        if (!selectedEmployee || !terminationType || !lastDay) return;
        
        setIsSimulating(true);
        setCalculation(null);

        // Simulate API call and complex calculation
        setTimeout(() => {
            const monthlySalary = selectedEmployee.salary / 12;
            const daysWorkedInMonth = lastDay.getDate();
            const saldoSalario = (monthlySalary / 30) * daysWorkedInMonth;

            let avisoPrevio = 0;
            let multaFgts = 0;

            if (terminationType === 'sem_justa_causa') {
                avisoPrevio = monthlySalary; // Simplified
                multaFgts = (monthlySalary * 0.08 * 12) * 0.4; // Simplified: 1 year of FGTS deposit
            }

            const monthsWorkedInYear = lastDay.getMonth() + 1;
            const decimoTerceiro = (monthlySalary / 12) * monthsWorkedInYear;
            
            // Highly simplified vacation calculation
            const feriasVencidas = 0; // Assuming no expired vacation
            const feriasProporcionais = ((monthlySalary / 12) * monthsWorkedInYear) * 1.333;

            const totalBruto = saldoSalario + avisoPrevio + decimoTerceiro + feriasVencidas + feriasProporcionais;
            const fgts = monthlySalary * 0.08 * 12; // Simplified
            
            const totalRescisao = totalBruto + fgts + multaFgts;

            setCalculation({
                saldoSalario,
                avisoPrevio,
                decimoTerceiro,
                feriasVencidas,
                feriasProporcionais,
                totalBruto,
                fgts,
                multaFgts,
                totalRescisao,
            });

            setIsSimulating(false);
        }, 1500);
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Simulador de Rescisão</CardTitle>
                <CardDescription>
                    Projete os valores de uma rescisão antes de sua efetivação. Preencha os campos para iniciar.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="employee">Funcionário</Label>
                            <Select onValueChange={setSelectedEmployeeId}>
                                <SelectTrigger id="employee">
                                    <SelectValue placeholder="Selecione um funcionário" />
                                </SelectTrigger>
                                <SelectContent>
                                    {employees.filter(e => e.status === 'Ativo').map(e => (
                                        <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="termination-type">Tipo de Rescisão</Label>
                            <Select onValueChange={(value) => setTerminationType(value as TerminationType)}>
                                <SelectTrigger id="termination-type">
                                    <SelectValue placeholder="Selecione o tipo" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="sem_justa_causa">Demissão sem justa causa</SelectItem>
                                    <SelectItem value="pedido_demissao">Pedido de demissão</SelectItem>
                                    <SelectItem value="termino_contrato">Término de contrato de experiência</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                         <div>
                            <Label htmlFor="notice-date">Data do Aviso Prévio</Label>
                             <Popover>
                                <PopoverTrigger asChild>
                                <Button
                                    id="notice-date"
                                    variant={'outline'}
                                    className={cn('w-full justify-start text-left font-normal', !noticeDate && 'text-muted-foreground')}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {noticeDate ? format(noticeDate, 'dd/MM/yyyy') : <span>Selecione a data</span>}
                                </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={noticeDate} onSelect={setNoticeDate} initialFocus locale={ptBR}/></PopoverContent>
                            </Popover>
                        </div>
                        <div>
                            <Label htmlFor="last-day">Data do Desligamento</Label>
                             <Popover>
                                <PopoverTrigger asChild>
                                <Button
                                    id="last-day"
                                    variant={'outline'}
                                    className={cn('w-full justify-start text-left font-normal', !lastDay && 'text-muted-foreground')}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {lastDay ? format(lastDay, 'dd/MM/yyyy') : <span>Selecione a data</span>}
                                </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={lastDay} onSelect={setLastDay} initialFocus locale={ptBR}/></PopoverContent>
                            </Popover>
                        </div>
                        <Button onClick={handleSimulate} disabled={isSimulating || !selectedEmployee || !terminationType || !lastDay}>
                            {isSimulating ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Simulando...</> : <><Calculator className="mr-2 h-4 w-4" /> Simular Cálculo</>}
                        </Button>
                    </div>
                    <div className="space-y-4">
                        {calculation ? (
                            <Alert>
                                <Calculator className="h-4 w-4"/>
                                <AlertTitle>Simulação de Valores Rescisórios</AlertTitle>
                                <AlertDescription>
                                   <div className="space-y-2 mt-2 text-sm">
                                        <h4 className="font-semibold">Verbas Rescisórias:</h4>
                                        <div className="flex justify-between"><span>Saldo de Salário:</span> <span className="font-medium">{formatCurrency(calculation.saldoSalario)}</span></div>
                                        <div className="flex justify-between"><span>Aviso Prévio Indenizado:</span> <span className="font-medium">{formatCurrency(calculation.avisoPrevio)}</span></div>
                                        <div className="flex justify-between"><span>13º Salário Proporcional:</span> <span className="font-medium">{formatCurrency(calculation.decimoTerceiro)}</span></div>
                                        <div className="flex justify-between"><span>Férias Vencidas + 1/3:</span> <span className="font-medium">{formatCurrency(calculation.feriasVencidas)}</span></div>
                                        <div className="flex justify-between"><span>Férias Proporcionais + 1/3:</span> <span className="font-medium">{formatCurrency(calculation.feriasProporcionais)}</span></div>
                                        <hr className="my-2"/>
                                        <div className="flex justify-between font-bold"><span>Total Bruto:</span> <span>{formatCurrency(calculation.totalBruto)}</span></div>
                                        <hr className="my-2"/>
                                        <h4 className="font-semibold mt-2">Valores do FGTS:</h4>
                                        <div className="flex justify-between"><span>Depósito do Mês:</span> <span className="font-medium">{formatCurrency(calculation.fgts)}</span></div>
                                        <div className="flex justify-between"><span>Multa de 40% (Saldo FGTS):</span> <span className="font-medium">{formatCurrency(calculation.multaFgts)}</span></div>
                                        <hr className="my-2"/>
                                        <div className="flex justify-between font-bold text-lg"><span>Valor Total da Rescisão:</span> <span>{formatCurrency(calculation.totalRescisao)}</span></div>
                                   </div>
                                   <p className="text-xs text-muted-foreground mt-4">Estes valores são uma simulação simplificada e podem variar no cálculo final. Não incluem descontos como INSS e IRRF.</p>
                                </AlertDescription>
                            </Alert>
                        ) : (
                            <div className="flex items-center justify-center h-full text-center text-muted-foreground bg-gray-50 dark:bg-gray-900 rounded-md p-4">
                                <p>Preencha os campos ao lado para ver uma estimativa dos valores da rescisão.</p>
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
