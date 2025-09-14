'use client';

import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { companies } from '@/lib/company-data';
import { ArrowLeft, Building, FileText, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export default function CompanyDetailPage({ params }: { params: { id: string } }) {
  const company = companies.find((c) => c.id === params.id);

  if (!company) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/companies">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Voltar para empresas</span>
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold font-headline">{company.name}</h1>
          <p className="text-muted-foreground">Detalhes da empresa e informações fiscais.</p>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building /> Informações Gerais
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 text-sm">
            <div className="grid gap-1">
                <div className="text-muted-foreground">Razão Social</div>
                <div className="font-medium">{company.name}</div>
            </div>
            <div className="grid gap-1">
                <div className="text-muted-foreground">CNPJ</div>
                <div className="font-medium">{company.cnpj}</div>
            </div>
             <div className="grid gap-1">
                <div className="text-muted-foreground">Regime Tributário</div>
                <div className="font-medium">{company.taxRegime}</div>
            </div>
             <div className="grid gap-1">
                <div className="text-muted-foreground">Status</div>
                <div className="font-medium">
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
                </div>
            </div>
          </div>
        </CardContent>
      </Card>
       <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <FileText /> Documentos e Certidões
            </CardTitle>
            <CardDescription>
                Em breve você poderá gerenciar os documentos da empresa aqui.
            </CardDescription>
        </CardHeader>
        <CardContent>
            <div className="text-sm text-muted-foreground p-8 text-center border-2 border-dashed rounded-lg">
                Funcionalidade em desenvolvimento.
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
