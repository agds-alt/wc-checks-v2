// src/types/inspection.types.ts
export type InspectionComponent = 
  | 'aroma'
  | 'floor_cleanliness'
  | 'wall_condition'
  | 'sink_condition'
  | 'mirror_condition'
  | 'toilet_condition'
  | 'urinal_condition'
  | 'soap_availability'
  | 'tissue_availability'
  | 'air_freshener'
  | 'trash_bin_condition';

// NEW: 5-star rating system
export type RatingChoice = 1 | 2 | 3 | 4 | 5;

export interface ComponentRating {
  component: InspectionComponent;
  choice: RatingChoice;
  notes?: string;
  photo?: string;
}

export type ComponentCategory = 'aroma' | 'visual' | 'availability' | 'functional';

export interface InspectionComponentConfig {
  id: InspectionComponent;
  category: ComponentCategory;
  label: string;
  labelGenZ: string;
  weight: number;
  icon: string; // Lucide icon name for professional mode
  iconGenZ: string; // Emoji for GenZ mode
  required: boolean;
  allowPhoto: boolean;
}

// ============================================
// INSPECTION COMPONENTS CONFIGURATION
// ============================================

export const INSPECTION_COMPONENTS: InspectionComponentConfig[] = [
  // AROMA CATEGORY
  {
    id: 'aroma',
    category: 'aroma',
    label: 'Aroma/Odor Level',
    labelGenZ: 'Bau-bauan',
    weight: 0.15,
    icon: 'Nose',
    iconGenZ: '👃',
    required: true,
    allowPhoto: false
  },

  // VISUAL CLEANLINESS CATEGORY
  {
    id: 'floor_cleanliness',
    category: 'visual',
    label: 'Floor Cleanliness',
    labelGenZ: 'Kebersihan Lantai',
    weight: 0.12,
    icon: 'Droplets',
    iconGenZ: '✨',
    required: true,
    allowPhoto: true
  },
  {
    id: 'wall_condition',
    category: 'visual',
    label: 'Wall & Tile Condition',
    labelGenZ: 'Kondisi Dinding',
    weight: 0.08,
    icon: 'Square',
    iconGenZ: '🎨',
    required: true,
    allowPhoto: true
  },
  {
    id: 'mirror_condition',
    category: 'visual',
    label: 'Mirror Cleanliness',
    labelGenZ: 'Kebersihan Cermin',
    weight: 0.06,
    icon: 'Mirror',
    iconGenZ: '🪞',
    required: true,
    allowPhoto: false
  },
  {
    id: 'toilet_condition',
    category: 'visual',
    label: 'Toilet Bowl Condition',
    labelGenZ: 'Kondisi Kloset',
    weight: 0.15,
    icon: 'Droplet', // Using Droplet as placeholder for toilet
    iconGenZ: '🚽',
    required: true,
    allowPhoto: true
  },
  {
    id: 'trash_bin_condition',
    category: 'visual',
    label: 'Trash Bin Condition',
    labelGenZ: 'Kondisi Tempat Sampah',
    weight: 0.06,
    icon: 'Trash2',
    iconGenZ: '🗑️',
    required: true,
    allowPhoto: false
  },

  // FUNCTIONAL CATEGORY
  {
    id: 'sink_condition',
    category: 'functional',
    label: 'Sink & Faucet Condition',
    labelGenZ: 'Kondisi Wastafel',
    weight: 0.10,
    icon: 'Droplet',
    iconGenZ: '💧',
    required: true,
    allowPhoto: true
  },
  {
    id: 'urinal_condition',
    category: 'functional',
    label: 'Urinal Condition',
    labelGenZ: 'Kondisi Urinoir',
    weight: 0.08,
    icon: 'Droplets',
    iconGenZ: '🚿',
    required: false, // Not all toilets have urinals
    allowPhoto: true
  },

  // AVAILABILITY CATEGORY
  {
    id: 'soap_availability',
    category: 'availability',
    label: 'Soap Availability',
    labelGenZ: 'Ketersediaan Sabun',
    weight: 0.08,
    icon: 'Droplets',
    iconGenZ: '🧴',
    required: true,
    allowPhoto: false
  },
  {
    id: 'tissue_availability',
    category: 'availability',
    label: 'Tissue Availability',
    labelGenZ: 'Ketersediaan Tissue',
    weight: 0.08,
    icon: 'FileText',
    iconGenZ: '🧻',
    required: true,
    allowPhoto: false
  },
  {
    id: 'air_freshener',
    category: 'availability',
    label: 'Air Freshener',
    labelGenZ: 'Pengharum Ruangan',
    weight: 0.04,
    icon: 'Wind',
    iconGenZ: '🌬️',
    required: true,
    allowPhoto: false
  },
];

// ============================================
// HELPER FUNCTIONS
// ============================================

export const calculateWeightedScore = (ratings: ComponentRating[]): number => {
  let totalWeight = 0;
  let weightedSum = 0;

  ratings.forEach((rating) => {
    const component = INSPECTION_COMPONENTS.find((c) => c.id === rating.component);
    if (!component) return;

    totalWeight += component.weight;

    // Scoring: 5 stars = 100, 4 stars = 80, 3 stars = 60, 2 stars = 40, 1 star = 20
    const scoreMap: Record<RatingChoice, number> = {
      5: 100,
      4: 80,
      3: 60,
      2: 40,
      1: 20,
    };

    weightedSum += scoreMap[rating.choice] * component.weight;
  });

  if (totalWeight === 0) return 0;
  return Math.round(weightedSum / totalWeight);
};

export const getScoreStatus = (
  score: number
): { label: string; color: string; emoji: string } => {
  if (score >= 85) {
    return { label: 'Excellent', color: 'green', emoji: '🌟' };
  } else if (score >= 70) {
    return { label: 'Good', color: 'blue', emoji: '😊' };
  } else if (score >= 50) {
    return { label: 'Fair', color: 'yellow', emoji: '😐' };
  } else if (score >= 30) {
    return { label: 'Poor', color: 'orange', emoji: '😟' };
  } else {
    return { label: 'Critical', color: 'red', emoji: '😨' };
  }
};

export interface PhotoWithMetadata {
  file: File;
  preview: string;
  componentId: InspectionComponent;
  timestamp: string;
  geolocation?: {
    latitude: number;
    longitude: number;
  };
}