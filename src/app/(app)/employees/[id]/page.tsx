import { employees } from '@/lib/data';
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
} from 'lucide-react';
import DocumentSection from './document-section';

export default function EmployeeProfilePage({
  params,
}: {
  params: { id: string };
}) {
  const employee = employees.find((e) => e.id === params.id);

  if (!employee) {
    notFound();
  }

  const infoItems = [
    { icon: BadgeInfo, label: 'Role', value: employee.role },
    { icon: Briefcase, label: 'Department', value: employee.department },
    { icon: Mail, label: 'Email', value: employee.email },
    { icon: Phone, label: 'Phone', value: employee.phone },
    { icon: MapPin, label: 'Address', value: employee.address },
    { icon: CalendarDays, label: 'Hire Date', value: new Date(employee.hireDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) },
  ];

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
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>
        <TabsContent value="profile" className="mt-4">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader className="flex flex-row items-center gap-3">
                <User className="h-6 w-6" />
                <CardTitle>Personal & Professional Details</CardTitle>
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

            <Card>
              <CardHeader className="flex flex-row items-center gap-3">
                <Banknote className="h-6 w-6" />
                <CardTitle>Financial Information</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4 text-sm">
                  <li className="flex items-start">
                    <BadgeInfo className="mr-3 mt-1 h-4 w-4 flex-shrink-0 text-muted-foreground" />
                    <div>
                      <span className="font-semibold">Salary:</span>{' '}
                      <span className="text-muted-foreground">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(employee.salary)} / year</span>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <BadgeInfo className="mr-3 mt-1 h-4 w-4 flex-shrink-0 text-muted-foreground" />
                    <div>
                      <span className="font-semibold">Bank:</span>{' '}
                      <span className="text-muted-foreground">{employee.bank}</span>
                    </div>
                  </li>
                   <li className="flex items-start">
                    <BadgeInfo className="mr-3 mt-1 h-4 w-4 flex-shrink-0 text-muted-foreground" />
                    <div>
                      <span className="font-semibold">Agency:</span>{' '}
                      <span className="text-muted-foreground">{employee.bankAgency}</span>
                    </div>
                  </li>
                   <li className="flex items-start">
                    <BadgeInfo className="mr-3 mt-1 h-4 w-4 flex-shrink-0 text-muted-foreground" />
                    <div>
                      <span className="font-semibold">Account:</span>{' '}
                      <span className="text-muted-foreground">{employee.bankAccount}</span>
                    </div>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="documents" className="mt-4">
          <DocumentSection />
        </TabsContent>
      </Tabs>
    </div>
  );
}
