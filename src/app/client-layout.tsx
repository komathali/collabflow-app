'use client';

import { FirebaseClientProvider } from "@/firebase";
import { DataServiceProvider } from "@/context/data-service-provider";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
    return (
        <FirebaseClientProvider>
            <DataServiceProvider>
                {children}
            </DataServiceProvider>
        </FirebaseClientProvider>
    )
}
