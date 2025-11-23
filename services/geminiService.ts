import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { FAQ } from "../types";

// Helper to get AI instance safely
const getAI = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("API_KEY is missing.");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

// Utility to convert file to base64
const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result.split(',')[1]);
      }
    };
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
};

export const generateDescriptionForImage = async (imageFile: File): Promise<string> => {
  try {
    const ai = getAI();
    if (!ai) return "Error: API Key missing.";

    const imagePart = await fileToGenerativePart(imageFile);
    const prompt = `You are a luxury real estate agent writing a listing for a high-end Spanish villa. 
    Write a short, evocative, and appealing description for this photo. 
    Focus on the feeling, materials, lifestyle, and unique details shown. 
    Keep it under 50 words. Do not use bullet points or lists.`;

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [imagePart, {text: prompt}] },
    });
    
    return response.text?.trim() ?? "Description could not be generated.";
  } catch (error) {
    console.error("Error generating description:", error);
    return "Error: Could not generate description.";
  }
};

export const getChatbotResponse = async (question: string, faqs: FAQ[]): Promise<string> => {
  if (!question.trim()) {
    return "Please ask a question.";
  }

  try {
    const ai = getAI();
    if (!ai) return "I'm sorry, I'm not correctly configured right now (Missing API Key).";

     if (!faqs || faqs.length === 0) {
      return "Thank you for your question. We are currently updating our information. Please contact an agent for more details about Villa Luar.";
    }

    const faqString = faqs.map(faq => `Q: ${faq.question}\nA: ${faq.answer}`).join('\n\n');
    
    const prompt = `You are a helpful and friendly chatbot for a luxury villa listing called "Villa Luar". 
    Your goal is to answer potential buyer questions based ONLY on the provided Frequently Asked Questions.
    Do not make up information. 
    If the user's question cannot be answered from the FAQs, politely say you don't have that information and suggest they contact an agent.

    Here are the available FAQs:
    ---
    ${faqString}
    ---

    User's question: "${question}"

    Your answer:`;

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text?.trim() ?? "I am sorry, I am having trouble responding right now.";
  } catch (error) {
    console.error("Error getting chatbot response:", error);
    return "Error: Could not get a response.";
  }
};