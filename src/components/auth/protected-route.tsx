'use client';

import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react';
import { Skeleton } from '../ui/skeleton';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  if (isUserLoading) {
    return (
        <div className="flex flex-col min-h-screen">
            <header className="flex h-14 items-center gap-4 border-b bg-card px-4 lg:h-[60px] lg:px-6">
                <Skeleton className="h-8 w-8" />
                <div className="w-full flex-1">
                    <Skeleton className="h-8 w-full md:w-2/3 lg:w-1/3" />
                </div>
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-8 w-8 rounded-full" />
            </header>
            <div className="flex flex-1">
                <div className="hidden md:block border-r p-2">
                    <div className="flex flex-col gap-2">
                        <Skeleton className="h-8 w-8" />
                        <Skeleton className="h-8 w-8" />
                        <Skeleton className="h-8 w-8" />
                        <Skeleton className="h-8 w-8" />
                    </div>
                </div>
                <main className="flex-1 p-4 md:p-6 lg:p-8">
                     <Skeleton className="w-full h-full rounded-lg" />
                </main>
            </div>
        </div>
    )
  }

  if (user) {
    return <>{children}</>;
  }

  return null;
}
