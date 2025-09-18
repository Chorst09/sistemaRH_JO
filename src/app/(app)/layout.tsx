'use client';

import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarInset,
} from '@/components/ui/sidebar';
import { Logo } from '@/components/icons';
import { AppHeader } from '@/components/layout/app-header';
import { Nav } from '@/components/layout/nav';
import { UserNav } from '@/components/layout/user-nav';
import { ProtectedRoute } from '@/components/auth/protected-route';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <SidebarProvider>
        <Sidebar className="print:hidden" variant='sidebar'>
          <SidebarHeader className="p-4">
            <div className="flex items-center gap-2">
              <Logo className="size-8 text-sidebar-primary" />
              <span className="text-xl font-semibold text-sidebar-foreground">HR Vision</span>
            </div>
          </SidebarHeader>
          <SidebarContent className="p-2">
            <Nav />
          </SidebarContent>
          <SidebarFooter>
            {/* Can add footer content here */}
          </SidebarFooter>
        </Sidebar>
        <SidebarInset>
          <AppHeader />
          <main className="flex-1 p-4 md:p-6">{children}</main>
        </SidebarInset>
      </SidebarProvider>
    </ProtectedRoute>
  );
}
