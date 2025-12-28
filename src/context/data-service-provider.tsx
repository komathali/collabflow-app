'use client';

import { Skeleton } from "@/components/ui/skeleton";
import { useFirebase } from "@/firebase";
import { IDataService } from "@/lib/types";
import { createContext, useEffect, useState, ReactNode } from "react";

interface DataContextType {
    service: IDataService | null;
}

export const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataServiceProvider({ children }: { children: ReactNode }) {
    const [service, setService] = useState<IDataService | null>(null);
    const { isUserLoading } = useFirebase(); // We can depend on this to know when firebase is ready

    useEffect(() => {
        if (!isUserLoading) {
            const loadService = async () => {
                const { firebaseService } = await import("@/services/firebaseService");
                setService(firebaseService);
            };
            loadService();
        }
    }, [isUserLoading]);

    if (!service) {
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
        );
    }

    return (
        <DataContext.Provider value={{ service }}>
            {children}
        </DataContext.Provider>
    );
}
