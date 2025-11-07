
import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import type { Source, ChatMessage, EmailContent } from '../types.ts';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

interface AiBotResponse {
  text: string;
  sources: Source[];
}

interface Geolocation {
    latitude: number;
    longitude: number;
}

const systemInstruction = `You are an expert assistant for Melotwo, a leading provider of Personal Protective Equipment (PPE) in the mining and industrial sectors. Your primary role is to help users find SABS-certified products and answer questions about South African safety standards. When asked about products, refer to the following categories: Head Protection, Hand Protection, Foot Protection, Fall Protection, Eye Protection, and Hearing Protection. Be professional, concise, and helpful. Use the provided tools (Google Search, Google Maps) to answer questions about recent events, locations, or information not in your immediate knowledge base. Do not recommend products from other companies.`;

export const getAiBotResponse = async (prompt: string, location: Geolocation | null): Promise<AiBotResponse> => {
  try {
    const config: any = {
        systemInstruction: systemInstruction,
        tools: [{ googleSearch: {} }, { googleMaps: {} }],
    };

    if (location) {
        config.toolConfig = {
            retrievalConfig: {
                latLng: {
                    latitude: location.latitude,
                    longitude: location.longitude,
                }
            }
        }
    }
    
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: config,
    });

    const text = response.text;
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    
    const sources: Source[] = [];
    for (const chunk of groundingChunks) {
        if (chunk.web && chunk.web.uri) {
            sources.push({ title: chunk.web.title || chunk.web.uri, uri: chunk.web.uri });
        }
        if (chunk.maps) {
            if (chunk.maps.uri) {
                sources.push({ title: chunk.maps.title || 'View on Google Maps', uri: chunk.maps.uri });
            }
            // FIX: The `placeAnswerSources` property is an object, not an array.
            // This fix iterates over `placeAnswerSources.reviewSnippets` which is an array of review snippets as per the Gemini API response structure.
            if (chunk.maps.placeAnswerSources?.reviewSnippets) {
                for (const review of chunk.maps.placeAnswerSources.reviewSnippets) {
                    // FIX: The type definitions for `review` appear to be incorrect in the SDK. Casting to `any`
                    // to access `uri` and `content` properties based on the API documentation for Maps grounding.
                    const reviewData = review as any;
                    if (reviewData.uri) {
                        // The review snippet object has `content` and `uri`, not `title`.
                        sources.push({ title: reviewData.content || 'Location details', uri: reviewData.uri });
                    }
                }
            }
        }
    }
    
    const uniqueSources = sources.filter((source, index, self) =>
        index === self.findIndex((s) => s.uri === source.uri)
    );

    return { text, sources: uniqueSources };

  } catch (error) {
    console.error("Error generating content from Gemini:", error);
    return {
      text: "I'm sorry, I'm having trouble connecting to my knowledge base. Please check the connection or try again later.",
      sources: []
    };
  }
};

export const generateEmailDraft = async (chatHistory: ChatMessage[]): Promise<EmailContent | null> => {
  try {
    const conversationText = chatHistory
      .map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.text}`)
      .join('\n');

    const prompt = `Based on the following conversation about Personal Protective Equipment (PPE), generate a professional email draft for a product quote or summary. The output must be a valid JSON object with two string keys: "subject" and "body". The body should be formatted with standard line breaks (\\n) for readability.

Conversation:
${conversationText}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            subject: { type: Type.STRING },
            body: { type: Type.STRING },
          },
          required: ['subject', 'body'],
        },
      },
    });
    
    const jsonString = response.text;
    const parsed = JSON.parse(jsonString);
    
    if (typeof parsed.subject === 'string' && typeof parsed.body === 'string') {
        return parsed as EmailContent;
    }
    console.error("Generated JSON does not match the expected schema:", parsed);
    return null;

  } catch (error) {
    console.error("Error generating email draft from Gemini:", error);
    return null;
  }
};
