import { GoogleGenAI } from "@google/genai";
import { SketchOptions } from "../types";

const createPrompt = (options: SketchOptions): string => {
  let styleDescription = "";
  switch (options.style) {
    case 'charcoal':
      styleDescription = "a deep, smudged charcoal sketch with high contrast and rough texture";
      break;
    case 'minimalist':
      styleDescription = "a clean, minimalist pencil line art with very little shading, focusing on contours";
      break;
    case 'colored':
      styleDescription = "a soft pencil sketch with gentle pastel colored pencil highlights";
      break;
    case 'classic':
    default:
      styleDescription = "a highly detailed, realistic graphite pencil sketch with smooth shading and hatching";
      break;
  }

  let intensityDescription = "";
  switch (options.intensity) {
    case 'light':
      intensityDescription = "light, airy strokes";
      break;
    case 'heavy':
      intensityDescription = "heavy, bold strokes with dark shadows";
      break;
    case 'medium':
    default:
      intensityDescription = "balanced shading and line weight";
      break;
  }

  return `Transform this image into ${styleDescription}. Use ${intensityDescription}. Keep the composition exactly the same as the original. The background should look like white sketch paper. Output ONLY the image.`;
};

export const generateSketch = async (
  base64Image: string,
  mimeType: string,
  options: SketchOptions
): Promise<string> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing. Please check your environment variables.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // Clean base64 string if it contains the header
  const cleanBase64 = base64Image.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '');

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: cleanBase64,
            },
          },
          {
            text: createPrompt(options),
          },
        ],
      },
    });

    let generatedImageUrl = '';

    // Iterate through parts to find the image
    if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData && part.inlineData.data) {
                generatedImageUrl = `data:image/png;base64,${part.inlineData.data}`;
                break;
            }
        }
    }

    if (!generatedImageUrl) {
        throw new Error("No image was generated. The model might have returned text instead.");
    }

    return generatedImageUrl;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};