'use client';

import { CompanyTest } from '@/components/debug/company-test';
import { AuthDebug } from '@/components/debug/auth-debug';
import { BenefitsDebug } from '@/components/debug/benefits-debug';

export default function TestCompanyPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Página de Testes</h1>
        <p className="text-muted-foreground">
          Use esta página para testar a criação de empresas e verificar problemas.
        </p>
      </div>
      
      <BenefitsDebug />
      
      <CompanyTest />
      
      <AuthDebug />
    </div>
  );
}