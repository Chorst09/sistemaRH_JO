import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { getBenefitsCatalog } from '@/lib/benefits-data';
import { CheckCircle } from 'lucide-react';

export default async function BenefitsPage() {
  const benefits = await getBenefitsCatalog();

  return (
    <div className="space-y-6">
      <div>
          <h1 className="text-2xl font-bold font-headline">Catálogo de Benefícios</h1>
          <p className="text-muted-foreground">Estes são os benefícios oferecidos pela HR Vision.</p>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {benefits.map((benefit) => (
          <Card key={benefit.id}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <benefit.icon className="h-6 w-6 text-primary" />
                {benefit.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>{benefit.description}</CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
