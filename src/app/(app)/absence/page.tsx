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
import { absenceRequests, employees } from '@/lib/data';
import { PlusCircle, CheckCircle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AbsencePage() {
  const currentUser = employees.find(e => e.id === '1'); // Assuming current user is CEO

  if (!currentUser) {
    return null;
  }

  const getEmployeeName = (employeeId: string) => {
    return employees.find(e => e.id === employeeId)?.name || 'Desconhecido';
  };

  const statusBadge = (status: 'Pendente' | 'Aprovado' | 'Negado') => {
    return (
      <Badge
        variant="outline"
        className={cn(
          'capitalize',
          status === 'Aprovado' && 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/50 dark:text-green-300 dark:border-green-800',
          status === 'Pendente' && 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/50 dark:text-yellow-300 dark:border-yellow-800',
          status === 'Negado' && 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900/50 dark:text-red-300 dark:border-red-800'
        )}
      >
        {status}
      </Badge>
    );
  };

  const myRequests = absenceRequests.filter(r => r.employeeId === currentUser.id && r.type !== 'Férias'); 
  const teamRequests = absenceRequests.filter(r => r.status === 'Pendente' && r.employeeId !== currentUser.id && r.type !== 'Férias');

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
                {myRequests.length > 0 ? myRequests.map(request => (
                  <TableRow key={request.id}>
                    <TableCell>{request.type}</TableCell>
                    <TableCell>{new Date(request.startDate).toLocaleDateString('pt-BR', {timeZone: 'UTC'})}</TableCell>
                    <TableCell>{new Date(request.endDate).toLocaleDateString('pt-BR', {timeZone: 'UTC'})}</TableCell>
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
                {teamRequests.length > 0 ? teamRequests.map(request => (
                  <TableRow key={request.id}>
                    <TableCell>{getEmployeeName(request.employeeId)}</TableCell>
                    <TableCell>{request.type}</TableCell>
                    <TableCell>{new Date(request.startDate).toLocaleDateString('pt-BR', {timeZone: 'UTC'})} a {new Date(request.endDate).toLocaleDateString('pt-BR', {timeZone: 'UTC'})}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="outline" size="icon" className="text-green-600 hover:text-green-700">
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                       <Button variant="outline" size="icon" className="text-red-600 hover:text-red-700">
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
