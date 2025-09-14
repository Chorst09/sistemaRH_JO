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

export default function SettingsPage() {
  return (
    <div className="space-y-6">
        <div className="flex items-center gap-2">
            <Settings className="h-6 w-6"/>
            <h1 className="text-2xl font-bold font-headline">Configurações</h1>
        </div>
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Contribuição Previdenciária – INSS</CardTitle>
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
  );
}
