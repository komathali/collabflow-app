import { IDataService } from "@/lib/types";
import { firebaseService } from "@/services/firebaseService";
import { supabaseService } from "@/services/supabaseService";

export function useDataService(): IDataService {
  const dbProvider = process.env.NEXT_PUBLIC_DB_PROVIDER;

  if (dbProvider === "supabase") {
    return supabaseService;
  }
  
  // Default to Firebase
  return firebaseService;
}
