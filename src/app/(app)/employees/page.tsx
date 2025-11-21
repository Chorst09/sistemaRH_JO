'use client';

import Link from 'next/link';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { getEmployees } from '@/lib/data';
import { PlusCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { Employee } from '@/types';

export default function EmployeesPage() {
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

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Funcionários</CardTitle>
            <CardDescription>Gerencie os funcionários da sua organização.</CardDescription>
          </div>
          <Button asChild>
            <Link href="/employees/new">
              <PlusCircle className="mr-2 h-4 w-4" />
              Adicionar Funcionário
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead className="hidden md:table-cell">Departamento</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden md:table-cell">Data de Contratação</TableHead>
              <TableHead>
                <span className="sr-only">Ações</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {employees.length > 0 ? employees.map((employee) => (
              <TableRow key={employee.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="hidden h-9 w-9 sm:flex">
                      <AvatarImage src={(employee as any).avatar || ''} alt={employee.name} />
                      <AvatarFallback>
                        {employee.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="font-medium">
                      <Link href={`/employees/${employee.id}`} className="hover:underline">
                        {employee.name}
                      </Link>
                      <div className="text-sm text-muted-foreground md:hidden">{employee.role}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell">{employee.department}</TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={cn(
                      'capitalize',
                      employee.status === 'active' && 'bg-green-100 dark:bg-green-900/50 border-green-300 dark:border-green-800',
                      employee.status === 'inactive' && 'bg-red-100 dark:bg-red-900/50 border-red-300 dark:border-red-800',
                    )}
                  >
                    {employee.status === 'active' && 'Ativo'}
                    {employee.status === 'inactive' && 'Inativo'}
                  </Badge>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {new Date(employee.admission_date).toLocaleDateString('pt-BR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </TableCell>
                <TableCell>
                  <Link href={`/employees/${employee.id}`}>
                    <Button variant="outline" size="sm">
                      Ver
                    </Button>
                  </Link>
                </TableCell>
              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  Nenhum funcionário encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
