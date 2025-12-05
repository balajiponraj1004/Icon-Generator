import { GoogleGenAI } from "@google/genai";
import { IconPack, Category } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION = `
You are a Senior Icon Designer with 15+ years of experience.
Your goal is to generate a complete, consistent, pixel-perfect icon pack based on a user-provided theme.

Design Requirements:
- Style: minimal, modern, clean line icons
- Corner radius: 2px
- Stroke weight: 2px consistent for all icons
- Grid: 48x48 pixel icon grid (Use viewBox="0 0 48 48")
- Geometry: perfect circles, squares, rectangles, and controlled Bézier curves
- Consistency: all icons must follow the same visual language
- No shading, no gradients, no extra details
- Output format: SVG path data (inner elements only)

You must return a valid JSON object.
`;

const cleanJson = (text: string): string => {
  return text.replace(/```json/g, '').replace(/```/g, '').trim();
};

async function generateBatch(theme: string, count: number, batchIndex: number, totalBatches: number): Promise<IconPack> {
  const modelId = "gemini-2.5-flash"; 
  const quantityInstruction = `Generate exactly ${count} distinct icons.`;
  
  // Add context to encourage variety across batches
  const context = totalBatches > 1 
    ? `This is batch ${batchIndex + 1} of ${totalBatches}. Ensure these icons are distinct and cover diverse aspects of the theme.` 
    : '';

  const prompt = `
    Create a detailed icon pack for the theme: "${theme}".
    ${context}
    
    Requirements:
    1. ${quantityInstruction} This is a strict requirement.
    2. Group them into logical categories (e.g., General, Actions, Specific Objects).
    3. For 'svgPath', provide valid SVG XML elements (like <path d="..." />, <circle ... />, <rect ... />) that fit within a 48x48 viewBox. DO NOT include the <svg> wrapper tag.
    4. Ensure strict visual consistency: 2px stroke, unfilled (fill="none"), stroke-linecap="round", stroke-linejoin="round".
    5. Avoid text labels inside the icons.
    6. OPTIMIZATION: Keep descriptions concise to ensure the JSON response fits within the token limit. Focus on the SVG paths.
    
    Response must be a JSON object matching this schema:
    {
      "packName": "String",
      "description": "String",
      "categories": [
        {
          "name": "String",
          "icons": [
            {
              "name": "String",
              "description": "String",
              "svgPath": "String (XML elements)"
            }
          ]
        }
      ]
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        maxOutputTokens: 8192,
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");

    return JSON.parse(cleanJson(text)) as IconPack;
  } catch (error) {
    console.error(`Batch ${batchIndex} generation failed:`, error);
    throw error;
  }
}

export const generateIconPack = async (theme: string, count: number): Promise<IconPack> => {
  // Batching strategy: Break requests into chunks of 25 to avoid token limits and timeouts
  const BATCH_SIZE = 25;
  const batches = [];
  let remaining = count;
  let batchIndex = 0;
  
  // Calculate batches
  while (remaining > 0) {
      const size = Math.min(remaining, BATCH_SIZE);
      batches.push({ index: batchIndex, size });
      remaining -= size;
      batchIndex++;
  }

  try {
    // Execute all batches in parallel
    const results = await Promise.all(
        batches.map(b => generateBatch(theme, b.size, b.index, batches.length))
    );

    if (results.length === 0) throw new Error("No results generated");

    // Merge results
    const masterPack = results[0];
    const categoryMap = new Map<string, Category>();

    results.forEach(pack => {
        pack.categories.forEach(cat => {
            if (!categoryMap.has(cat.name)) {
                // Initialize category if not exists
                categoryMap.set(cat.name, { name: cat.name, icons: [] });
            }
            // Add icons to existing category
            categoryMap.get(cat.name)!.icons.push(...cat.icons);
        });
    });

    return {
        packName: masterPack.packName,
        description: masterPack.description,
        categories: Array.from(categoryMap.values())
    };

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    // Provide a more helpful error message to the UI
    let msg = "Failed to generate icon pack.";
    if (error.message?.includes("429")) msg += " Too many requests. Please try again in a moment.";
    else if (error.message?.includes("503")) msg += " The AI service is temporarily unavailable.";
    else msg += " " + (error.message || "Unknown error occurred.");
    
    throw new Error(msg);
  }
};