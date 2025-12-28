'use client';

import { FirebaseClientProvider } from "@/firebase";
import ProtectedRoute from "@/components/auth/protected-route";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
    return (
        <FirebaseClientProvider>
            <ProtectedRoute>
                {children}
            </ProtectedRoute>
        </FirebaseClientProvider>
    )
}
