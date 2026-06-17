export const categories = [
  "Todos",
  "Interfaces",
  "Dashboards",
  "Documentos",
  "Chats & DMs",
  "Mapas & Diagramas",
  "Comparações",
  "Motion Graphics",
  "3D & HUDs",
] as const;

export type Category = (typeof categories)[number];

export type Complexity = "Baixa" | "Média" | "Alta";

export type GraphicHook = {
  id: string;
  creator: string;
  source: "Instagram";
  originalUrl: string;
  timestamp: string;
  visualCategory: Exclude<Category, "Todos">;
  complexity: Complexity;
  screenshot: string;
  sequence: string[];
  gif: string;
  hookStructure: string;
  howToRecreate: string;
  assetsNeeded: string[];
  estimatedProductionTime: string;
  notes: string;
};
