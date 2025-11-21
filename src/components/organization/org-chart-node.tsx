import Link from 'next/link';
import { Employee } from '@/types';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';
import {
  Card,
  CardContent,
} from '@/components/ui/card';

type OrgChartNodeProps = {
  employeeId: string;
  employeeMap: Map<string, Employee>;
  childrenMap: Map<string, string[]>;
};

export default function OrgChartNode({ employeeId, employeeMap, childrenMap }: OrgChartNodeProps) {
  const employee = employeeMap.get(employeeId);
  const childrenIds = childrenMap.get(employeeId) || [];

  if (!employee) {
    return null;
  }

  return (
    <div className="flex flex-col items-center">
      {/* Node */}
      <Link href={`/employees/${employee.id}`}>
        <Card className="w-64 min-h-[7rem] hover:shadow-lg hover:border-primary transition-all duration-200">
          <CardContent className="p-4 flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={(employee as any).avatar_url || (employee as any).avatar || ''} />
              <AvatarFallback>{employee.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-bold">{employee.name}</p>
              <p className="text-sm text-muted-foreground">{employee.role}</p>
            </div>
          </CardContent>
        </Card>
      </Link>

      {/* Connectors and Children */}
      {childrenIds.length > 0 && (
        <>
          {/* Vertical line down from node */}
          <div className="w-px h-8 bg-border" />
          
          <div className="flex">
            {childrenIds.map((childId, index) => (
              <div key={childId} className="flex flex-col items-center relative px-4">
                {/* Horizontal line */}
                {childrenIds.length > 1 && (
                  <div className="absolute top-0 h-px bg-border" style={{
                    left: index === 0 ? '50%' : '0',
                    right: index === childrenIds.length - 1 ? '50%' : '0'
                  }} />
                )}

                {/* Vertical line up to horizontal line */}
                <div className="w-px h-8 bg-border" />

                <OrgChartNode
                  employeeId={childId}
                  employeeMap={employeeMap}
                  childrenMap={childrenMap}
                />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
