import { FAQ } from "../types";

// 25/09/2026: every model call goes through the Worker (/api/ai/*), which holds
// the OpenRouter key server-side. The browser used to call Google directly with
// an API key compiled into the bundle (process.env.API_KEY).

// Utility to convert file to base64 (without the data: prefix)
const fileToBase64 = (file: File) => new Promise<string>((resolve, reject) => {
  const reader = new FileReader();
  reader.onloadend = () => {
    if (typeof reader.result === 'string') resolve(reader.result.split(',')[1]);
    else reject(new Error('Could not read image'));
  };
  reader.onerror = () => reject(new Error('Could not read image'));
  reader.readAsDataURL(file);
});

export const generateDescriptionForImage = async (imageFile: File, apiToken: string | null): Promise<string> => {
  if (!apiToken) return "Error: Not authenticated.";
  try {
    const res = await fetch('/api/ai/describe-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiToken}` },
      body: JSON.stringify({ image_base64: await fileToBase64(imageFile), mime_type: imageFile.type }),
    });
    const data = await res.json().catch(() => ({})) as { description?: string; error?: string };
    if (!res.ok || !data.description) throw new Error(data.error || `HTTP ${res.status}`);
    return data.description;
  } catch (error) {
    console.error("Error generating description:", error);
    return "Error: Could not generate description.";
  }
};

export const getChatbotResponse = async (question: string, faqs: FAQ[]): Promise<string> => {
  if (!question.trim()) return "Please ask a question.";
  try {
    const res = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, faqs }),
    });
    const data = await res.json().catch(() => ({})) as { answer?: string; error?: string };
    if (!res.ok || !data.answer) throw new Error(data.error || `HTTP ${res.status}`);
    return data.answer;
  } catch (error) {
    console.error("Error getting chatbot response:", error);
    return "Error: Could not get a response.";
  }
};
