
import { GoogleGenAI, Type } from "@google/genai";
import { PPE_PRODUCTS } from '../constants';

export interface ChecklistGenerationParams {
  industry: string;
  task: string;
  equipment: string[];
  specificDetails: string;
}

export interface ChecklistGenerationResult {
  checklist: string;
  recommendedPpe: string[];
  totalChecklistItems: number;
}

export const generateChecklistFromApi = async ({
  industry,
  task,
  equipment,
  specificDetails,
}: ChecklistGenerationParams): Promise<ChecklistGenerationResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      recommendedPpe: {
        type: Type.ARRAY,
        description: 'A list of generic PPE items required for the task, e.g., "hard hat", "safety glasses".',
        items: { type: Type.STRING },
      },
      checklistMarkdown: {
        type: Type.STRING,
        description: "The full safety checklist formatted in Markdown. It must include logical sections using '## ' for headings and bullet points using '* ' for items. It must also include the mandatory disclaimer at the end.",
      },
    },
    required: ['recommendedPpe', 'checklistMarkdown'],
  };

  const systemInstruction = `You are a certified safety inspector. Your tone is formal, professional, and authoritative. Your entire response must conform to the provided JSON schema. The 'checklistMarkdown' field must contain a comprehensive safety checklist. At the end of the markdown content, you MUST include the following disclaimer, formatted exactly as shown:

---
***Disclaimer:** This checklist is AI-generated and for informational purposes only. It is not a substitute for professional safety advice. Always consult with a qualified safety professional to ensure compliance with local regulations and site-specific conditions.*`;

  const prompt = `
    Generate a safety checklist and a list of recommended Personal Protective Equipment (PPE) for the following scenario:

    - **Industry/Environment:** ${industry}
    - **Specific Task:** ${task}
    - **Tools/Equipment Used:** ${equipment.length > 0 ? equipment.join(', ') : 'Not specified'}
    - **Other Specific Details:** ${specificDetails || 'None'}
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: responseSchema,
    },
  });
  
  const responseObject = JSON.parse(response.text);
  const checklistText: string = responseObject.checklistMarkdown || '';
  const ppeNames: string[] = responseObject.recommendedPpe || [];

  const recommendedPpeIds: string[] = [];
  ppeNames.forEach(ppeName => {
    const lowerPpeName = ppeName.toLowerCase();
    const matchingProduct = PPE_PRODUCTS.find(p => 
      p.keywords.some(k => lowerPpeName.includes(k))
    );
    if (matchingProduct && !recommendedPpeIds.includes(matchingProduct.id)) {
      recommendedPpeIds.push(matchingProduct.id);
    }
  });
  
  const totalChecklistItems = (checklistText.match(/\* /g) || []).length;

  return {
    checklist: checklistText,
    recommendedPpe: recommendedPpeIds,
    totalChecklistItems,
  };
};
