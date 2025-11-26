import { FC, SVGProps } from 'react';

export type Page = 'home' | 'solutions' | 'inspector';

export type IconComponent = FC<SVGProps<SVGSVGElement>>;

export interface AffiliateLink {
  id: number;
  name: string;
  url: string;
  description: string;
  icon: IconComponent;
}

export interface SafetyInspectionResult {
  text: string;
  score: string;
  label: string;
  color: string;
}

export interface InspectionHistoryItem {
  id: string;
  timestamp: number;
  scenario: string;
  systemPrompt: string;
  result: SafetyInspectionResult;
}

export interface InspectorTemplate {
  id: string;
  name: string;
  description: string;
  scenario: string;
  systemPrompt: string;
}
