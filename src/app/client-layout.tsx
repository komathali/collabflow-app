'use client';

import { FirebaseClientProvider } from "@/firebase";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
    return (
        <FirebaseClientProvider>
            {children}
        </FirebaseClientProvider>
    )
}
