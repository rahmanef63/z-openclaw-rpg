import type { FurnitureAsset } from '@/stores/buildStore';
import type { LifeAspect } from '@/stores/lifeStore';
import type { Asset, AssetCategory } from '@/data/models';

// ===========================================
// Furniture Catalog - 10 Life Aspects
// ===========================================

export const FURNITURE_CATALOG: FurnitureAsset[] = [
  // ========== 1. Personal Development (Pengembangan Pribadi) ==========
  {
    id: 'mirror',
    name: 'Cermin Berdiri',
    nameEn: 'Standing Mirror',
    category: 'personal',
    width: 1,
    height: 2,
    icon: '🪞',
    description: 'Untuk refleksi diri dan perawatan personal',
    interactions: ['reflect', 'groom'],
    defaultBinding: { moduleType: 'habit', alertsEnabled: true },
  },
  {
    id: 'vision-board',
    name: 'Papan Visi',
    nameEn: 'Vision Board',
    category: 'personal',
    width: 2,
    height: 1,
    icon: '🎯',
    description: 'Visualisasi tujuan dan impian',
    interactions: ['view', 'update'],
    defaultBinding: { moduleType: 'goals', alertsEnabled: false },
  },
  {
    id: 'journal-desk',
    name: 'Meja Jurnal',
    nameEn: 'Journal Desk',
    category: 'personal',
    width: 2,
    height: 1,
    icon: '📔',
    description: 'Tempat menulis jurnal dan refleksi harian',
    interactions: ['write', 'read'],
    defaultBinding: { moduleType: 'journal', alertsEnabled: true },
  },

  // ========== 2. Career & Business (Karir & Bisnis) ==========
  {
    id: 'main-desk',
    name: 'Meja Kerja Utama',
    nameEn: 'Main Desk',
    category: 'career',
    width: 3,
    height: 2,
    icon: '🖥️',
    description: 'Pusat produktivitas dan pekerjaan',
    interactions: ['work', 'meet', 'focus'],
    defaultBinding: { moduleType: 'tasks', alertsEnabled: true },
  },
  {
    id: 'whiteboard',
    name: 'Papan Putih',
    nameEn: 'Whiteboard',
    category: 'career',
    width: 2,
    height: 1,
    icon: '📝',
    description: 'Untuk brainstorming dan perencanaan',
    interactions: ['brainstorm', 'plan'],
    defaultBinding: { moduleType: 'projects', alertsEnabled: false },
  },
  {
    id: 'meeting-table',
    name: 'Meja Rapat',
    nameEn: 'Meeting Table',
    category: 'career',
    width: 3,
    height: 2,
    icon: '🪑',
    description: 'Untuk diskusi dan kolaborasi tim',
    interactions: ['meet', 'collaborate'],
    defaultBinding: { moduleType: 'meetings', alertsEnabled: true },
  },

  // ========== 3. Finance (Keuangan) ==========
  {
    id: 'safe',
    name: 'Brankas Mini',
    nameEn: 'Mini Safe',
    category: 'finance',
    width: 1,
    height: 1,
    icon: '🔐',
    description: 'Penyimpanan aman untuk dokumen penting',
    interactions: ['store', 'retrieve'],
    defaultBinding: { moduleType: 'documents', alertsEnabled: true },
  },
  {
    id: 'chart-frame',
    name: 'Bingkai Grafik',
    nameEn: 'Chart Frame',
    category: 'finance',
    width: 2,
    height: 1,
    icon: '📊',
    description: 'Visualisasi data keuangan dan investasi',
    interactions: ['view', 'analyze'],
    defaultBinding: { 
      moduleType: 'finance', 
      thresholds: { warning: 30, critical: 10, positive: 80 },
      alertsEnabled: true 
    },
  },

  // ========== 4. Physical Health (Kesehatan Fisik) ==========
  {
    id: 'kitchen',
    name: 'Dapur Kecil',
    nameEn: 'Small Kitchen',
    category: 'physical',
    width: 2,
    height: 2,
    icon: '🍳',
    description: 'Untuk menyiapkan makanan sehat',
    interactions: ['cook', 'eat', 'prep'],
    defaultBinding: { moduleType: 'nutrition', alertsEnabled: true },
  },
  {
    id: 'exercise-mat',
    name: 'Matras Olahraga',
    nameEn: 'Exercise Mat',
    category: 'physical',
    width: 2,
    height: 1,
    icon: '🧘',
    description: 'Untuk workout dan yoga',
    interactions: ['exercise', 'stretch', 'yoga'],
    defaultBinding: { moduleType: 'fitness', alertsEnabled: true },
  },
  {
    id: 'meditation-cushion',
    name: 'Bantal Meditasi',
    nameEn: 'Meditation Cushion',
    category: 'physical',
    width: 1,
    height: 1,
    icon: '🧘‍♂️',
    description: 'Untuk meditasi dan pernapasan',
    interactions: ['meditate', 'breathe'],
    defaultBinding: { moduleType: 'mindfulness', alertsEnabled: false },
  },

  // ========== 5. Mental Health (Kesehatan Mental) ==========
  {
    id: 'sofa',
    name: 'Sofa Nyaman',
    nameEn: 'Cozy Sofa',
    category: 'mental',
    width: 3,
    height: 1,
    icon: '🛋️',
    description: 'Tempat bersantai dan melepas penat',
    interactions: ['relax', 'rest', 'nap'],
    defaultBinding: { moduleType: 'wellness', alertsEnabled: false },
  },
  {
    id: 'window',
    name: 'Jendela',
    nameEn: 'Window',
    category: 'mental',
    width: 2,
    height: 1,
    icon: '🪟',
    description: 'Untuk melihat pemandangan dan menenangkan pikiran',
    interactions: ['view', 'reflect'],
    defaultBinding: { moduleType: 'environment', alertsEnabled: false },
  },
  {
    id: 'aroma-diffuser',
    name: 'Diffuser Aromaterapi',
    nameEn: 'Aroma Diffuser',
    category: 'mental',
    width: 1,
    height: 1,
    icon: '🌸',
    description: 'Untuk relaksasi dengan aromaterapi',
    interactions: ['activate', 'adjust'],
    defaultBinding: { moduleType: 'wellness', alertsEnabled: false },
  },

  // ========== 6. Social (Sosial & Hubungan) ==========
  {
    id: 'coffee-table',
    name: 'Meja Kopi',
    nameEn: 'Coffee Table',
    category: 'social',
    width: 2,
    height: 1,
    icon: '☕',
    description: 'Tempat ngobrol dan bersosialisasi',
    interactions: ['chat', 'serve', 'gather'],
    defaultBinding: { moduleType: 'social', alertsEnabled: true },
  },
  {
    id: 'intercom',
    name: 'Interkom',
    nameEn: 'Intercom',
    category: 'social',
    width: 1,
    height: 1,
    icon: '📞',
    description: 'Untuk komunikasi dengan tamu',
    interactions: ['call', 'answer'],
    defaultBinding: { moduleType: 'communication', alertsEnabled: true },
  },
  {
    id: 'photo-wall',
    name: 'Dinding Foto',
    nameEn: 'Photo Wall',
    category: 'social',
    width: 2,
    height: 2,
    icon: '🖼️',
    description: 'Koleksi kenangan dengan orang tersayang',
    interactions: ['view', 'add'],
    defaultBinding: { moduleType: 'memories', alertsEnabled: false },
  },

  // ========== 7. Spiritual (Spiritual) ==========
  {
    id: 'prayer-mat',
    name: 'Sajadah',
    nameEn: 'Prayer Mat',
    category: 'spiritual',
    width: 1,
    height: 2,
    icon: '🕌',
    description: 'Untuk ibadah dan spiritualitas',
    interactions: ['pray', 'reflect'],
    defaultBinding: { moduleType: 'spiritual', alertsEnabled: true },
  },
  {
    id: 'altar',
    name: 'Altar',
    nameEn: 'Altar',
    category: 'spiritual',
    width: 2,
    height: 1,
    icon: '🕯️',
    description: 'Tempat persembahan dan meditasi spiritual',
    interactions: ['meditate', 'offer'],
    defaultBinding: { moduleType: 'spiritual', alertsEnabled: false },
  },

  // ========== 8. Intellectual (Intelektual) ==========
  {
    id: 'bookshelf',
    name: 'Rak Buku',
    nameEn: 'Bookshelf',
    category: 'intellectual',
    width: 2,
    height: 3,
    icon: '📚',
    description: 'Koleksi buku dan pengetahuan',
    interactions: ['read', 'study', 'organize'],
    defaultBinding: { moduleType: 'learning', alertsEnabled: false },
  },
  {
    id: 'study-desk',
    name: 'Meja Belajar',
    nameEn: 'Study Desk',
    category: 'intellectual',
    width: 2,
    height: 1,
    icon: '📖',
    description: 'Untuk belajar dan riset',
    interactions: ['study', 'research', 'write'],
    defaultBinding: { moduleType: 'learning', alertsEnabled: true },
  },

  // ========== 9. Recreation (Rekreasi) ==========
  {
    id: 'tv',
    name: 'Televisi',
    nameEn: 'TV',
    category: 'recreation',
    width: 2,
    height: 1,
    icon: '📺',
    description: 'Untuk hiburan dan relaksasi',
    interactions: ['watch', 'play', 'stream'],
    defaultBinding: { moduleType: 'entertainment', alertsEnabled: false },
  },
  {
    id: 'guitar',
    name: 'Gitar',
    nameEn: 'Guitar',
    category: 'recreation',
    width: 1,
    height: 2,
    icon: '🎸',
    description: 'Untuk bermain musik dan kreativitas',
    interactions: ['play', 'practice', 'perform'],
    defaultBinding: { moduleType: 'hobbies', alertsEnabled: false },
  },
  {
    id: 'canvas',
    name: 'Kanvas Lukis',
    nameEn: 'Canvas',
    category: 'recreation',
    width: 2,
    height: 1,
    icon: '🎨',
    description: 'Untuk melukis dan ekspresi kreatif',
    interactions: ['paint', 'draw', 'display'],
    defaultBinding: { moduleType: 'creativity', alertsEnabled: false },
  },
  {
    id: 'game-console',
    name: 'Konsol Game',
    nameEn: 'Game Console',
    category: 'recreation',
    width: 1,
    height: 1,
    icon: '🎮',
    description: 'Untuk bermain video game',
    interactions: ['play', 'stream'],
    defaultBinding: { moduleType: 'gaming', alertsEnabled: false },
  },

  // ========== 10. Environment (Lingkungan) ==========
  {
    id: 'plant',
    name: 'Tanaman Hias',
    nameEn: 'Decorative Plant',
    category: 'environment',
    width: 1,
    height: 1,
    icon: '🪴',
    description: 'Untuk menyegarkan udara dan dekorasi',
    interactions: ['water', 'prune', 'admire'],
    defaultBinding: { moduleType: 'garden', alertsEnabled: true },
  },
  {
    id: 'smart-bin',
    name: 'Tempat Sampah Pintar',
    nameEn: 'Smart Bin',
    category: 'environment',
    width: 1,
    height: 1,
    icon: '🗑️',
    description: 'Untuk pengelolaan sampah yang bertanggung jawab',
    interactions: ['dispose', 'sort', 'recycle'],
    defaultBinding: { moduleType: 'sustainability', alertsEnabled: false },
  },
  {
    id: 'recycling-station',
    name: 'Stasiun Daur Ulang',
    nameEn: 'Recycling Station',
    category: 'environment',
    width: 2,
    height: 1,
    icon: '♻️',
    description: 'Untuk memilah dan mendaur ulang',
    interactions: ['sort', 'recycle'],
    defaultBinding: { moduleType: 'sustainability', alertsEnabled: true },
  },
];

