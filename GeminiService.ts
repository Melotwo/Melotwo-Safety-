import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { SafetyInspectionResult } from '../types';

const PROBABILITY_MAP: Record<string, { score: number; label: string; color: string }> = {
  NEGLIGIBLE: { score: 1.2, label: 'Negligible', color: 'text-green-500 bg-green-100 border-green-500' },
  LOW: { score: 3.5, label: 'Low Risk', color: 'text-yellow-500 bg-yellow-100 border-yellow-500' },
  MEDIUM: { score: 6.5, label: 'Medium Risk', color: 'text-orange-500 bg-orange-100 border-orange-500' },
  HIGH: { score: 9.5, label: 'High Risk', color: 'text-red-500 bg-red-100 border-red-500' },
  UNKNOWN: { score: 0.0, label: 'Unknown', color: 'text-gray-500 bg-gray-100 border-gray-500' },
};

const PROBABILITY_ORDER = ['UNKNOWN', 'NEGLIGIBLE', 'LOW', 'MEDIUM', 'HIGH'];

export const runSafetyInspector = async (scenario: string, systemInstruction: string): Promise<SafetyInspectionResult> => {
    if (!process.env.API_KEY) {
        throw new Error("API_KEY environment variable not set. Please ensure it is configured in your environment.");
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [{ parts: [{ text: scenario }] }],
            config: {
                systemInstruction: systemInstruction,
            },
        });
        
        const feedback = response.promptFeedback;

        if (feedback?.blockReason) {
            return {
                text: `[**Safety Inspector Blocked**] Policy violation detected. Reason: ${feedback.blockReason}. The LLM output has been suppressed.`,
                score: '9.9',
                label: 'Blocked',
                color: 'text-red-600 bg-red-100 border-red-600',
            };
        }

        const safetyRatings = feedback?.safetyRatings || [];
        let highestRisk = PROBABILITY_MAP.NEGLIGIBLE;
        let highestRiskLevel = PROBABILITY_ORDER.indexOf('NEGLIGIBLE');

        safetyRatings.forEach(rating => {
            const currentLevel = PROBABILITY_ORDER.indexOf(rating.probability);
            if (currentLevel > highestRiskLevel) {
                highestRiskLevel = currentLevel;
                highestRisk = PROBABILITY_MAP[rating.probability] || PROBABILITY_MAP.UNKNOWN;
            }
        });
        
        // Ensure there is content before accessing text
        if (!response.candidates || response.candidates.length === 0) {
            // If text is present directly on response (fallback), use it, otherwise error
            if (response.text) {
                 return {
                    text: response.text,
                    score: highestRisk.score.toFixed(1),
                    label: highestRisk.label,
                    color: highestRisk.color,
                };
            }
            throw new Error("The model returned no content. It may have been filtered completely.");
        }

        return {
            text: response.text || "No text output generated.",
            score: highestRisk.score.toFixed(1),
            label: highestRisk.label,
            color: highestRisk.color,
        };

    } catch (error: any) {
        console.error("Error calling Gemini API:", error);
        
        let errorMessage = "An unexpected error occurred while communicating with the AI service.";

        if (error instanceof Error) {
             errorMessage = error.message;
        } else if (typeof error === 'string') {
             errorMessage = error;
        }

        const msgLower = errorMessage.toLowerCase();
        
        // Provide more helpful user-facing errors based on common failure modes
        if (msgLower.includes('api key') || msgLower.includes('403')) {
             throw new Error("Authentication Failed: Invalid API Key or access denied. Please check your configuration.");
        }
        if (msgLower.includes('429') || msgLower.includes('quota') || msgLower.includes('exhausted')) {
             throw new Error("Usage Limit Exceeded: The API quota has been reached. Please try again later.");
        }
        if (msgLower.includes('503') || msgLower.includes('overloaded')) {
             throw new Error("Service Unavailable: The AI model is currently overloaded. Please try again in a moment.");
        }
        if (msgLower.includes('fetch failed') || msgLower.includes('network') || msgLower.includes('failed to fetch')) {
             throw new Error("Connection Error: Unable to reach Google AI servers. Please check your internet connection.");
        }

        throw new Error(errorMessage);
    }
};
