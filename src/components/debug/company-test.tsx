'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { testCompanyCreation, checkTableStructure } from '@/lib/test-company-creation';
import { createCompany } from '@/lib/company-data';

export function CompanyTest() {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<any>({});

  const runAllTests = async () => {
    setIsLoading(true);
    setResults({});

    try {
      console.log('🚀 Iniciando testes de empresa...');
      
      // Teste 1: Verificar estrutura da tabela
      console.log('📋 Teste 1: Verificando estrutura da tabela...');
      const tableTest = await checkTableStructure();
      
      // Teste 2: Teste de criação automatizado
      console.log('🧪 Teste 2: Teste de criação automatizado...');
      const creationTest = await testCompanyCreation();
      
      // Teste 3: Teste de criação real usando a função da aplicação
      console.log('🏢 Teste 3: Teste de criação real...');
      let realCreationTest = false;
      let realCreationError = null;
      
      try {
        const testCompanyData = {
          name: 'Empresa Teste Real LTDA',
          cnpj: '12.345.678/0001-96',
          taxRegime: 'Simples Nacional' as const,
          status: 'Ativa' as const,
          address: 'Rua Teste Real, 123'
        };
        
        console.log('Dados do teste real:', testCompanyData);
        const newCompany = await createCompany(testCompanyData);
        console.log('✅ Empresa criada com sucesso:', newCompany);
        realCreationTest = true;
        
        // Limpar dados de teste (opcional)
        // await deleteCompany(newCompany.id);
        
      } catch (error: any) {
        console.error('❌ Erro no teste real:', error);
        realCreationError = error.message;
      }
      
      setResults({
        tableStructure: tableTest,
        automatedCreation: creationTest,
        realCreation: realCreationTest,
        realCreationError,
        timestamp: new Date().toISOString()
      });
      
    } catch (error: any) {
      console.error('❌ Erro geral nos testes:', error);
      setResults({
        error: error.message,
        timestamp: new Date().toISOString()
      });
    } finally {
      setIsLoading(false);
    }
  };

  const testDirectCreation = async () => {
    setIsLoading(true);
    
    try {
      console.log('🎯 Teste direto de criação...');
      
      const testData = {
        name: 'Teste Direto LTDA',
        cnpj: '98.765.432/0001-95',
        taxRegime: 'Lucro Presumido' as const,
        status: 'Ativa' as const,
        address: 'Av. Teste Direto, 456'
      };
      
      console.log('Criando empresa com dados:', testData);
      const result = await createCompany(testData);
      
      console.log('✅ Sucesso no teste direto:', result);
      
      setResults({
        ...results,
        directTest: {
          success: true,
          data: result,
          timestamp: new Date().toISOString()
        }
      });
      
    } catch (error: any) {
      console.error('❌ Erro no teste direto:', error);
      
      setResults({
        ...results,
        directTest: {
          success: false,
          error: error.message,
          timestamp: new Date().toISOString()
        }
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto mt-8">
      <CardHeader>
        <CardTitle>🧪 Teste de Criação de Empresa</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-4">
          <Button onClick={runAllTests} disabled={isLoading}>
            {isLoading ? 'Executando...' : 'Executar Todos os Testes'}
          </Button>
          
          <Button onClick={testDirectCreation} disabled={isLoading} variant="outline">
            {isLoading ? 'Testando...' : 'Teste Direto'}
          </Button>
        </div>
        
        {Object.keys(results).length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Resultados:</h3>
            
            {results.tableStructure !== undefined && (
              <div className="p-3 bg-muted rounded">
                <strong>📋 Estrutura da Tabela:</strong> {results.tableStructure ? '✅ OK' : '❌ Erro'}
              </div>
            )}
            
            {results.automatedCreation !== undefined && (
              <div className="p-3 bg-muted rounded">
                <strong>🧪 Teste Automatizado:</strong> {results.automatedCreation ? '✅ OK' : '❌ Erro'}
              </div>
            )}
            
            {results.realCreation !== undefined && (
              <div className="p-3 bg-muted rounded">
                <strong>🏢 Teste Real:</strong> {results.realCreation ? '✅ OK' : '❌ Erro'}
                {results.realCreationError && (
                  <div className="text-red-600 text-sm mt-1">
                    Erro: {results.realCreationError}
                  </div>
                )}
              </div>
            )}
            
            {results.directTest && (
              <div className="p-3 bg-muted rounded">
                <strong>🎯 Teste Direto:</strong> {results.directTest.success ? '✅ OK' : '❌ Erro'}
                {results.directTest.error && (
                  <div className="text-red-600 text-sm mt-1">
                    Erro: {results.directTest.error}
                  </div>
                )}
                {results.directTest.data && (
                  <div className="text-green-600 text-sm mt-1">
                    Empresa criada: {results.directTest.data.name}
                  </div>
                )}
              </div>
            )}
            
            <details className="mt-4">
              <summary className="cursor-pointer font-semibold">Ver logs detalhados</summary>
              <pre className="bg-muted p-4 rounded-md text-sm overflow-auto mt-2">
                {JSON.stringify(results, null, 2)}
              </pre>
            </details>
          </div>
        )}
        
        <div className="text-sm text-muted-foreground">
          <p><strong>Instruções:</strong></p>
          <ul className="list-disc list-inside space-y-1">
            <li><strong>Todos os Testes:</strong> Executa verificação completa da estrutura e criação</li>
            <li><strong>Teste Direto:</strong> Testa apenas a criação usando a função real da aplicação</li>
            <li>Verifique o console do navegador para logs detalhados</li>
            <li>Os dados de teste são criados e podem ser removidos manualmente se necessário</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}