import { employees } from '@/lib/data';
import OrgChartNode from '@/components/organization/org-chart-node';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function OrganizationPage() {
  const employeeMap = new Map(employees.map(e => [e.id, e]));
  const childrenMap = new Map<string, string[]>();

  employees.forEach(e => {
    if (e.managerId) {
      if (!childrenMap.has(e.managerId)) {
        childrenMap.set(e.managerId, []);
      }
      childrenMap.get(e.managerId)!.push(e.id);
    }
  });

  const rootEmployee = employees.find(e => !e.managerId);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Organizational Chart</CardTitle>
        <CardDescription>Visualize your company's structure.</CardDescription>
      </CardHeader>
      <CardContent className="p-4 md:p-10 overflow-x-auto">
        <div className="flex justify-center">
            {rootEmployee ? (
                <OrgChartNode
                employeeId={rootEmployee.id}
                employeeMap={employeeMap}
                childrenMap={childrenMap}
                />
            ) : (
                <p>No root employee found to build the organization chart.</p>
            )}
        </div>
      </CardContent>
    </Card>
  );
}
