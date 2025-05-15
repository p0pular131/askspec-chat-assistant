
// Export from the hooks directory
import { useToast as useToastHook, toast as toastFn } from "@/hooks/use-toast";

// Re-export with the same names
export const useToast = useToastHook;
export const toast = toastFn;
