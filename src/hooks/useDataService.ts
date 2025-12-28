'use client';

import { IDataService } from "@/lib/types";
import { DataContext } from "@/context/data-service-provider";
import { useContext } from "react";

export function useDataService(): IDataService {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error("useDataService must be used within a DataServiceProvider");
  }
  if (!context.service) {
    // This should ideally not happen if the provider is correctly showing a loading state.
    throw new Error("Data service is not yet available.");
  }
  return context.service;
}
