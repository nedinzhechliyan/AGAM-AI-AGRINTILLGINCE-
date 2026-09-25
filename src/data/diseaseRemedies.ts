export type DiseaseLabel =
  | 'Leaf Blight'
  | 'Powdery Mildew'
  | 'Rust'
  | 'Bacterial Spot'
  | 'Healthy';

export const DISEASE_REMEDIES: Record<DiseaseLabel, string> = {
  "Leaf Blight": "Remove affected leaves, apply copper-based fungicide, avoid overhead watering.",
  "Powdery Mildew": "Apply sulfur-based fungicide, improve air circulation between plants.",
  "Rust": "Apply fungicide with triazole, remove infected debris from field.",
  "Bacterial Spot": "Use copper spray, avoid working in wet fields, rotate crops next season.",
  "Healthy": "No disease detected. Continue regular monitoring."
};

/**
 * Normalizes raw output from Gemini Vision to match one of the exact 5 keys
 */
export function matchDiseaseLabel(raw: string): DiseaseLabel {
  const clean = raw.trim().replace(/^["'`*#]+|["'`*#.]+$/g, '').trim();

  // Exact match
  if (clean in DISEASE_REMEDIES) {
    return clean as DiseaseLabel;
  }

  // Case-insensitive / Substring match
  const lower = clean.toLowerCase();
  if (lower.includes('leaf blight') || lower.includes('blight')) return 'Leaf Blight';
  if (lower.includes('powdery mildew') || lower.includes('mildew')) return 'Powdery Mildew';
  if (lower.includes('rust')) return 'Rust';
  if (lower.includes('bacterial spot') || lower.includes('bacterial')) return 'Bacterial Spot';
  if (lower.includes('healthy')) return 'Healthy';

  // Fallback default
  return 'Healthy';
}

export interface SampleLeaf {
  id: string;
  name: string;
  expectedLabel: DiseaseLabel;
  crop: string;
  imageUrl: string;
  description: string;
}

export const SAMPLE_LEAF_IMAGES: SampleLeaf[] = [
  {
    id: 'sample-blight',
    name: 'Leaf Blight Sample',
    expectedLabel: 'Leaf Blight',
    crop: 'Paddy / Tomato',
    imageUrl: 'https://images.unsplash.com/photo-1592417817098-8f3d69106093?auto=format&fit=crop&w=800&q=80',
    description: 'Irregular necrotic lesions spreading across leaf blade with drying margins.',
  },
  {
    id: 'sample-rust',
    name: 'Rust Sample',
    expectedLabel: 'Rust',
    crop: 'Groundnut / Wheat',
    imageUrl: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&w=800&q=80',
    description: 'Reddish-brown pustules rupturing leaf surface with powdery fungal spores.',
  },
  {
    id: 'sample-healthy',
    name: 'Healthy Crop Leaf',
    expectedLabel: 'Healthy',
    crop: 'Paddy Foliage',
    imageUrl: 'https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?auto=format&fit=crop&w=800&q=80',
    description: 'Vibrant green chloroplast development with zero chlorosis or lesions.',
  },
];
