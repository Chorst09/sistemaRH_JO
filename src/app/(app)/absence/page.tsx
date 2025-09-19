'use client';

import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getEmployee } from '@/lib/data';
import { PlusCircle, CheckCircle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Database } from '@/types/supabase';
import { createClient } from '@/lib/supabase-client';

type AbsenceRequest = Database['public']['Tables']['absence_requests']['Row'];
type Employee = Database['public']['Tables']['employees']['Row'];

export default function AbsencePage() {
  const [currentUser, setCurrentUser] = useState<Employee | null>(null);
  const [myAbsenceRequests, setMyAbsenceRequests] = useState<AbsenceRequest[]>([]);
  const [teamAbsenceRequests, setTeamAbsenceRequests] = useState<AbsenceRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [employeeNames, setEmployeeNames] = useState<Record<string, string>>({});
  
  const supabase = createClient();

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
          const employee = employees[0] as Employee;
          setCurrentUser(employee);

          // Buscar as solicitações de ausência do usuário
          const { data: myRequests, error: myRequestsError } = await supabase
            .from('absence_requests')
            .select('*')
            .eq('employee_id', employee.id)
            .neq('type', 'vacation')
            .order('created_at', { ascending: false });

          if (myRequestsError) throw myRequestsError;
          setMyAbsenceRequests(myRequests || []);

          // Buscar as solicitações pendentes da equipe
          const { data: teamRequests, error: teamRequestsError } = await supabase
            .from('absence_requests')
            .select('*')
            .eq('status', 'pending')
            .neq('employee_id', employee.id)
            .neq('type', 'vacation')
            .order('created_at', { ascending: false });

          if (teamRequestsError) throw teamRequestsError;
          const typedTeamRequests = (teamRequests || []) as AbsenceRequest[];
          setTeamAbsenceRequests(typedTeamRequests);

          // Buscar nomes dos funcionários para as solicitações da equipe
          if (typedTeamRequests && typedTeamRequests.length > 0) {
            const employeeIds = [...new Set((typedTeamRequests as any[]).map(r => r.employee_id))];
            const { data: employees, error: employeesError } = await supabase
              .from('employees')
              .select('id, name')
              .in('id', employeeIds);

            if (employeesError) throw employeesError;
            
            const namesMap: Record<string, string> = {};
            (employees as { id: string; name: string }[])?.forEach(emp => {
              namesMap[emp.id] = emp.name;
            });
            setEmployeeNames(namesMap);
          }
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

  const handleApproveRequest = async (requestId: string) => {
    try {
      const { error } = await (supabase as any)
        .from('absence_requests')
        .update({ status: 'approved' })
        .eq('id', requestId);

      if (error) throw error;

      // Atualizar a lista de solicitações da equipe
      setTeamAbsenceRequests(prev => 
        prev.filter(request => request.id !== requestId)
      );
    } catch (err) {
      console.error('Erro ao aprovar solicitação:', err);
      // Aqui você pode adicionar uma notificação de erro para o usuário
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      const { error } = await (supabase as any)
        .from('absence_requests')
        .update({ status: 'rejected' })
        .eq('id', requestId);

      if (error) throw error;

      // Atualizar a lista de solicitações da equipe
      setTeamAbsenceRequests(prev => 
        prev.filter(request => request.id !== requestId)
      );
    } catch (err) {
      console.error('Erro ao rejeitar solicitação:', err);
      // Aqui você pode adicionar uma notificação de erro para o usuário
    }
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

  return (
    <Tabs defaultValue="my-absences" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="my-absences">Minhas Ausências</TabsTrigger>
        <TabsTrigger value="team-requests">Solicitações da Equipe</TabsTrigger>
      </TabsList>
      <TabsContent value="my-absences" className="mt-4">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Minhas Ausências</CardTitle>
                <CardDescription>Suas solicitações de ausência (exceto férias).</CardDescription>
              </div>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Solicitar Ausência
              </Button>
            </div>
          </CardHeader>
          <CardContent>
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
                {myAbsenceRequests.length > 0 ? myAbsenceRequests.map(request => (
                  <TableRow key={request.id}>
                    <TableCell>{request.type}</TableCell>
                    <TableCell>{new Date(request.start_date).toLocaleDateString('pt-BR', {timeZone: 'UTC'})}</TableCell>
                    <TableCell>{new Date(request.end_date).toLocaleDateString('pt-BR', {timeZone: 'UTC'})}</TableCell>
                    <TableCell>{statusBadge(request.status as 'pending' | 'approved' | 'rejected')}</TableCell>
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
      </TabsContent>
      <TabsContent value="team-requests" className="mt-4">
        <Card>
          <CardHeader>
            <CardTitle>Solicitações da Equipe</CardTitle>
            <CardDescription>Solicitações de ausência pendentes da sua equipe.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Funcionário</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Datas</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teamAbsenceRequests.length > 0 ? teamAbsenceRequests.map(request => (
                  <TableRow key={request.id}>
                    <TableCell>{employeeNames[request.employee_id] || 'Desconhecido'}</TableCell>
                    <TableCell>{request.type}</TableCell>
                    <TableCell>{new Date(request.start_date).toLocaleDateString('pt-BR', {timeZone: 'UTC'})} a {new Date(request.end_date).toLocaleDateString('pt-BR', {timeZone: 'UTC'})}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="text-green-600 hover:text-green-700"
                        onClick={() => handleApproveRequest(request.id)}
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleRejectRequest(request.id)}
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">Nenhuma solicitação pendente.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
