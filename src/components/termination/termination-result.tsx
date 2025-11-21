'use client';

import { Employee } from '@/types';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Calculator, Printer } from 'lucide-react';
import type { TerminationCalculation } from '@/components/simulators/termination-simulator';

type TerminationResultProps = {
    calculation: TerminationCalculation;
    employee: Employee;
    lastDay: Date;
};

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

export default function TerminationResult({ calculation, employee, lastDay }: TerminationResultProps) {

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="print:p-0">
            <div className="flex justify-between items-center mb-4 print:hidden">
                <h3 className="text-lg font-semibold">Resultado da Simulação</h3>
                <Button variant="outline" size="sm" onClick={handlePrint}>
                    <Printer className="mr-2 h-4 w-4" />
                    Imprimir / Salvar PDF
                </Button>
            </div>
            <Alert className="print:shadow-none print:border-0">
                <Calculator className="h-4 w-4 print:hidden"/>
                <AlertTitle className="print:text-2xl print:mb-4">Simulação de Valores Rescisórios</AlertTitle>
                <AlertDescription>
                    <div className="space-y-4 my-4 hidden print:grid print:grid-cols-2 print:gap-x-8 print:gap-y-4 print:mb-6">
                        <div><span className="font-semibold">Funcionário(a):</span> {employee.name}</div>
                        <div><span className="font-semibold">Cargo:</span> {employee.role}</div>
                        <div><span className="font-semibold">Data de Admissão:</span> {new Date(employee.admission_date).toLocaleDateString('pt-BR')}</div>
                        <div><span className="font-semibold">Data de Desligamento:</span> {lastDay.toLocaleDateString('pt-BR')}</div>
                    </div>
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
        </div>
    );
}
