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
  const getEmployeeName = (employeeId: string) => {
    return employees.find(e => e.id === employeeId)?.name || 'Unknown';
  };

  const statusBadge = (status: 'Pending' | 'Approved' | 'Denied') => {
    return (
      <Badge
        variant="outline"
        className={cn(
          'capitalize',
          status === 'Approved' && 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/50 dark:text-green-300 dark:border-green-800',
          status === 'Pending' && 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/50 dark:text-yellow-300 dark:border-yellow-800',
          status === 'Denied' && 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900/50 dark:text-red-300 dark:border-red-800'
        )}
      >
        {status}
      </Badge>
    );
  };

  const myRequests = absenceRequests.filter(r => r.employeeId === '1'); // Assuming current user is CEO
  const teamRequests = absenceRequests.filter(r => r.status === 'Pending' && r.employeeId !== '1');

  return (
    <Tabs defaultValue="my-absences" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="my-absences">My Absences</TabsTrigger>
        <TabsTrigger value="team-requests">Team Requests</TabsTrigger>
      </TabsList>
      <TabsContent value="my-absences" className="mt-4">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>My Absences</CardTitle>
                <CardDescription>Your absence requests and balances.</CardDescription>
              </div>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Request Absence
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3 mb-6">
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Vacation Days Left</CardDescription>
                        <CardTitle className="text-4xl">12</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-xs text-muted-foreground">out of 20 days</div >
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Sick Leave Taken</CardDescription>
                        <CardTitle className="text-4xl">3</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-xs text-muted-foreground">this year</div >
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Personal Days</CardDescription>
                        <CardTitle className="text-4xl">2</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-xs text-muted-foreground">out of 5 days</div >
                    </CardContent>
                </Card>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {myRequests.map(request => (
                  <TableRow key={request.id}>
                    <TableCell>{request.type}</TableCell>
                    <TableCell>{request.startDate}</TableCell>
                    <TableCell>{request.endDate}</TableCell>
                    <TableCell>{statusBadge(request.status)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="team-requests" className="mt-4">
        <Card>
          <CardHeader>
            <CardTitle>Team Requests</CardTitle>
            <CardDescription>Pending absence requests from your team.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Dates</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teamRequests.map(request => (
                  <TableRow key={request.id}>
                    <TableCell>{getEmployeeName(request.employeeId)}</TableCell>
                    <TableCell>{request.type}</TableCell>
                    <TableCell>{request.startDate} to {request.endDate}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="outline" size="icon" className="text-green-600 hover:text-green-700">
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                       <Button variant="outline" size="icon" className="text-red-600 hover:text-red-700">
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
