export enum LoadingState {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}

export interface GeneratedImage {
  imageUrl: string;
  prompt: string;
  timestamp: number;
}

export interface SketchOptions {
  style: 'classic' | 'charcoal' | 'minimalist' | 'colored';
  intensity: 'light' | 'medium' | 'heavy';
}