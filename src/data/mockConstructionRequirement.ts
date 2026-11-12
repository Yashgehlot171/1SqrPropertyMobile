/**
 * Static mock data for the "Build Your Dream Home" construction-requirement
 * flow. Sample catalogue data is isolated here so it can be swapped for real API responses
 * later without touching any screen or component.
 */
import type {
  Builder,
  ConstructionPackage,
  ConstructionPlan,
  MaterialCategory,
  MaterialSpecification,
} from '@/types/constructionRequirement.types';

export const mockBuilders: Builder[] = [
  {
    id: 'builder-abc',
    name: 'ABC Construction',
    verified: true,
    location: 'Pune, PCMC, Hinjewadi',
    yearsInBusiness: 12,
    completedProjects: 140,
    rating: 4.6,
  },
  {
    id: 'builder-shree',
    name: 'Skyline Builders',
    verified: true,
    location: 'Pune, Wakad, Baner',
    yearsInBusiness: 8,
    completedProjects: 95,
    rating: 4.4,
  },
  {
    id: 'builder-raj',
    name: 'Dream Homes',
    verified: true,
    location: 'Pune, Kharadi, Viman Nagar',
    yearsInBusiness: 10,
    completedProjects: 110,
    rating: 4.5,
  },
  {
    id: 'builder-prime',
    name: 'Prime Habitat',
    verified: true,
    location: 'Pune, Kothrud, Bavdhan',
    yearsInBusiness: 9,
    completedProjects: 88,
    rating: 4.7,
  },
  {
    id: 'builder-nova',
    name: 'Nova Spaces',
    verified: true,
    location: 'Pune, Viman Nagar, Kharadi',
    yearsInBusiness: 7,
    completedProjects: 64,
    rating: 4.3,
  },
];

export const mockConstructionPackages: ConstructionPackage[] = [
  {
    id: 'package-premium',
    tier: 'Premium',
    name: 'Premium Package',
    pricePerSqFt: 2350,
    summary: 'High-end branded materials with premium finishes throughout.',
  },
  {
    id: 'package-gold',
    tier: 'Gold',
    name: 'Gold Package',
    pricePerSqFt: 1850,
    summary: 'Branded structural materials with select premium upgrades.',
  },
  {
    id: 'package-silver',
    tier: 'Silver',
    name: 'Silver Package',
    pricePerSqFt: 1450,
    summary: 'Reliable standard materials for a value-focused build.',
  },
];

export const mockConstructionPlans: ConstructionPlan[] = [
  {
    id: 'plan-abc-gold',
    builderId: 'builder-abc',
    packageId: 'package-gold',
    tier: 'Gold',
    planName: 'Gold Plan',
    pricePerSqFt: 1850,
    matchesLocation: true,
    matchesArea: true,
    isRecommended: true,
  },
  {
    id: 'plan-shree-premium',
    builderId: 'builder-shree',
    packageId: 'package-premium',
    tier: 'Premium',
    planName: 'Premium Plan',
    pricePerSqFt: 2350,
    matchesLocation: true,
    matchesArea: true,
    isBestValue: true,
  },
  {
    id: 'plan-raj-gold',
    builderId: 'builder-raj',
    packageId: 'package-gold',
    tier: 'Gold',
    planName: 'Gold Plan',
    pricePerSqFt: 1800,
    matchesLocation: false,
    matchesArea: true,
  },
  {
    id: 'plan-prime-premium',
    builderId: 'builder-prime',
    packageId: 'package-premium',
    tier: 'Premium',
    planName: 'Premium Plan',
    pricePerSqFt: 2300,
    matchesLocation: true,
    matchesArea: true,
  },
  {
    id: 'plan-nova-silver',
    builderId: 'builder-nova',
    packageId: 'package-silver',
    tier: 'Silver',
    planName: 'Silver Plan',
    pricePerSqFt: 1450,
    matchesLocation: true,
    matchesArea: true,
  },
];

