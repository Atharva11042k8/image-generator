import { GoogleGenAI } from "@google/genai";
import { GenerationConfig, ModelType } from "../types";

// Helper to check for AI Studio API Key selection (mostly for Pro/Veo models)
export const checkApiKeySelection = async (): Promise<boolean> => {
  if (window.aistudio && window.aistudio.hasSelectedApiKey) {
    return await window.aistudio.hasSelectedApiKey();
  }
  return true; // Fallback if not running in that specific environment, assume env key works
};

export const promptApiKeySelection = async (): Promise<void> => {
  if (window.aistudio && window.aistudio.openSelectKey) {
    await window.aistudio.openSelectKey();
  } else {
    console.warn("AI Studio key selector not available in this environment.");
  }
};

export const generateImage = async (config: GenerationConfig): Promise<string> => {
  // Always create a new instance to ensure we pick up the latest selected key if changed
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const model = config.model;
  
  // Construct content parts
  const parts: any[] = [];

  // If we have a reference image, this is an edit or image-to-image task
  if (config.referenceImage && config.referenceImageMimeType) {
    parts.push({
      inlineData: {
        data: config.referenceImage,
        mimeType: config.referenceImageMimeType,
      },
    });
  }

  // Add the text prompt
  parts.push({
    text: config.prompt,
  });

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: parts,
      },
      config: {
        imageConfig: {
          aspectRatio: config.aspectRatio,
          // Only Pro model supports imageSize parameter, omitting for simplicity/compatibility
        },
        // Pro model supports google_search tool, but we are keeping it simple for now as requested
      },
    });

    // Parse response for image
    if (response.candidates && response.candidates.length > 0) {
      const content = response.candidates[0].content;
      if (content && content.parts) {
        for (const part of content.parts) {
          if (part.inlineData && part.inlineData.data) {
            const base64Data = part.inlineData.data;
            // The API returns raw base64, we need to prefix it for the browser
            // Defaulting to png as typical output, but the model usually returns jpeg or png.
            // The response doesn't always strictly explicitly state the mimeType in the inlineData payload in older versions,
            // but the new SDK types suggest it might. Let's trust the mimeType if present, else guess.
            const mimeType = part.inlineData.mimeType || "image/png";
            return `data:${mimeType};base64,${base64Data}`;
          }
        }
      }
    }

    throw new Error("No image data found in the response.");

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw new Error(error.message || "Failed to generate image.");
  }
};
