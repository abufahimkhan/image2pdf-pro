export type PageSize = 'A4' | 'A3' | 'A5' | 'Letter' | 'Legal' | 'Original';
export type Orientation = 'Portrait' | 'Landscape' | 'Auto';
export type MarginType = 'None' | 'Small' | 'Medium' | 'Large' | 'Custom';
export type ImageScaling = 'Fit' | 'Fill' | 'Stretch' | 'Original';
export type CompressionType = 'High' | 'Balanced' | 'Small';

export interface CustomMargin {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

export interface WatermarkConfig {
  enabled: boolean;
  text: string;
  color: string; // hex
  opacity: number; // 0 to 1
  fontSize: number;
  rotation: number; // degrees
}

export interface PDFSettings {
  pageSize: PageSize;
  orientation: Orientation;
  marginType: MarginType;
  customMargin: CustomMargin;
  scaling: ImageScaling;
  compression: CompressionType;
  watermark: WatermarkConfig;
}

export interface ImageFile {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  resolution: string; // e.g. "1920 x 1080"
  width: number;
  height: number;
  previewUrl: string;
  order: number;
}

export interface RecentConversion {
  id: string;
  filename: string;
  timestamp: string; // ISO String
  size: number;
  pageCount: number;
  downloadUrl: string;
}

export interface ConversionProgress {
  status: 'idle' | 'preparing' | 'compressing' | 'compiling' | 'saving' | 'complete' | 'cancelled' | 'error';
  currentStep: number;
  totalSteps: number;
  message: string;
  percentage: number;
}
