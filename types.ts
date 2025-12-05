export interface IconData {
  name: string;
  description: string;
  svgPath: string; // Inner SVG content (paths, rects, circles)
}

export interface Category {
  name: string;
  icons: IconData[];
}

export interface IconPack {
  packName: string;
  description: string;
  categories: Category[];
}

export interface GenerationStatus {
  status: 'idle' | 'generating' | 'success' | 'error';
  message?: string;
}