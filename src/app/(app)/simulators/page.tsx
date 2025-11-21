'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import VacationSimulator from '@/components/simulators/vacation-simulator';
import TerminationSimulator from '@/components/simulators/termination-simulator';
import CltVsPjSimulator from '@/components/simulators/clt-vs-pj-simulator';
import { Calculator } from 'lucide-react';
import DomesticSimulator from '@/components/simulators/domestic-simulator';

export default function SimulatorsPage() {
  return (
    <div className="space-y-6">
       <div>
          <h1 className="text-2xl font-bold font-headline flex items-center gap-2">
            <Calculator className="h-6 w-6"/>
            Central de Simuladores
          </h1>
          <p className="text-muted-foreground">Projete cenários e tome decisões informadas.</p>
      </div>
      <Tabs defaultValue="termination" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="termination">Rescisão</TabsTrigger>
          <TabsTrigger value="vacation">Férias</TabsTrigger>
          <TabsTrigger value="clt-vs-pj">CLT vs. PJ</TabsTrigger>
          <TabsTrigger value="domestic">Empregado Doméstico</TabsTrigger>
        </TabsList>
        <TabsContent value="termination">
            <TerminationSimulator />
        </TabsContent>
        <TabsContent value="vacation">
            <VacationSimulator />
        </TabsContent>
        <TabsContent value="clt-vs-pj">
            <CltVsPjSimulator />
        </TabsContent>
        <TabsContent value="domestic">
            <DomesticSimulator />
        </TabsContent>
      </Tabs>
    </div>
  );
}
