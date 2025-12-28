
'use client';

import { useUser, useAuth } from '@/firebase';
import { useDataService } from '@/hooks/useDataService';
import { useEffect, useState } from 'react';
import type { User as UserType } from '@/lib/types';
import { Loader2, ShieldAlert } from 'lucide-react';

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user: authUser, isUserLoading } = useUser();
  const [user, setUser] = useState<UserType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const dataService = useDataService();

  useEffect(() => {
    if (authUser) {
      dataService.getUserById(authUser.uid).then(userData => {
        if(userData) {
            setUser(userData);
        }
        setIsLoading(false);
      });
    } else if (!isUserLoading) {
        setIsLoading(false);
    }
  }, [authUser, dataService, isUserLoading]);

  if (isLoading || isUserLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (user?.role !== 'Admin') {
    return (
      <div className="flex flex-col items-center justify-center text-center p-12 border-2 border-dashed rounded-lg bg-destructive/10 text-destructive">
        <ShieldAlert className="w-16 h-16" />
        <h3 className="mt-4 text-lg font-semibold">Access Denied</h3>
        <p className="mt-2 text-sm">
          You do not have the required permissions to view this page.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
