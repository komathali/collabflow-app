'use client';

import { IDataService } from "@/lib/types";
import { useState, useEffect } from "react";

export function useDataService(): IDataService | null {
  const [service, setService] = useState<IDataService | null>(null);

  useEffect(() => {
    // This effect runs only on the client side.
    const loadService = async () => {
      // Dynamically import the service to ensure it's not part of the server bundle.
      const { firebaseService } = await import("@/services/firebaseService");
      setService(firebaseService);
    };

    loadService();
  }, []); // The empty dependency array ensures this runs only once on mount.

  return service;
}

    