export const mockMaterialCategories: MaterialCategory[] = [
  {id: 'cat-steel', name: 'Steel', icon: 'construct-outline'},
  {id: 'cat-cement', name: 'Cement / Concrete', icon: 'layers-outline'},
  {id: 'cat-structure', name: 'Structure', icon: 'business-outline'},
  {id: 'cat-brick', name: 'Brick / Block', icon: 'grid-outline'},
  {id: 'cat-tiles', name: 'Tiles / Flooring', icon: 'apps-outline'},
  {id: 'cat-false-ceiling', name: 'False Ceiling', icon: 'square-outline'},
  {id: 'cat-modular-kitchen', name: 'Modular Kitchen', icon: 'restaurant-outline'},
  {id: 'cat-furniture', name: 'Furniture', icon: 'bed-outline'},
  {id: 'cat-borewell', name: 'Borewell', icon: 'water-outline'},
  {id: 'cat-motor-pump', name: 'Motor Pump', icon: 'cog-outline'},
  {id: 'cat-water-tank', name: 'Water Tank', icon: 'beaker-outline'},
  {id: 'cat-paint', name: 'Paint', icon: 'color-palette-outline'},
  {id: 'cat-doors', name: 'Doors', icon: 'log-in-outline'},
  {id: 'cat-windows', name: 'Windows', icon: 'browsers-outline'},
  {id: 'cat-electrical', name: 'Electrical', icon: 'flash-outline'},
  {id: 'cat-plumbing', name: 'Plumbing', icon: 'water-outline'},
  {id: 'cat-bathroom', name: 'Bathroom / Sanitary', icon: 'water-outline'},
  {id: 'cat-waterproofing', name: 'Waterproofing', icon: 'umbrella-outline'},
];

/**
 * One row per (package, category). 18 categories x 3 packages = 54 rows.
 * Content is illustrative, written to demonstrate all four states
 * (Included / Not Included / Optional Upgrade / Conditional) realistically.
 */
