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
import { Employee } from '@/types';
import { getEmployees } from '@/lib/data';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarIcon, Loader2, Calculator } from 'lucide-react';
import TerminationResult from '@/components/termination/termination-result';

type TerminationType = 'sem_justa_causa' | 'pedido_demissao' | 'termino_contrato';

export type TerminationCalculation = {
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

export default function TerminationSimulator() {
    const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
    const [terminationType, setTerminationType] = useState<TerminationType | null>(null);
    const [noticeDate, setNoticeDate] = useState<Date | undefined>();
    const [lastDay, setLastDay] = useState<Date | undefined>();
    const [isSimulating, setIsSimulating] = useState(false);
    const [calculation, setCalculation] = useState<TerminationCalculation | null>(null);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function loadEmployees() {
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
    }, []);

    const selectedEmployee = useMemo(() => {
        return employees.find(e => e.id === selectedEmployeeId);
    }, [selectedEmployeeId, employees]);

    const handleSimulate = () => {
        if (!selectedEmployee || !terminationType || !lastDay) return;
        
        setIsSimulating(true);
        setCalculation(null);

        // Simulate API call and complex calculation
        setTimeout(() => {
            const monthlySalary = ((selectedEmployee as any).salary || 50000) / 12;
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
                            <Select onValueChange={setSelectedEmployeeId} value={selectedEmployeeId || ''}>
                                <SelectTrigger id="employee">
                                    <SelectValue placeholder="Selecione um funcionário" />
                                </SelectTrigger>
                                <SelectContent>
                                    {employees.filter(e => e.status === 'active').map(e => (
                                        <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="termination-type">Tipo de Rescisão</Label>
                            <Select onValueChange={(value) => setTerminationType(value as TerminationType)} value={terminationType || ''}>
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
                        {!calculation && !isSimulating && (
                            <div className="flex items-center justify-center h-full text-center text-muted-foreground bg-gray-50 dark:bg-gray-900 rounded-md p-4">
                                <p>Preencha os campos ao lado para ver uma estimativa dos valores da rescisão.</p>
                            </div>
                        )}
                            {isSimulating && (
                            <div className="flex items-center justify-center h-full text-center text-muted-foreground bg-gray-50 dark:bg-gray-900 rounded-md p-4">
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                <p>Calculando...</p>
                            </div>
                        )}
                        {calculation && selectedEmployee && lastDay && (
                            <TerminationResult calculation={calculation} employee={selectedEmployee} lastDay={lastDay} />
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
