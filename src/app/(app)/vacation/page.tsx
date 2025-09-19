'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { CalendarClock, Plane } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Employee } from '@/types';
import RequestVacationDialog from '@/components/absence/request-vacation-dialog';
import { supabase } from '@/lib/supabase';
import { Database } from '@/types/supabase';

type VacationRequest = {
  id: string;
  employee_id: string;
  start_date: string;
  end_date: string;
  status: 'pending' | 'approved' | 'rejected';
  type: string | null;
  days_requested: number;
  reason: string | null;
  created_at: string | null;
  updated_at: string | null;
};

export default function VacationPage() {
  const [currentUser, setCurrentUser] = useState<Employee | null>(null);
  const [vacationRequests, setVacationRequests] = useState<VacationRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        // Buscar o primeiro funcionário disponível
        const { data: employees, error: employeesError } = await supabase
          .from('employees')
          .select('*')
          .limit(1);

        if (employeesError) throw employeesError;

        if (employees && employees.length > 0) {
          const employee = employees[0] as any;
          // Mapear os dados para o formato esperado
           const mappedEmployee: Employee = {
             id: employee.id,
             name: employee.name,
             email: employee.email,
             role: employee.role,
             department: employee.department,
             admission_date: employee.hiredate || employee.created_at,
             birth_date: employee.birth_date || '1990-01-01',
             phone: employee.phone || '',
             address: employee.address || '',
             city: employee.city || 'São Paulo',
             state: employee.state || 'SP',
             zip_code: employee.zip_code || '00000-000',
             status: employee.status === 'Ativo' ? 'active' : 'inactive' as 'active' | 'inactive',
             created_at: employee.created_at,
             updated_at: employee.updated_at
           };
          setCurrentUser(mappedEmployee);

          // Buscar as solicitações de férias do usuário
          const { data: requests, error: requestsError } = await supabase
            .from('vacation_requests')
            .select('*')
            .eq('employee_id', employee.id)
            .is('type', null)
            .order('created_at', { ascending: false });

          if (requestsError) throw requestsError;
          
          // Converter os dados para o tipo VacationRequest
          const typedRequests = (requests || []).map((request: any) => ({
            ...request,
            status: ['pending', 'approved', 'rejected'].includes(request.status) ? request.status : 'pending',
          })) as VacationRequest[];
          
          setVacationRequests(typedRequests);
        } else {
          setError('Nenhum funcionário encontrado. Execute a migração do banco de dados.');
        }
      } catch (err) {
        console.error('Erro ao carregar dados:', err);
        setError(err instanceof Error ? err.message : 'Erro ao carregar dados');
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  const statusBadge = (status: 'pending' | 'approved' | 'rejected') => {
    const statusMap = {
      pending: 'Pendente',
      approved: 'Aprovado',
      rejected: 'Negado'
    };

    return (
      <Badge
        variant="outline"
        className={cn(
          'capitalize',
          status === 'approved' && 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/50 dark:text-green-300 dark:border-green-800',
          status === 'pending' && 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/50 dark:text-yellow-300 dark:border-yellow-800',
          status === 'rejected' && 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900/50 dark:text-red-300 dark:border-red-800'
        )}
      >
        {statusMap[status]}
      </Badge>
    );
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

  if (!currentUser) {
    return (
      <Card>
        <CardContent className="h-24 flex items-center justify-center">
          <p className="text-muted-foreground">Usuário não encontrado.</p>
        </CardContent>
      </Card>
    );
  }
  
  // Lógica para período aquisitivo/concessivo
  const hireDate = new Date(currentUser.admission_date);
  const now = new Date();
  const yearsOfService = now.getFullYear() - hireDate.getFullYear();
  const acquisitionStart = new Date(hireDate.setFullYear(hireDate.getFullYear() + yearsOfService - 1));
  const acquisitionEnd = new Date(new Date(acquisitionStart).setFullYear(acquisitionStart.getFullYear() + 1));
  const concessionEnd = new Date(new Date(acquisitionEnd).setFullYear(acquisitionEnd.getFullYear() + 1));

  return (
    <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2"><Plane /> Férias</CardTitle>
                <CardDescription>Suas solicitações e saldos de férias.</CardDescription>
              </div>
              {currentUser && (
                <RequestVacationDialog employee={currentUser} />
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3 mb-6">
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Dias de Férias Restantes</CardDescription>
                        <CardTitle className="text-4xl">12</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-xs text-muted-foreground">de 30 dias</div>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Período Aquisitivo</CardDescription>
                        <CardTitle className="text-lg">
                           {acquisitionStart.toLocaleDateString('pt-BR')} - {acquisitionEnd.toLocaleDateString('pt-BR')}
                        </CardTitle>
                    </CardHeader>
                     <CardContent>
                        <div className="text-xs text-muted-foreground">Período atual</div>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="pb-2 flex flex-row items-center justify-between">
                       <div>
                        <CardDescription>Limite para Concessão</CardDescription>
                        <CardTitle className="text-lg">{concessionEnd.toLocaleDateString('pt-BR')}</CardTitle>
                       </div>
                       <CalendarClock className="h-6 w-6 text-muted-foreground"/>
                    </CardHeader>
                    <CardContent>
                       <div className="text-xs text-muted-foreground">O empregador deve conceder as férias até esta data</div>
                    </CardContent>
                </Card>
            </div>
            <h3 className="text-lg font-medium mb-4">Minhas Solicitações de Férias</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Data de Início</TableHead>
                  <TableHead>Data de Fim</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vacationRequests.length > 0 ? vacationRequests.map(request => (
                  <TableRow key={request.id}>
                    <TableCell>Férias</TableCell>
                    <TableCell>{new Date(request.start_date).toLocaleDateString('pt-BR', {timeZone: 'UTC'})}</TableCell>
                    <TableCell>{new Date(request.end_date).toLocaleDateString('pt-BR', {timeZone: 'UTC'})}</TableCell>
                    <TableCell>{statusBadge(request.status)}</TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">Nenhuma solicitação encontrada.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
    </div>
  );
}