// Helper to get furniture by ID
export function getFurnitureById(id: string): FurnitureAsset | undefined {
  return FURNITURE_CATALOG.find(f => f.id === id);
}

// Helper to get furniture by category
export function getFurnitureByCategory(category: LifeAspect): FurnitureAsset[] {
  return FURNITURE_CATALOG.filter(f => f.category === category);
}

// Helper to get all categories
export function getFurnitureCategories(): LifeAspect[] {
  return [...new Set(FURNITURE_CATALOG.map(f => f.category))];
}

// Group furniture by category
export function getGroupedFurniture(): Record<LifeAspect, FurnitureAsset[]> {
  const grouped: Partial<Record<LifeAspect, FurnitureAsset[]>> = {};
  
  FURNITURE_CATALOG.forEach(furniture => {
    if (!grouped[furniture.category]) {
      grouped[furniture.category] = [];
    }
    grouped[furniture.category]!.push(furniture);
  });
  
  return grouped as Record<LifeAspect, FurnitureAsset[]>;
}

// ==========================================
// CUSTOM ASSET INTEGRATION
// ==========================================

// Convert an Asset to FurnitureAsset format
export function assetToFurniture(asset: Asset): FurnitureAsset | null {
  // Only convert furniture-type assets
  if (asset.type !== 'furniture' && asset.type !== 'prop') {
    return null;
  }
  
  // Validate category is a valid LifeAspect
  const validCategories: AssetCategory[] = [
    'personal', 'career', 'finance', 'physical', 'mental',
    'social', 'spiritual', 'intellectual', 'recreation', 'environment'
  ];
  
  if (!validCategories.includes(asset.category)) {
    return null;
  }
  
  return {
    id: asset.id,
    name: asset.name,
    nameEn: asset.nameEn,
    category: asset.category as LifeAspect,
    width: asset.width,
    height: asset.height,
    icon: asset.icon,
    description: asset.description,
    interactions: asset.interactions.map(i => i.name.toLowerCase().replace(/\s+/g, '-')),
    defaultBinding: {
      moduleType: asset.category,
      alertsEnabled: true,
    },
  };
}

