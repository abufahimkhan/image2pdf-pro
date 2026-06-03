import { create } from 'zustand';
import { 
  ImageFile, 
  PDFSettings, 
  RecentConversion, 
  ConversionProgress,
  PageSize,
  Orientation,
  MarginType,
  ImageScaling,
  CompressionType,
  CustomMargin
} from './types';

interface AppState {
  // Images
  images: ImageFile[];
  addImages: (files: File[]) => Promise<void>;
  removeImage: (id: string) => void;
  clearImages: () => void;
  reorderImages: (startIndex: number, endIndex: number) => void;
  moveImage: (id: string, direction: 'up' | 'down') => void;

  // Settings
  settings: PDFSettings;
  updateSettings: (settings: Partial<PDFSettings>) => void;
  updateCustomMargin: (margin: Partial<CustomMargin>) => void;

  // Status and Progress
  progress: ConversionProgress;
  setProgress: (progress: Partial<ConversionProgress>) => void;
  resetProgress: () => void;

  // Theme
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;

  // History
  recentConversions: RecentConversion[];
  addRecentConversion: (conversion: Omit<RecentConversion, 'id' | 'timestamp'>) => void;
  clearRecentConversions: () => void;

  // Current PDF Download Url
  lastGeneratedPdfUrl: string | null;
  setLastGeneratedPdfUrl: (url: string | null) => void;
}

const defaultSettings: PDFSettings = {
  pageSize: 'A4',
  orientation: 'Auto',
  marginType: 'None',
  customMargin: { top: 20, bottom: 20, left: 20, right: 20 },
  scaling: 'Fit',
  compression: 'Balanced',
  watermark: {
    enabled: false,
    text: 'Image2PDF Pro',
    color: '#CBD5E1',
    opacity: 0.4,
    fontSize: 24,
    rotation: -45,
  },
};

const getInitialTheme = (): 'light' | 'dark' | 'system' => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('image2pdf-theme') as 'light' | 'dark' | 'system' | null;
    return saved || 'system';
  }
  return 'system';
};

const getInitialRecent = (): RecentConversion[] => {
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem('image2pdf-recent');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  }
  return [];
};

export const usePDFStore = create<AppState>((set, get) => ({
  images: [],
  settings: defaultSettings,
  progress: {
    status: 'idle',
    currentStep: 0,
    totalSteps: 0,
    message: '',
    percentage: 0,
  },
  theme: getInitialTheme(),
  recentConversions: getInitialRecent(),
  lastGeneratedPdfUrl: null,

  addImages: async (files) => {
    // Helper to get image dimensions
    const getImageDimensions = (file: File): Promise<{ width: number; height: number }> => {
      return new Promise((resolve) => {
        const url = URL.createObjectURL(file);
        const img = new Image();
        img.onload = () => {
          resolve({ width: img.naturalWidth, height: img.naturalHeight });
          URL.revokeObjectURL(url);
        };
        img.onerror = () => {
          resolve({ width: 0, height: 0 }); // fallback
          URL.revokeObjectURL(url);
        };
        img.src = url;
      });
    };

    const currentImages = get().images;
    const startOrder = currentImages.length;

    const newImagePromises = files.map(async (file, idx) => {
      const { width, height } = await getImageDimensions(file);
      const resolution = width > 0 ? `${width} x ${height} px` : 'Unknown resolution';
      const previewUrl = URL.createObjectURL(file);

      const imageItem: ImageFile = {
        id: crypto.randomUUID(),
        file,
        name: file.name,
        size: file.size,
        type: file.type,
        resolution,
        width,
        height,
        previewUrl,
        order: startOrder + idx,
      };
      return imageItem;
    });

    const addedImages = await Promise.all(newImagePromises);
    const updatedImages = [...currentImages, ...addedImages].sort((a, b) => a.order - b.order);
    
    // Normalize orders
    updatedImages.forEach((img, index) => {
      img.order = index;
    });

    set({ images: updatedImages });
  },

  removeImage: (id) => {
    const currentImages = get().images;
    const imageToRemove = currentImages.find(img => img.id === id);
    if (imageToRemove) {
      URL.revokeObjectURL(imageToRemove.previewUrl);
    }
    const filtered = currentImages
      .filter((img) => img.id !== id)
      .map((img, idx) => ({ ...img, order: idx }));
    set({ images: filtered });
  },

  clearImages: () => {
    get().images.forEach((img) => URL.revokeObjectURL(img.previewUrl));
    set({ images: [] });
  },

  reorderImages: (startIndex, endIndex) => {
    const currentImages = [...get().images];
    const [removed] = currentImages.splice(startIndex, 1);
    currentImages.splice(endIndex, 0, removed);
    
    const reordered = currentImages.map((img, idx) => ({
      ...img,
      order: idx,
    }));
    set({ images: reordered });
  },

  moveImage: (id, direction) => {
    const currentImages = [...get().images];
    const index = currentImages.findIndex((img) => img.id === id);
    if (index === -1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= currentImages.length) return;

    const [item] = currentImages.splice(index, 1);
    currentImages.splice(targetIndex, 0, item);

    const reordered = currentImages.map((img, idx) => ({
      ...img,
      order: idx,
    }));
    set({ images: reordered });
  },

  updateSettings: (newSettings) => {
    set((state) => ({
      settings: { ...state.settings, ...newSettings },
    }));
  },

  updateCustomMargin: (newMargin) => {
    set((state) => ({
      settings: {
        ...state.settings,
        customMargin: { ...state.settings.customMargin, ...newMargin },
      },
    }));
  },

  setProgress: (newProgress) => {
    set((state) => ({
      progress: { ...state.progress, ...newProgress },
    }));
  },

  resetProgress: () => {
    set({
      progress: {
        status: 'idle',
        currentStep: 0,
        totalSteps: 0,
        message: '',
        percentage: 0,
      },
    });
  },

  setTheme: (theme) => {
    localStorage.setItem('image2pdf-theme', theme);
    set({ theme });
  },

  addRecentConversion: (conversion) => {
    const item: RecentConversion = {
      ...conversion,
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
    };
    const updated = [item, ...get().recentConversions].slice(0, 20); // Hold last 20 conversions
    localStorage.setItem('image2pdf-recent', JSON.stringify(updated));
    set({ recentConversions: updated });
  },

  clearRecentConversions: () => {
    localStorage.removeItem('image2pdf-recent');
    set({ recentConversions: [] });
  },

  setLastGeneratedPdfUrl: (url) => set({ lastGeneratedPdfUrl: url }),
}));
