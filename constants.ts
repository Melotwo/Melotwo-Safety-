import type { Product, ProductCategory } from './types';
import { HardHat, Hand, Footprints, Shield, Eye, Ear } from 'lucide-react';

export const PRODUCT_CATEGORIES: ProductCategory[] = [
  { name: 'Head Protection', description: 'Helmets and hard hats for construction and mining.', icon: HardHat },
  { name: 'Hand Protection', description: 'Gloves for various industrial applications.', icon: Hand },
  { name: 'Foot Protection', description: 'Safety boots and shoes with reinforced toes.', icon: Footprints },
  { name: 'Fall Protection', description: 'Harnesses, lanyards, and fall arrest systems.', icon: Shield },
  { name: 'Eye Protection', description: 'Goggles and safety glasses for all environments.', icon: Eye },
  { name: 'Hearing Protection', description: 'Earmuffs and earplugs to prevent hearing loss.', icon: Ear },
];

const AFFILIATE_LINK = 'https://mineafrica.co.za/index.php?route=account/trackin';

export const PRODUCTS: Product[] = [
  {
    id: 1,
    name: 'Industrial Hard Hat V-Gard',
    category: 'Head Protection',
    sabsCertified: true,
    sabsStandard: 'SABS 1397',
    description: 'A durable and comfortable hard hat with a high-density polyethylene shell. Meets SABS 1397 standards.',
    imageUrl: 'https://picsum.photos/seed/melotwo-hardhat/400/300',
    affiliateUrl: AFFILIATE_LINK,
  },
  {
    id: 2,
    name: 'Leather Work Gloves',
    category: 'Hand Protection',
    sabsCertified: true,
    sabsStandard: 'SABS EN388',
    description: 'Reinforced leather gloves for heavy-duty tasks. SABS certified for abrasion resistance.',
    imageUrl: 'https://picsum.photos/seed/melotwo-gloves/400/300',
    affiliateUrl: AFFILIATE_LINK,
  },
  {
    id: 3,
    name: 'Steel-Toe Safety Boots',
    category: 'Foot Protection',
    sabsCertified: true,
    sabsStandard: 'SABS 20345',
    description: 'Anti-slip, oil-resistant sole with steel toe cap protection. SABS 20345 compliant.',
    imageUrl: 'https://picsum.photos/seed/melotwo-boots/400/300',
    affiliateUrl: AFFILIATE_LINK,
  },
  {
    id: 4,
    name: 'Full Body Safety Harness',
    category: 'Fall Protection',
    sabsCertified: true,
    sabsStandard: 'SABS 50361',
    description: '5-point adjustment harness for maximum safety during work at height. Complies with SABS 50361.',
    imageUrl: 'https://picsum.photos/seed/melotwo-harness/400/300',
    affiliateUrl: AFFILIATE_LINK,
  },
   {
    id: 5,
    name: 'Anti-Fog Safety Goggles',
    category: 'Eye Protection',
    sabsCertified: true,
    sabsStandard: 'SABS 166',
    description: 'Ventilated, anti-fog, and scratch-resistant goggles for full eye protection. SABS 166 certified.',
    imageUrl: 'https://picsum.photos/seed/melotwo-goggles/400/300',
    affiliateUrl: AFFILIATE_LINK,
  },
  {
    id: 6,
    name: 'High-Performance Earmuffs',
    category: 'Hearing Protection',
    sabsCertified: false,
    description: 'Comfortable earmuffs with a high Noise Reduction Rating (NRR) of 31dB.',
    imageUrl: 'https://picsum.photos/seed/melotwo-earmuffs/400/300',
    affiliateUrl: AFFILIATE_LINK,
  },
  {
    id: 7,
    name: 'Reflective Mining Helmet',
    category: 'Head Protection',
    sabsCertified: true,
    sabsStandard: 'SABS 1397',
    description: 'Specialized helmet for mining with high visibility reflective strips and lamp bracket. SABS 1397.',
    imageUrl: 'https://picsum.photos/seed/melotwo-mininghelmet/400/300',
    affiliateUrl: AFFILIATE_LINK,
  },
  {
    id: 8,
    name: 'Cut-Resistant Gloves',
    category: 'Hand Protection',
    sabsCertified: true,
    sabsStandard: 'SABS EN388',
    description: 'Level 5 cut resistance for handling sharp materials. Meets SABS EN388 standards.',
    imageUrl: 'https://picsum.photos/seed/melotwo-cutgloves/400/300',
    affiliateUrl: AFFILIATE_LINK,
  }
];