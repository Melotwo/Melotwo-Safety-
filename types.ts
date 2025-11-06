import type { LucideIcon } from 'lucide-react';

export interface Product {
  id: number;
  name: string;
  category: string;
  sabsCertified: boolean;
  sabsStandard?: string;
  description: string;
  imageUrl: string;
  affiliateUrl: string;
}

export interface ProductCategory {
  name: string;
  description: string;
  icon: LucideIcon;
}

export interface Source {
  title: string;
  uri: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  sources?: Source[];
}