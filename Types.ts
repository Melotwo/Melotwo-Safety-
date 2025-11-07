

import type { LucideIcon } from 'lucide-react';

export interface Review {
  id: string;
  username: string;
  rating: number; // e.g., 1-5
  comment: string;
  date: string; // ISO 8601 date string
}

export interface Product {
  id: number;
  name: string;
  category: string;
  sabsCertified: boolean;
  sabsStandard?: string;
  description: string;
  imageUrl: string;
  affiliateUrl: string;
  price?: number;
  isPrintable?: boolean;
  reviews?: Review[];
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
  rating?: 'up' | 'down' | null;
}

export interface EmailContent {
  subject: string;
  body: string;
}

export interface Toast {
  id: string;
  message: string;
  type: 'warning' | 'success' | 'info' | 'error';
}

// FIX: Export LucideIcon to be available for other modules.
export type { LucideIcon };