export const mockMaterialSpecifications: MaterialSpecification[] = [
  // Steel
  {id: 'spec-premium-steel', packageId: 'package-premium', categoryId: 'cat-steel', status: 'Included', detail: 'Fe 550D TMT bars, primary brand'},
  {id: 'spec-gold-steel', packageId: 'package-gold', categoryId: 'cat-steel', status: 'Included', detail: 'Fe 500 TMT bars, branded'},
  {id: 'spec-silver-steel', packageId: 'package-silver', categoryId: 'cat-steel', status: 'Included', detail: 'Standard TMT bars'},

  // Cement / Concrete
  {id: 'spec-premium-cement', packageId: 'package-premium', categoryId: 'cat-cement', status: 'Included', detail: 'OPC 53 grade, ready-mix concrete'},
  {id: 'spec-gold-cement', packageId: 'package-gold', categoryId: 'cat-cement', status: 'Included', detail: 'OPC 53 grade cement'},
  {id: 'spec-silver-cement', packageId: 'package-silver', categoryId: 'cat-cement', status: 'Included', detail: 'OPC 43 grade cement'},

  // Structure
  {id: 'spec-premium-structure', packageId: 'package-premium', categoryId: 'cat-structure', status: 'Included', detail: 'RCC framed, earthquake-resistant design'},
  {id: 'spec-gold-structure', packageId: 'package-gold', categoryId: 'cat-structure', status: 'Included', detail: 'RCC framed structure'},
  {id: 'spec-silver-structure', packageId: 'package-silver', categoryId: 'cat-structure', status: 'Conditional', detail: 'RCC framed; earthquake design depends on soil test'},

  // Brick / Block
  {id: 'spec-premium-brick', packageId: 'package-premium', categoryId: 'cat-brick', status: 'Included', detail: 'AAC blocks, all walls'},
  {id: 'spec-gold-brick', packageId: 'package-gold', categoryId: 'cat-brick', status: 'Included', detail: 'AAC blocks, external walls'},
  {id: 'spec-silver-brick', packageId: 'package-silver', categoryId: 'cat-brick', status: 'Included', detail: 'Red clay bricks'},

  // Tiles / Flooring
  {id: 'spec-premium-tiles', packageId: 'package-premium', categoryId: 'cat-tiles', status: 'Included', detail: 'Large-format vitrified tiles'},
  {id: 'spec-gold-tiles', packageId: 'package-gold', categoryId: 'cat-tiles', status: 'Included', detail: 'Standard vitrified tiles'},
  {id: 'spec-silver-tiles', packageId: 'package-silver', categoryId: 'cat-tiles', status: 'Included', detail: 'Ceramic tiles'},

  // False Ceiling
  {id: 'spec-premium-false-ceiling', packageId: 'package-premium', categoryId: 'cat-false-ceiling', status: 'Included', detail: 'Living room, bedrooms and kitchen'},
  {id: 'spec-gold-false-ceiling', packageId: 'package-gold', categoryId: 'cat-false-ceiling', status: 'Optional Upgrade', detail: 'Available for living room at extra cost'},
  {id: 'spec-silver-false-ceiling', packageId: 'package-silver', categoryId: 'cat-false-ceiling', status: 'Not Included'},

  // Modular Kitchen
  {id: 'spec-premium-modular-kitchen', packageId: 'package-premium', categoryId: 'cat-modular-kitchen', status: 'Included', detail: 'Full modular kitchen with fittings'},
  {id: 'spec-gold-modular-kitchen', packageId: 'package-gold', categoryId: 'cat-modular-kitchen', status: 'Optional Upgrade', detail: 'Add-on package available'},
  {id: 'spec-silver-modular-kitchen', packageId: 'package-silver', categoryId: 'cat-modular-kitchen', status: 'Not Included'},

  // Furniture
  {id: 'spec-premium-furniture', packageId: 'package-premium', categoryId: 'cat-furniture', status: 'Optional Upgrade', detail: 'Wardrobes and TV unit on request'},
  {id: 'spec-gold-furniture', packageId: 'package-gold', categoryId: 'cat-furniture', status: 'Optional Upgrade', detail: 'Wardrobes on request'},
  {id: 'spec-silver-furniture', packageId: 'package-silver', categoryId: 'cat-furniture', status: 'Not Included'},

  // Borewell
  {id: 'spec-premium-borewell', packageId: 'package-premium', categoryId: 'cat-borewell', status: 'Conditional', detail: 'Included if site does not have municipal connection'},
  {id: 'spec-gold-borewell', packageId: 'package-gold', categoryId: 'cat-borewell', status: 'Conditional', detail: 'Included if site does not have municipal connection'},
  {id: 'spec-silver-borewell', packageId: 'package-silver', categoryId: 'cat-borewell', status: 'Conditional', detail: 'Chargeable add-on, site-dependent'},

  // Motor Pump
  {id: 'spec-premium-motor-pump', packageId: 'package-premium', categoryId: 'cat-motor-pump', status: 'Included', detail: 'Branded motor pump with automation'},
  {id: 'spec-gold-motor-pump', packageId: 'package-gold', categoryId: 'cat-motor-pump', status: 'Included', detail: 'Standard motor pump'},
  {id: 'spec-silver-motor-pump', packageId: 'package-silver', categoryId: 'cat-motor-pump', status: 'Optional Upgrade', detail: 'Available at extra cost'},

  // Water Tank
  {id: 'spec-premium-water-tank', packageId: 'package-premium', categoryId: 'cat-water-tank', status: 'Included', detail: 'Overhead + underground sump'},
  {id: 'spec-gold-water-tank', packageId: 'package-gold', categoryId: 'cat-water-tank', status: 'Included', detail: 'Overhead tank'},
  {id: 'spec-silver-water-tank', packageId: 'package-silver', categoryId: 'cat-water-tank', status: 'Included', detail: 'Overhead tank, standard capacity'},

  // Paint
  {id: 'spec-premium-paint', packageId: 'package-premium', categoryId: 'cat-paint', status: 'Included', detail: 'Premium emulsion, interior and exterior'},
  {id: 'spec-gold-paint', packageId: 'package-gold', categoryId: 'cat-paint', status: 'Included', detail: 'Standard emulsion paint'},
  {id: 'spec-silver-paint', packageId: 'package-silver', categoryId: 'cat-paint', status: 'Included', detail: 'Basic paint, single coat'},

  // Doors
  {id: 'spec-premium-doors', packageId: 'package-premium', categoryId: 'cat-doors', status: 'Included', detail: 'Teak wood main door, laminate internal doors'},
  {id: 'spec-gold-doors', packageId: 'package-gold', categoryId: 'cat-doors', status: 'Included', detail: 'Flush doors with veneer finish'},
  {id: 'spec-silver-doors', packageId: 'package-silver', categoryId: 'cat-doors', status: 'Included', detail: 'Basic flush doors'},

  // Windows
  {id: 'spec-premium-windows', packageId: 'package-premium', categoryId: 'cat-windows', status: 'Included', detail: 'UPVC windows with mesh'},
  {id: 'spec-gold-windows', packageId: 'package-gold', categoryId: 'cat-windows', status: 'Included', detail: 'Powder-coated aluminium windows'},
  {id: 'spec-silver-windows', packageId: 'package-silver', categoryId: 'cat-windows', status: 'Included', detail: 'Basic aluminium windows'},

  // Electrical
  {id: 'spec-premium-electrical', packageId: 'package-premium', categoryId: 'cat-electrical', status: 'Included', detail: 'Concealed copper wiring, modular switches'},
  {id: 'spec-gold-electrical', packageId: 'package-gold', categoryId: 'cat-electrical', status: 'Included', detail: 'Concealed copper wiring, standard switches'},
  {id: 'spec-silver-electrical', packageId: 'package-silver', categoryId: 'cat-electrical', status: 'Included', detail: 'Standard wiring and switches'},

  // Plumbing
  {id: 'spec-premium-plumbing', packageId: 'package-premium', categoryId: 'cat-plumbing', status: 'Included', detail: 'CPVC premium-grade piping'},
  {id: 'spec-gold-plumbing', packageId: 'package-gold', categoryId: 'cat-plumbing', status: 'Included', detail: 'CPVC standard piping'},
  {id: 'spec-silver-plumbing', packageId: 'package-silver', categoryId: 'cat-plumbing', status: 'Included', detail: 'Basic GI/PVC piping'},

  // Bathroom / Sanitary
  {id: 'spec-premium-bathroom', packageId: 'package-premium', categoryId: 'cat-bathroom', status: 'Included', detail: 'Premium branded sanitaryware'},
  {id: 'spec-gold-bathroom', packageId: 'package-gold', categoryId: 'cat-bathroom', status: 'Included', detail: 'Standard branded sanitaryware'},
  {id: 'spec-silver-bathroom', packageId: 'package-silver', categoryId: 'cat-bathroom', status: 'Included', detail: 'Basic sanitaryware'},

  // Waterproofing
  {id: 'spec-premium-waterproofing', packageId: 'package-premium', categoryId: 'cat-waterproofing', status: 'Included', detail: 'Terrace and basement waterproofing with warranty'},
  {id: 'spec-gold-waterproofing', packageId: 'package-gold', categoryId: 'cat-waterproofing', status: 'Included', detail: 'Terrace waterproofing'},
  {id: 'spec-silver-waterproofing', packageId: 'package-silver', categoryId: 'cat-waterproofing', status: 'Optional Upgrade', detail: 'Available at extra cost'},
];
