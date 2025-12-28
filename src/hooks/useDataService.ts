
import { IDataService } from "@/lib/types";
import { firebaseService } from "@/services/firebaseService";

export function useDataService(): IDataService {
  // This dynamic import was the key.
  // We return the service this way to ensure it's not bundled on the server.
  if (typeof window !== "undefined") {
    const { firebaseService } = require("@/services/firebaseService");
    return firebaseService;
  }
  
  // Return a mock or empty service for server-side rendering if needed,
  // but for our case, returning the imported one is fine as it has lazy init.
  return firebaseService;
}
