import { GoogleGenAI } from "@google/genai";
import { IconPack, Category, IconData } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION = `
You are a Senior Icon Designer.
Your goal is to generate consistent, pixel-perfect SVG icon paths.

Design Requirements:
- Style: minimal, modern line icons (2px stroke)
- Grid: 48x48 pixel
- Output: Valid SVG XML elements (path, circle, rect) only. 
- Do NOT include <svg> tag.
- Do NOT include markdown formatting.
`;

const cleanJson = (text: string): string => {
  let clean = text.replace(/```json/g, '').replace(/```/g, '').trim();
  // Sometimes the model adds text before or after the JSON
  const firstBracket = clean.indexOf('[');
  const lastBracket = clean.lastIndexOf(']');
  if (firstBracket !== -1 && lastBracket !== -1) {
    clean = clean.substring(firstBracket, lastBracket + 1);
  }
  return clean;
};

// Define a simpler interface for the AI response to save tokens
interface RawIcon {
  n: string; // name
  d: string; // description
  p: string; // path
}

async function generateBatch(theme: string, count: number): Promise<IconData[]> {
  const modelId = "gemini-2.5-flash"; 
  
  // Very concise prompt to save tokens and avoid complexity
  const prompt = `
    Theme: "${theme}". 
    Generate ${count} distinct icons.
    Return a JSON Array of objects.
    Keys: "n" (name), "d" (short desc), "p" (SVG inner XML strings like <path d='...'/>).
    Example: [{"n":"Home","d":"House icon","p":"<path d='...'/>"}]
    Ensure paths are for 48x48 viewbox. 2px stroke.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        maxOutputTokens: 8192, // Increased for safety
      },
    });

    const text = response.text;
    if (!text) {
        console.warn("Empty response from Gemini.");
        throw new Error("Empty response");
    }

    const rawData = JSON.parse(cleanJson(text)) as RawIcon[];
    
    // Map back to our app's structure
    return rawData.map(item => ({
        name: item.n,
        description: item.d,
        svgPath: item.p
    }));
  } catch (e) {
    console.error("Batch generation failed", e);
    throw e;
  }
}

// Helper for delays
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const generateIconPack = async (
    theme: string, 
    count: number,
    onProgress?: (current: number, total: number) => void
): Promise<IconPack> => {
  
  // STRATEGY: Small batches, serialized queue with rate limiting.
  // This is slower but extremely robust against 429s and Timeouts.
  const BATCH_SIZE = 4; 
  const CONCURRENCY = 2; // Only 2 requests at a time
  
  const totalBatches = Math.ceil(count / BATCH_SIZE);
  let completedIcons = 0;
  const allIcons: IconData[] = [];

  // Create an array of tasks (batches)
  const tasks = Array.from({ length: totalBatches }, (_, i) => {
    const isLast = i === totalBatches - 1;
    const batchCount = isLast ? count - (i * BATCH_SIZE) : BATCH_SIZE;
    return { index: i, count: batchCount };
  });

  // Process tasks with controlled concurrency
  for (let i = 0; i < tasks.length; i += CONCURRENCY) {
    const chunk = tasks.slice(i, i + CONCURRENCY);
    
    const chunkResults = await Promise.all(
        chunk.map(async (task) => {
            // Retry logic per batch
            let retries = 3;
            while (retries > 0) {
                try {
                    const icons = await generateBatch(theme, task.count);
                    return icons;
                } catch (err) {
                    retries--;
                    if (retries === 0) return []; // Return empty on final failure
                    await delay(2000); // Wait 2s before retry
                }
            }
            return [];
        })
    );

    // Collect results
    chunkResults.forEach(icons => {
        allIcons.push(...icons);
        completedIcons += icons.length;
    });

    if (onProgress) {
        onProgress(completedIcons, count);
    }

    // Rate limiting delay between chunks
    if (i + CONCURRENCY < tasks.length) {
        await delay(1000); 
    }
  }

  if (allIcons.length === 0) {
      throw new Error("Failed to generate any icons. Please try again.");
  }

  // Group into a single "General" category since we flattened the generation
  // We can simulate categories later if needed, but stability is priority now.
  const categories: Category[] = [{
      name: "General",
      icons: allIcons
  }];

  return {
    packName: `${theme} Icons`,
    description: `A collection of ${allIcons.length} custom icons for ${theme}.`,
    categories
  };
};