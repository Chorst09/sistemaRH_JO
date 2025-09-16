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
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { absenceRequests, employees } from '@/lib/data';
import { PlusCircle, CheckCircle, XCircle, CalendarClock, Plane } from 'lucide-react';
import { cn } from '@/lib/utils';
import RequestVacationDialog from '@/components/absence/request-vacation-dialog';

export default function VacationPage() {
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

  const myRequests = absenceRequests.filter(r => r.employeeId === currentUser.id && r.type === 'Férias');
  
  // Simple logic for acquisition/concession period
  const hireDate = new Date(currentUser.hireDate);
  const now = new Date();
  const yearsOfService = now.getFullYear() - hireDate.getFullYear();
  const acquisitionStart = new Date(hireDate.setFullYear(hireDate.getFullYear() + yearsOfService -1));
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
              <RequestVacationDialog employee={currentUser}>
                <Button>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Solicitar Férias
                </Button>
              </RequestVacationDialog>
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
    </div>
  );
}
