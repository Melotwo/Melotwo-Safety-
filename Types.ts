export interface PpeProduct {
  id: string;
  name: string;
  keywords: string[];
  description: string;
  image: string;
}

export interface SavedChecklist {
  id: number;
  title: string;
  content: string;
  savedAt: string;
}
