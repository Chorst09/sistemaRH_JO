'use client';

import { useEffect, useState } from 'react';
import { getEmployees } from '@/lib/data';
import OrgChartNode from '@/components/organization/org-chart-node';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Employee } from '@/types';

export default function OrganizationPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadEmployees() {
      try {
        const data = await getEmployees();
        setEmployees(data);
      } catch (err) {
        console.error('Erro ao carregar funcionários:', err);
        setError(err instanceof Error ? err.message : 'Erro ao carregar funcionários');
      } finally {
        setIsLoading(false);
      }
    }

    loadEmployees();
  }, []);

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

  const employeeMap = new Map(employees.map(e => [e.id, e]));
  const childrenMap = new Map<string, string[]>();

  employees.forEach(e => {
    const managerId = (e as any).manager_id || (e as any).managerId;
    if (managerId) {
      if (!childrenMap.has(managerId)) {
        childrenMap.set(managerId, []);
      }
      childrenMap.get(managerId)!.push(e.id);
    }
  });

  const rootEmployee = employees.find(e => !(e as any).manager_id && !(e as any).managerId);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Organograma</CardTitle>
        <CardDescription>Visualize a estrutura da sua empresa.</CardDescription>
      </CardHeader>
      <CardContent className="p-4 md:p-10 overflow-x-auto">
        <div className="flex justify-center">
          {rootEmployee ? (
            <OrgChartNode
              employeeId={rootEmployee.id}
              employeeMap={employeeMap}
              childrenMap={childrenMap}
            />
          ) : (
            <p>Nenhum funcionário raiz encontrado para construir o organograma.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
