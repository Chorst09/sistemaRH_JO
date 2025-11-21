'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
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
import { PlusCircle, Building, Loader2, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Company } from '@/types/index';

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCompanies = async () => {
    try {
      setIsLoading(true);
      const companiesData = await getCompanies();
      setCompanies(companiesData);
      setError(null);
    } catch (error) {
      console.error('Erro ao carregar empresas:', error);
      setError('Erro ao carregar empresas');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCompanies();
  }, []);

  // Adicionar listener para atualizar quando voltar da página de criação
  useEffect(() => {
    const handleFocus = () => {
      loadCompanies();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  const handleRefresh = () => {
    loadCompanies();
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2"><Building /> Empresas</CardTitle>
              <CardDescription>Gerencie as empresas e seus regimes tributários.</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleRefresh} disabled={isLoading}>
                <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
                Atualizar
              </Button>
              <Button asChild>
                <Link href="/companies/new">
                  <PlusCircle />
                  Adicionar Empresa
                </Link>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Carregando empresas...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
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
          <div className="text-center py-8 text-red-600">
            {error}
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2"><Building /> Empresas</CardTitle>
            <CardDescription>Gerencie as empresas e seus regimes tributários.</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleRefresh} disabled={isLoading}>
              <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
              Atualizar
            </Button>
            <Button asChild>
              <Link href="/companies/new">
                <PlusCircle />
                Adicionar Empresa
              </Link>
            </Button>
          </div>
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
