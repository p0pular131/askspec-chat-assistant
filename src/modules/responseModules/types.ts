
export type ResponseModule = {
  process: (message: string, expertiseLevel?: string) => Promise<string>;
  name: string;
  moduleType: string;
};
