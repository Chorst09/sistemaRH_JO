'use client';

import { useState } from 'react';
import { employees as initialEmployees } from '@/lib/data';
import { notFound } from 'next/navigation';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  User,
  Briefcase,
  Banknote,
  Phone,
  Mail,
  MapPin,
  CalendarDays,
  BadgeInfo,
  HeartHandshake,
  Settings
} from 'lucide-react';
import DocumentSection from './document-section';
import { benefits as allBenefits } from '@/lib/benefits-data';
import { Button } from '@/components/ui/button';
import ManageBenefitsDialog from '@/components/benefits/manage-benefits-dialog';
import { EmployeeBenefit } from '@/types';

export default function EmployeeProfilePage({
  params,
}: {
  params: { id: string };
}) {
  const [employees, setEmployees] = useState(initialEmployees);
  const employee = employees.find((e) => e.id === params.id);

  if (!employee) {
    notFound();
  }

  const handleBenefitsChange = (employeeId: string, newBenefits: EmployeeBenefit[]) => {
    setEmployees(prevEmployees => 
        prevEmployees.map(emp => 
            emp.id === employeeId ? { ...emp, benefits: newBenefits } : emp
        )
    );
  };

  const infoItems = [
    { icon: BadgeInfo, label: 'Cargo', value: employee.role },
    { icon: Briefcase, label: 'Departamento', value: employee.department },
    { icon: Mail, label: 'Email', value: employee.email },
    { icon: Phone, label: 'Telefone', value: employee.phone },
    { icon: MapPin, label: 'Endereço', value: employee.address },
    { icon: CalendarDays, label: 'Data de Contratação', value: new Date(employee.hireDate).toLocaleDateString('pt-BR', { year: 'numeric', month: 'long', day: 'numeric' }) },
  ];
  
  const employeeBenefitDetails = employee.benefits.map(empBenefit => {
    const benefitInfo = allBenefits.find(b => b.id === empBenefit.id);
    return {
      ...benefitInfo,
      ...empBenefit
    }
  }).filter(b => b.name); // Filter out any benefits not found in allBenefits

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6 flex items-center gap-6">
          <Avatar className="h-24 w-24">
            <AvatarImage src={employee.avatar} alt={employee.name} />
            <AvatarFallback>{employee.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold font-headline">{employee.name}</h1>
            <p className="text-muted-foreground">{employee.role} - {employee.department}</p>
          </div>
        </CardContent>
      </Card>
      
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="profile">Perfil</TabsTrigger>
          <TabsTrigger value="documents">Documentos</TabsTrigger>
        </TabsList>
        <TabsContent value="profile" className="mt-4">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card className="lg:col-span-1">
              <CardHeader className="flex flex-row items-center gap-3">
                <User className="h-6 w-6" />
                <CardTitle>Detalhes</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4 text-sm">
                  {infoItems.map(item => (
                    <li key={item.label} className="flex items-start">
                      <item.icon className="mr-3 mt-1 h-4 w-4 flex-shrink-0 text-muted-foreground" />
                      <div>
                        <span className="font-semibold">{item.label}:</span>{' '}
                        <span className="text-muted-foreground">{item.value}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <div className="lg:col-span-2 space-y-6">
                <Card>
                <CardHeader className="flex flex-row items-center gap-3">
                    <Banknote className="h-6 w-6" />
                    <CardTitle>Informações Financeiras</CardTitle>
                </CardHeader>
                <CardContent>
                    <ul className="space-y-4 text-sm">
                    <li className="flex items-start">
                        <BadgeInfo className="mr-3 mt-1 h-4 w-4 flex-shrink-0 text-muted-foreground" />
                        <div>
                        <span className="font-semibold">Salário:</span>{' '}
                        <span className="text-muted-foreground">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(employee.salary)} / ano</span>
                        </div>
                    </li>
                    <li className="flex items-start">
                        <BadgeInfo className="mr-3 mt-1 h-4 w-4 flex-shrink-0 text-muted-foreground" />
                        <div>
                        <span className="font-semibold">Banco:</span>{' '}
                        <span className="text-muted-foreground">{employee.bank}</span>
                        </div>
                    </li>
                    <li className="flex items-start">
                        <BadgeInfo className="mr-3 mt-1 h-4 w-4 flex-shrink-0 text-muted-foreground" />
                        <div>
                        <span className="font-semibold">Agência:</span>{' '}
                        <span className="text-muted-foreground">{employee.bankAgency}</span>
                        </div>
                    </li>
                    <li className="flex items-start">
                        <BadgeInfo className="mr-3 mt-1 h-4 w-4 flex-shrink-0 text-muted-foreground" />
                        <div>
                        <span className="font-semibold">Conta:</span>{' '}
                        <span className="text-muted-foreground">{employee.bankAccount}</span>
                        </div>
                    </li>
                    </ul>
                </CardContent>
                </Card>
                <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div className="flex items-center gap-3">
                        <HeartHandshake className="h-6 w-6" />
                        <CardTitle>Benefícios</CardTitle>
                    </div>
                    <ManageBenefitsDialog 
                      employee={employee} 
                      allBenefits={allBenefits} 
                      onBenefitsChange={handleBenefitsChange}
                    >
                        <Button variant="outline" size="sm">
                            <Settings className="mr-2 h-4 w-4"/>
                            Gerenciar
                        </Button>
                    </ManageBenefitsDialog>
                </CardHeader>
                <CardContent>
                    {employeeBenefitDetails.length > 0 ? (
                        <ul className="space-y-4 text-sm">
                        {employeeBenefitDetails.map(benefit => (
                            <li key={benefit.id} className="flex items-start">
                                <benefit.icon className="mr-3 mt-1 h-4 w-4 flex-shrink-0 text-muted-foreground" />
                                <div>
                                    <span className="font-semibold">{benefit.name}</span>
                                    {benefit.value && (
                                        <span className="text-muted-foreground ml-2">({new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(benefit.value))})</span>
                                    )}
                                    <p className="text-xs text-muted-foreground">{benefit.description}</p>
                                </div>
                            </li>
                        ))}
                        </ul>
                    ) : (
                        <p className="text-sm text-muted-foreground">Nenhum benefício associado a este funcionário.</p>
                    )}
                </CardContent>
                </Card>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="documents" className="mt-4">
          <DocumentSection />
        </TabsContent>
      </Tabs>
    </div>
  );
}
