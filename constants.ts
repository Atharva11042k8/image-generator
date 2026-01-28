import { AspectRatio, ModelType } from './types';

export const DEFAULT_ASPECT_RATIO = AspectRatio.SQUARE;
export const DEFAULT_MODEL = ModelType.FLASH;

export const ASPECT_RATIO_OPTIONS = [
  { label: "Square (1:1)", value: AspectRatio.SQUARE },
  { label: "Portrait (3:4)", value: AspectRatio.PORTRAIT },
  { label: "Landscape (4:3)", value: AspectRatio.LANDSCAPE },
  { label: "Wide (16:9)", value: AspectRatio.WIDE },
  { label: "Tall (9:16)", value: AspectRatio.TALL },
];

export const MODEL_OPTIONS = [
  { 
    label: "Flash (Fast)", 
    value: ModelType.FLASH, 
    description: "Generates images quickly. Good for iterations." 
  },
  { 
    label: "Pro (High Quality)", 
    value: ModelType.PRO, 
    description: "Higher detail and better adherence to prompts. Requires paid API key." 
  },
];
