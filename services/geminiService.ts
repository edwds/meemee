
import { GoogleGenAI } from "@google/genai";
import { KEYWORD_DATA, ReviewRecord } from '../types';

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("API Key is missing!");
  }
  return new GoogleGenAI({ apiKey: apiKey || 'dummy_key' });
};

export interface AnalyzedContext {
  placeName?: string;
  menu?: string;
  category?: string;
  keywords?: string[];
  area?: string;
}

export const analyzeImageContext = async (base64Images: string[]): Promise<AnalyzedContext> => {
  try {
    const ai = getClient();
    
    // Prepare images for Gemini
    const imageParts = base64Images.map(img => {
      const [header, data] = img.split(',');
      const mimeType = header.match(/:(.*?);/)?.[1] || 'image/jpeg';
      return {
        inlineData: {
          mimeType,
          data
        }
      };
    });

    const allKeywords = [
      ...KEYWORD_DATA.Texture,
      ...KEYWORD_DATA.Vibe,
      ...KEYWORD_DATA.Overall
    ];

    const prompt = `
      Analyze these food photos to extract information for a gourmet log.
      
      1. **Place Name**: 
         - FIRST, look for text on menus, napkins, or signage to find the *real* name.
         - **IF NO NAME IS VISIBLE**: Creatively invent a **realistic, trendy, and catchy restaurant name** in Korean that perfectly matches the food and vibe.
         - Examples of creative generation: '성수동 파스타 클럽', '스시 오마카세 젠', '카페 멜로우', '청담 숯불갈비'.
      
      2. **Category**: Identify the cuisine category (e.g., "Korean", "Japanese", "Cafe", "Bar", "Fine Dining").
      
      3. **Menu**: Identify the main dishes shown.

      4. **Area**: Infer the district or neighborhood name (e.g., '성수동', '강남구', '이태원', '홍대') from receipt addresses or general vibe. If unknown, assume a popular food district in Seoul.
      
      5. **Keywords**: Select 3-5 most relevant keywords from this list: [${allKeywords.join(', ')}].

      **IMPORTANT**: ALL OUTPUT VALUES MUST BE IN KOREAN (Hangul).
      
      Output strictly in JSON format:
      {
        "placeName": "...",
        "category": "...", 
        "menu": "...",
        "area": "...",
        "keywords": ["...", "..."]
      }
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [...imageParts, { text: prompt }]
      },
      config: {
        responseMimeType: 'application/json'
      }
    });

    const text = response.text;
    if (!text) return {};

    try {
      return JSON.parse(text) as AnalyzedContext;
    } catch (e) {
      console.warn("Failed to parse JSON from Gemini", text);
      // Fallback if JSON parsing fails
      return { menu: text.slice(0, 50) };
    }
  } catch (error) {
    console.error("Context analysis error:", error);
    return {};
  }
};

export const analyzeUserTaste = async (records: ReviewRecord[]): Promise<string> => {
  // Deprecated in favor of local MBTI calculation, keeping for fallback if needed
  return "미식 데이터 분석 중...";
};