// Get merged furniture catalog (default + custom assets)
export function getMergedFurnitureCatalog(customAssets: Asset[]): FurnitureAsset[] {
  const customFurniture = customAssets
    .map(assetToFurniture)
    .filter((f): f is FurnitureAsset => f !== null);
  
  return [...FURNITURE_CATALOG, ...customFurniture];
}

// Get grouped furniture including custom assets
export function getGroupedFurnitureWithCustom(customAssets: Asset[]): Record<LifeAspect, FurnitureAsset[]> {
  const mergedCatalog = getMergedFurnitureCatalog(customAssets);
  const grouped: Partial<Record<LifeAspect, FurnitureAsset[]>> = {};
  
  mergedCatalog.forEach(furniture => {
    if (!grouped[furniture.category]) {
      grouped[furniture.category] = [];
    }
    grouped[furniture.category]!.push(furniture);
  });
  
  return grouped as Record<LifeAspect, FurnitureAsset[]>;
}

// Get furniture by ID including custom assets
export function getFurnitureByIdWithCustom(id: string, customAssets: Asset[]): FurnitureAsset | undefined {
  // First check default catalog
  const defaultFurniture = FURNITURE_CATALOG.find(f => f.id === id);
  if (defaultFurniture) return defaultFurniture;
  
  // Then check custom assets
  const customAsset = customAssets.find(a => a.id === id);
  if (customAsset) {
    return assetToFurniture(customAsset) || undefined;
  }
  
  return undefined;
}
