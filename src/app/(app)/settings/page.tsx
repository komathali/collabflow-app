
'use client';
import { AdminGuard } from '@/components/auth/admin-guard';
import { DepartmentManager } from '@/components/settings/department-manager';
import { UserManagement } from '@/components/settings/user-management';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building, Settings, Users } from 'lucide-react';

export default function SettingsPage() {
  return (
    <AdminGuard>
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-headline flex items-center gap-2">
            <Settings className="w-8 h-8" />
            Admin Settings
          </h1>
          <p className="text-muted-foreground">
            Manage your organization's users, departments, and roles.
          </p>
        </div>

        <Tabs defaultValue="users">
          <TabsList>
            <TabsTrigger value="users">
              <Users className="mr-2 h-4 w-4" />
              User Management
            </TabsTrigger>
            <TabsTrigger value="departments">
              <Building className="mr-2 h-4 w-4" />
              Departments
            </TabsTrigger>
          </TabsList>
          <TabsContent value="users" className="mt-4">
            <UserManagement />
          </TabsContent>
          <TabsContent value="departments" className="mt-4">
            <DepartmentManager />
          </TabsContent>
        </Tabs>
      </div>
    </AdminGuard>
  );
}
