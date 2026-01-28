export enum AspectRatio {
  SQUARE = "1:1",
  PORTRAIT = "3:4",
  LANDSCAPE = "4:3",
  WIDE = "16:9",
  TALL = "9:16",
}

export enum ModelType {
  FLASH = "gemini-2.5-flash-image",
  PRO = "gemini-3-pro-image-preview",
}

export interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  model: ModelType;
  timestamp: number;
  aspectRatio?: AspectRatio;
}

export interface GenerationConfig {
  prompt: string;
  aspectRatio: AspectRatio;
  model: ModelType;
  referenceImage?: string; // Base64
  referenceImageMimeType?: string;
}
