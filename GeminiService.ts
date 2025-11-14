import { GoogleGenAI } from "@google/genai";
import { PPE_PRODUCTS } from '../constants.ts';

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
  // Adhere to API key guidelines by using process.env.API_KEY directly.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const systemInstruction = `Act as a certified safety inspector. Your tone must be formal, professional, and authoritative. All responses must be structured as comprehensive safety checklists. At the end of every generated checklist, you MUST include the following disclaimer, formatted exactly as shown below:

---
***Disclaimer:** This checklist is AI-generated and for informational purposes only. It is not a substitute for professional safety advice. Always consult with a qualified safety professional to ensure compliance with local regulations and site-specific conditions.*`;

  const prompt = `
    Create a comprehensive safety checklist for the following scenario. The output must be in markdown format.

    **Scenario Details:**
    - **Industry/Environment:** ${industry}
    - **Specific Task:** ${task}
    - **Tools/Equipment Used:** ${equipment.length > 0 ? equipment.join(', ') : 'Not specified'}
    - **Other Specific Details:** ${specificDetails || 'None'}

    The checklist should be broken down into logical sections using '##' for headings (e.g., ## Pre-Task Setup, ## During the Task, ## Post-Task Cleanup). Each item in the checklist should start with '* '.

    Based on the scenario, identify the top 4 most critical Personal Protective Equipment (PPE) items required. After generating the checklist, list the corresponding PPE product IDs from the following list in a separate section formatted EXACTLY as follows:

    ---
    **Recommended PPE IDs:** [ppe_id_1, ppe_id_2, ppe_id_3, ppe_id_4]
    ---

    Available PPE IDs:
    ${PPE_PRODUCTS.map(p => `- ${p.id}: ${p.name} (${p.keywords.join(', ')})`).join('\n')}
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      systemInstruction: systemInstruction,
      temperature: 0.3,
    },
  });

  const resultText = response.text;
  
  const ppeMatch = resultText.match(/\*\*Recommended PPE IDs:\*\*.*\[(.*)\]/);
  let ppeIds: string[] = [];
  if (ppeMatch && ppeMatch[1]) {
    ppeIds = ppeMatch[1].split(',').map(id => id.trim());
  }
  
  const checklistContent = resultText.split('---')[0].trim();
  const items = checklistContent.match(/^\s*\*\s/gm) || [];
  const totalItems = items.length;

  return {
    checklist: checklistContent,
    recommendedPpe: ppeIds,
    totalChecklistItems: totalItems,
  };
