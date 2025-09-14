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
import { Settings } from 'lucide-react';

const inssTableData = [
    { range: 'até 1.518,00', rate: '7,5%' },
    { range: 'de 1.518,01 até 2.793,88', rate: '9%' },
    { range: 'de 2.793,89 até 4.190,83', rate: '12%' },
    { range: 'de 4.190,84 até 8.157,41', rate: '14%' },
];

const irrfTableData = [
    { base: 'até 2.428,80', rate: '-', deduction: '-' },
    { base: 'de 2.428,81 até 2.826,65', rate: '7,5%', deduction: '182,16' },
    { base: 'de 2.826,66 até 3.751,05', rate: '15%', deduction: '394,16' },
    { base: 'de 3.751,06 até 4.664,68', rate: '22,5%', deduction: '675,49' },
    { base: 'acima de 4.664,68', rate: '27,5%', deduction: '908,73' },
];

const domesticTaxesData = [
    { tribute: 'INSS (Contribuição Previdenciária)', employer: '8,0%', employee: '7,5% a 14% (retido)' },
    { tribute: 'FGTS', employer: '8,0%', employee: '-' },
    { tribute: 'Seguro contra Acidentes (GILRAT)', employer: '0,8%', employee: '-' },
    { tribute: 'FGTS (Reserva para multa rescisória)', employer: '3,2%', employee: '-' },
    { tribute: 'Imposto de Renda (IRRF)', employer: 'Recolhimento', employee: 'Conforme tabela (retido)' },
];

export default function SettingsPage() {
  return (
    <div className="space-y-6">
        <div className="flex items-center gap-2">
            <Settings className="h-6 w-6"/>
            <h1 className="text-2xl font-bold font-headline">Configurações</h1>
        </div>
      <div className="space-y-6">
        <Card>
            <CardHeader>
                <CardTitle>Tributos para Empregados Domésticos (DAE)</CardTitle>
                <CardDescription>
                Resumo dos encargos reunidos no Documento de Arrecadação do eSocial (DAE).
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                        <TableHead>Tributo</TableHead>
                        <TableHead>Encargo do Empregador</TableHead>
                        <TableHead>Desconto do Empregado</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {domesticTaxesData.map((row) => (
                        <TableRow key={row.tribute}>
                            <TableCell className="font-medium">{row.tribute}</TableCell>
                            <TableCell>{row.employer}</TableCell>
                            <TableCell>{row.employee}</TableCell>
                        </TableRow>
                        ))}
                    </TableBody>
                </Table>
                 <p className="text-xs text-muted-foreground mt-4">
                    Nota: O IRRF e o INSS do empregado são retidos na fonte e pagos pelo empregador através do DAE, mas são custos do empregado.
                </p>
            </CardContent>
        </Card>
        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
            <Card>
            <CardHeader>
                <CardTitle>Contribuição Previdenciária – INSS (Geral)</CardTitle>
                <CardDescription>
                Vigência a partir de 1º de Janeiro de 2025
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead>Salário-de-contribuição (R$)</TableHead>
                    <TableHead>Alíquota Progressiva</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {inssTableData.map((row) => (
                    <TableRow key={row.range}>
                        <TableCell>{row.range}</TableCell>
                        <TableCell>{row.rate}</TableCell>
                    </TableRow>
                    ))}
                </TableBody>
                </Table>
            </CardContent>
            </Card>
            <Card>
            <CardHeader>
                <CardTitle>Imposto de Renda - IRRF</CardTitle>
                <CardDescription>
                Tabela Progressiva Mensal - Vigência a partir de Maio de 2025
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead>Base de Cálculo</TableHead>
                    <TableHead>Alíquota</TableHead>
                    <TableHead>Dedução</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {irrfTableData.map((row) => (
                    <TableRow key={row.base}>
                        <TableCell>{row.base}</TableCell>
                        <TableCell>{row.rate}</TableCell>
                        <TableCell>{row.deduction}</TableCell>
                    </TableRow>
                    ))}
                </TableBody>
                </Table>
            </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
