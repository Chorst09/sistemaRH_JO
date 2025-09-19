'use client';

import { useEffect, useState } from 'react';
import { getEmployee, updateEmployee } from '@/lib/data';
import { getBenefitsCatalog } from '@/lib/benefits-data';
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
import { Button } from '@/components/ui/button';
import ManageBenefitsDialog from '@/components/benefits/manage-benefits-dialog';
import { Employee } from '@/types';
import { EmployeeBenefit } from '@/types/index';
import { Benefit } from '@/lib/benefits-data';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function EmployeeProfilePage({ params }: PageProps) {
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [allBenefits, setAllBenefits] = useState<Benefit[]>([]);
  const [employeeId, setEmployeeId] = useState<string>('');

  useEffect(() => {
    async function loadParams() {
      const { id } = await params;
      setEmployeeId(id);
    }
    loadParams();
  }, [params]);

  useEffect(() => {
    if (!employeeId) return;
    
    async function loadEmployee() {
      const data = await getEmployee(employeeId);
      if (data) {
        setEmployee(data);
      }
    }

    async function loadBenefits() {
      const benefits = await getBenefitsCatalog();
      setAllBenefits(benefits);
    }

    loadEmployee();
    loadBenefits();
  }, [employeeId]);

  if (!employee) {
    return <div>Carregando...</div>;
  }

  const handleBenefitsChange = async (employeeId: string, newBenefits: EmployeeBenefit[]) => {
    // Benefits are managed separately from employee data
    // This function is called when benefits are updated in the dialog
    console.log('Benefits updated for employee:', employeeId, newBenefits);
    // TODO: Implement actual benefits update logic if needed
  };

  const infoItems = [
    { icon: BadgeInfo, label: 'Cargo', value: employee.role },
    { icon: Briefcase, label: 'Departamento', value: employee.department },
    { icon: BadgeInfo, label: 'Status', value: employee.status },
    { icon: Mail, label: 'Email', value: employee.email },
    { icon: Phone, label: 'Telefone', value: employee.phone },
    { icon: MapPin, label: 'Endereço', value: employee.address },
    { icon: CalendarDays, label: 'Data de Contratação', value: employee.admission_date ? new Date(employee.admission_date).toLocaleDateString('pt-BR', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Data não informada' },
  ];
  
  const employeeBenefitDetails = (employee as any).benefits?.map((empBenefit: any) => {
    const benefitInfo = allBenefits.find(b => b.id === empBenefit.id);
    return {
      ...benefitInfo,
      ...empBenefit
    }
  }).filter((b: any) => b.name) || []; // Filter out any benefits not found in allBenefits

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6 flex items-center gap-6">
          <Avatar className="h-24 w-24">
            <AvatarImage src={(employee as any).avatar || ''} alt={employee.name} />
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
                        <span className="text-muted-foreground">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format((employee as any).salary || 0)} / ano</span>
                        </div>
                    </li>
                    <li className="flex items-start">
                        <BadgeInfo className="mr-3 mt-1 h-4 w-4 flex-shrink-0 text-muted-foreground" />
                        <div>
                        <span className="font-semibold">Banco:</span>{' '}
                        <span className="text-muted-foreground">{(employee as any).bank || 'Não informado'}</span>
                        </div>
                    </li>
                    <li className="flex items-start">
                        <BadgeInfo className="mr-3 mt-1 h-4 w-4 flex-shrink-0 text-muted-foreground" />
                        <div>
                        <span className="font-semibold">Agência:</span>{' '}
                        <span className="text-muted-foreground">{(employee as any).bankAgency || 'Não informado'}</span>
                        </div>
                    </li>
                    <li className="flex items-start">
                        <BadgeInfo className="mr-3 mt-1 h-4 w-4 flex-shrink-0 text-muted-foreground" />
                        <div>
                        <span className="font-semibold">Conta:</span>{' '}
                        <span className="text-muted-foreground">{(employee as any).bankAccount || 'Não informado'}</span>
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
                        {employeeBenefitDetails.map((benefit: any) => (
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
          <DocumentSection employeeId={employee.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
