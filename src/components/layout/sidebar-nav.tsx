'use client';

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  KanbanSquare,
  ListTodo,
  BrainCircuit,
  Settings,
  GanttChartSquare,
  LogOut,
} from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useDataService } from '@/hooks/useDataService';

const menuItems = [
  { href: '/', label: 'My Dashboard', icon: LayoutDashboard },
  { href: '/tasks', label: 'Tasks', icon: ListTodo },
  { href: '/board', label: 'Board', icon: KanbanSquare },
  { href: '/summary', label: 'AI Summary', icon: BrainCircuit },
];

export function SidebarNav() {
  const pathname = usePathname();
  const router = useRouter();
  const dataService = useDataService();

  const handleLogout = async () => {
    await dataService.logout();
    router.push('/login');
  };
  
  return (
    <Sidebar
      className="border-r"
      variant="sidebar"
      collapsible="icon"
    >
      <SidebarHeader className="h-14 justify-center items-center flex">
        <GanttChartSquare className="w-8 h-8 text-primary group-data-[state=collapsed]:w-6 group-data-[state=collapsed]:h-6 transition-all" />
        <h1 className="font-bold text-xl font-headline group-data-[state=collapsed]:hidden ml-2 text-primary-foreground">CollabFlow</h1>
      </SidebarHeader>

      <SidebarContent className="flex-1 p-2">
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <Link href={item.href}>
                <SidebarMenuButton
                  isActive={pathname === item.href}
                  tooltip={item.label}
                >
                  <item.icon />
                  <span>{item.label}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="p-2">
         <SidebarMenu>
            <SidebarMenuItem>
                <SidebarMenuButton tooltip="Settings">
                    <Settings />
                    <span>Settings</span>
                </SidebarMenuButton>
            </SidebarMenuItem>
             <SidebarMenuItem>
                <SidebarMenuButton tooltip="Logout" onClick={handleLogout}>
                    <LogOut />
                    <span>Logout</span>
                </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
