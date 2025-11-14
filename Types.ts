import React from 'react';

export interface PpeProduct {
  id: string;
  name: string;
  keywords: string[];
  description:string;
  image: string;
}

export interface SavedChecklist {
  id: number;
  title: string;
  content: string;
  savedAt: string;
}

/**
 * Defines the structure for displaying error messages to the user.
 */
export interface ErrorState {
  title: string;
  message: string | React.ReactNode;
}

/**
 * Defines the structure for form validation errors.
 */
export interface ValidationErrors {
    industry?: string;
    task?: string;
}

/**
 * Defines the structure for a chat message.
 */
export interface Message {
  role: 'user' | 'model';
  content: string;
}

/**
 * Defines the structure for equipment categories for the multi-select dropdown.
 */
export interface EquipmentCategory {
  category: string;
  items: string[];
}
