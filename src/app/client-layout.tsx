'use client';

import { FirebaseClientProvider } from "@/firebase";
import ProtectedRoute from "@/components/auth/protected-route";
import { DataServiceProvider } from "@/context/data-service-provider";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
    return (
        <FirebaseClientProvider>
            <DataServiceProvider>
                <ProtectedRoute>
                    {children}
                </ProtectedRoute>
            </DataServiceProvider>
        </FirebaseClientProvider>
    )
}
