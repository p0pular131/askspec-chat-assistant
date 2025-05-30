
export interface ResponseModule {
  name: string;
  moduleType: string;
  process: (message: string, expertiseLevel?: string, sessionId?: string) => Promise<string>;
}

export interface CompatibilityData {
  [key: string]: boolean | string | string[] | undefined;
  components?: string[];
}

export interface PartDetail {
  name: string;
  price: string;
  specs: string;
  reason: string;
  link: string;
  image?: string;
  image_url?: string;
}

export interface BuildData {
  title: string;
  parts: PartDetail[] | Record<string, PartDetail>;
  total_price: string;
  total_reason: string;
  suggestion?: string;
}
