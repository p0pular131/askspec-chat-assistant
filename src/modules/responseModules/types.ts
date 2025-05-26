
export type ResponseModule = {
  process: (message: string, expertiseLevel?: string) => Promise<string>;
  name: string;
  moduleType: string;
};

export interface CompatibilityData {
  components?: string[];
  [key: string]: string[] | boolean | string | null | undefined; // Allow for dynamic key-value pairs for compatibility relationships
}
