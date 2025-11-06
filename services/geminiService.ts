import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import type { Source } from '../types';

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
            if (chunk.maps.placeAnswerSources) {
                for (const place of chunk.maps.placeAnswerSources) {
                    if (place.uri) {
                        sources.push({ title: place.title || 'Location details', uri: place.uri });
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