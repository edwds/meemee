
import { GoogleGenAI } from "@google/genai";
import { Preference, ReviewStyle, TasteProfile, KEYWORD_DATA, ReviewRecord } from '../types';

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("API Key is missing!");
  }
  return new GoogleGenAI({ apiKey: apiKey || 'dummy_key' });
};

interface GenerateReviewProps {
  preference: Preference;
  menu: string;
  keywords: string[];
  tasteProfile: TasteProfile;
  style: ReviewStyle;
  title: string;
  visitDate: string;
  companions: string;
}

const formatTasteProfile = (profile: TasteProfile): string => {
  return `
    - Spiciness (매운맛): ${profile.spiciness}/5
    - Sweetness (단맛): ${profile.sweetness}/5
    - Saltiness (짠맛): ${profile.saltiness}/5
    - Acidity (신맛): ${profile.acidity}/5
    - Richness (고소함/풍미/바디감): ${profile.richness}/5
  `;
};

export const generateReviewText = async ({
  preference,
  menu,
  keywords,
  tasteProfile,
  style,
  title,
  visitDate,
  companions
}: GenerateReviewProps): Promise<string> => {
  try {
    const ai = getClient();
    const tasteDescription = formatTasteProfile(tasteProfile);

    const prompt = `
You are a distinguished Gastronomy Critic and Sommelier of Food.
Your task is to write a sophisticated **Tasting Note** (Mishik Report) based on the user's input.

**CRITICAL RULE: NEVER mention the raw numbers (e.g., "Level 5", "3 out of 5").** 
Instead, translate the intensity into professional sensory descriptors.

Input Data:
- Context: ${title} (Date: ${visitDate}, With: ${companions})
- Menu: ${menu}
- Taste Profile (Intensity Data): ${tasteDescription}
- Keywords (Texture/Vibe): ${keywords.join(', ')}
- Style Preference: ${style}

**Guidelines for Tasting Note Generation:**

1.  **Vocabulary**: Use terminology often found in wine or fine dining reviews.
    -   Examples: *Palate, Finish, Body, Acidity, Texture, Balance, Nuance, Layered, Harmony, Kick, Note of...*
    -   Korean Terms: *바디감, 산미, 텍스처, 여운, 밸런스, 풍미, 터치, 마리아주, 뉘앙스*.

2.  **Interpreting the Taste Profile**:
    -   **Spiciness**: 
        -   Low: "A subtle warmth", "A gentle hint of heat".
        -   High: "A sharp, fiery kick", "Dominant spice that lingers".
    -   **Acidity**: 
        -   Low: "Rounded", "Soft".
        -   High: "Bright", "Vibrant acidity", "Citrusy freshness".
    -   **Richness/Body**: 
        -   Low: "Light-bodied", "Clean", "Delicate".
        -   High: "Full-bodied", "Creamy texture", "Deep savory depth (Umami)".
    -   **Sweetness/Saltiness**: Describe balance (e.g., "Well-seasoned", "A sweet undertone").

3.  **Tone & Structure**:
    -   Write a single, cohesive paragraph (3-4 sentences).
    -   Start with the visual or olfactory impression.
    -   Move to the palate (taste & texture analysis).
    -   Finish with the overall impression or aftertaste.
    -   **Language**: Elegant Korean (refined polite tone or noun-ending style suitable for a report).
    -   *Example*: "입안을 감싸는 묵직한 바디감과 은은한 산미의 밸런스가 인상적이다. 쫄깃한 텍스처는 씹을수록 고소한 풍미를 더하며, 끝맛에 남는 매콤한 뉘앙스가 전체적인 느끼함을 깔끔하게 잡아준다."

Generate the text now.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        temperature: 0.65, // Precise and analytical
        topP: 0.85,
      }
    });

    return response.text || "미식 보고서를 작성하는 중 오류가 발생했습니다.";
  } catch (error) {
    console.error("Gemini generation error:", error);
    return "AI 미식 리포트 생성에 실패했습니다. 잠시 후 다시 시도해주세요.";
  }
};

export interface AnalyzedContext {
  placeName?: string;
  menu?: string;
  category?: string;
  keywords?: string[];
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
         - Do NOT use generic terms like "Unknown Restaurant" or "Italian Food". Make it sound like a real hot place.
      
      2. **Category**: Identify the cuisine category (e.g., "Korean", "Japanese", "Cafe", "Bar", "Fine Dining").
      
      3. **Menu**: Identify the main dishes shown.
      
      4. **Keywords**: Select 3-5 most relevant keywords from this list: [${allKeywords.join(', ')}].

      **IMPORTANT**: ALL OUTPUT VALUES MUST BE IN KOREAN (Hangul).
      
      Output strictly in JSON format:
      {
        "placeName": "...",
        "category": "...", 
        "menu": "...",
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
  if (records.length === 0) return "아직 분석할 데이터가 없어요.";

  try {
    const ai = getClient();

    // Calculate Averages
    const total = records.length;
    const sums = records.reduce((acc, r) => ({
      spiciness: acc.spiciness + r.tasteProfile.spiciness,
      sweetness: acc.sweetness + r.tasteProfile.sweetness,
      saltiness: acc.saltiness + r.tasteProfile.saltiness,
      acidity: acc.acidity + r.tasteProfile.acidity,
      richness: acc.richness + r.tasteProfile.richness,
    }), { spiciness: 0, sweetness: 0, saltiness: 0, acidity: 0, richness: 0 });

    const avg = {
      spiciness: (sums.spiciness / total).toFixed(1),
      sweetness: (sums.sweetness / total).toFixed(1),
      saltiness: (sums.saltiness / total).toFixed(1),
      acidity: (sums.acidity / total).toFixed(1),
      richness: (sums.richness / total).toFixed(1),
    };

    // Frequent Categories
    const categories = records.map(r => r.category).filter(Boolean);
    const topCategories = categories.slice(0, 5).join(', ');

    const prompt = `
      Based on the user's gourmet history, create a short, witty, and insightful "One-line Gastronomic Personality" (Taste MBTI).

      **User Data:**
      - Total Records: ${total}
      - Favorite Categories: ${topCategories}
      - Average Taste Profile (1-5): 
        Spicy ${avg.spiciness}, Sweet ${avg.sweetness}, Salty ${avg.saltiness}, Acidic ${avg.acidity}, Rich ${avg.richness}

      **Task:**
      - Define the user's palate personality in **one Korean sentence**.
      - Be fun, specific, and "hip".
      - Examples:
        - "매콤함과 묵직한 바디감을 즐기는 화끈한 미식가"
        - "섬세한 산미와 가벼운 식감을 사랑하는 카페 투어리스트"
        - "극강의 단짠단짠을 찾아 헤매는 자극 추구형"
      
      Output MUST be Korean text only. Max 40 characters.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text?.trim() || "다양한 맛을 즐기는 미식 탐험가";
  } catch (error) {
    console.error("Taste Analysis Error:", error);
    return "나만의 취향을 만들어가는 중...";
  }
};
