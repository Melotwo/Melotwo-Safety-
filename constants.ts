
import React from 'react';
import { Building, Factory, Wrench } from 'lucide-react';
// FIX: Updated path to use alias for consistency.
// FIX: Replaced ambiguous path alias with a specific path to resolve module loading error.
import { PpeProduct } from '@/types/index';

export const PPE_PRODUCTS: PpeProduct[] = [
  {
    id: 'hh-001',
    name: 'Industrial Hard Hat',
    keywords: ['hard hat', 'head protection', 'helmet'],
    description: 'SABS approved for impact resistance. Comfortable and adjustable for all-day wear.',
    image: 'https://images.unsplash.com/photo-1581092570025-a5a4d6a1d1d8?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: 'sg-002',
    name: 'Safety Goggles',
    keywords: ['goggles', 'eye protection', 'safety glasses'],
    description: 'Anti-fog, scratch-resistant lenses with full UV protection. Wraparound design for maximum coverage.',
    image: 'https://images.unsplash.com/photo-1628882799342-31b2d433d832?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: 'gl-003',
    name: 'Heavy-Duty Work Gloves',
    keywords: ['gloves', 'hand protection'],
    description: 'Reinforced leather palm for high abrasion resistance. Ideal for handling rough materials.',
    image: 'https://images.unsplash.com/photo-1590390190363-356a5293a557?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: 'sb-004',
    name: 'Steel-Toed Safety Boots',
    keywords: ['boots', 'footwear', 'foot protection', 'steel-toed'],
    description: 'Puncture-proof sole and certified steel toe cap. Waterproof and slip-resistant.',
    image: 'https://images.unsplash.com/photo-1628813635741-f358e6503c5d?q=80&w=800&auto=format&fit=crop',
  },
];

export const exampleScenarios = [
  {
    icon: React.createElement(Building, { className: "w-8 h-8 text-amber-500 flex-shrink-0" }),
    title: 'Construction Welding',
    industry: 'High-rise Construction Site',
    task: 'Welding steel support beams on the 3rd floor',
    equipment: 'Arc Welder, Scaffolding, Fire Extinguisher',
    details: 'Working on an open-air platform at a height of 30 meters. Mildly windy conditions.',
  },
  {
    icon: React.createElement(Factory, { className: "w-8 h-8 text-amber-500 flex-shrink-0" }),
    title: 'Warehouse Forklift',
    industry: 'Busy Distribution Warehouse',
    task: 'Operating a forklift to move pallets from receiving to storage racks',
    equipment: 'Propane Forklift, Pallet Jack',
    details: 'Narrow aisles with pedestrian traffic. Indoor, fluorescent lighting.',
  },
  {
    icon: React.createElement(Wrench, { className: "w-8 h-8 text-amber-500 flex-shrink-0" }),
    title: 'Confined Space Entry',
    industry: 'Wastewater Treatment Plant',
    task: 'Entering a drainage tank for routine inspection and maintenance',
    equipment: 'Gas Detector, Harness, Winch, Ventilation Fan',
    details: 'Space is 5 meters deep with a 60cm entry hatch. Potential for hazardous gases and low oxygen levels.',
  }
];
