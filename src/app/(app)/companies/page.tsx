import Link from 'next/link';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { getCompanies } from '@/lib/company-data';
import { PlusCircle, Building } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Company } from '@/types';

export default async function CompaniesPage() {
  let companies: Company[] = [];
  
  try {
    companies = await getCompanies();
  } catch (error) {
    console.error('Erro ao carregar empresas:', error);
    // Durante o build/prerendering, retorna array vazio se a tabela não existir
    companies = [];
  }
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2"><Building /> Empresas</CardTitle>
            <CardDescription>Gerencie as empresas e seus regimes tributários.</CardDescription>
          </div>
          <Button asChild>
            <Link href="/companies/new">
              <PlusCircle />
              Adicionar Empresa
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Razão Social</TableHead>
              <TableHead>CNPJ</TableHead>
              <TableHead>Regime Tributário</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>
                <span className="sr-only">Ações</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {companies.map((company) => (
              <TableRow key={company.id}>
                <TableCell className="font-medium">{company.name}</TableCell>
                <TableCell>{company.cnpj}</TableCell>
                <TableCell>{company.taxRegime}</TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={cn(
                      'capitalize',
                      company.status === 'Ativa' && 'border-green-300 bg-green-50 text-green-700 dark:bg-green-900/50 dark:border-green-800 dark:text-green-300',
                      company.status === 'Inativa' && 'border-red-300 bg-red-50 text-red-700 dark:bg-red-900/50 dark:border-red-800 dark:text-red-300',
                    )}
                  >
                    {company.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/companies/${company.id}`}>Ver</Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
