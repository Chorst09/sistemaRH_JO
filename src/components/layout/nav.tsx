'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  Users,
  CalendarOff,
  Network,
  BarChart,
  Plane,
  ReceiptText,
  BookUser,
  Settings,
  HeartHandshake,
  Calculator,
  Building,
} from 'lucide-react';

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/companies', icon: Building, label: 'Empresas' },
  { href: '/employees', icon: Users, label: 'Funcionários' },
  { href: '/vacation', icon: Plane, label: 'Férias' },
  { href: '/absence', icon: CalendarOff, label: 'Ausências' },
  { href: '/benefits', icon: HeartHandshake, label: 'Benefícios' },
  { href: '/payslip', icon: ReceiptText, label: 'Folha de Pagamento' },
  { href: '/admin/payslip', icon: BookUser, label: 'Folha (Admin)' },
  { href: '/organization', icon: Network, label: 'Organograma' },
  { href: '/reports', icon: BarChart, label: 'Relatórios' },
  { href: '/simulators', icon: Calculator, label: 'Simuladores' },
  { href: '/settings', icon: Settings, label: 'Configurações' },
];

export function Nav() {
  const pathname = usePathname();

  return (
    <SidebarMenu>
      {navItems.map((item) => (
        <SidebarMenuItem key={item.href}>
          <SidebarMenuButton
            asChild
            isActive={pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))}
            tooltip={item.label}
          >
            <Link href={item.href}>
              <item.icon />
              <span>{item.label}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}
