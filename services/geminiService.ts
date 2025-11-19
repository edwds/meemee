
import { GoogleGenAI } from "@google/genai";
import { Preference, ReviewStyle, TasteProfile, KEYWORD_DATA } from '../types';

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

export const analyzeMenuFromImages = async (base64Images: string[]): Promise<string> => {
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

    const prompt = `
      Look at these food photos.
      Identify the most likely menu names.
      Return ONLY the menu names separated by commas (e.g. "Truffle Pasta, Steak, Lemonade").
      If you are unsure, give your best guess.
      Respond in Korean.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [...imageParts, { text: prompt }]
      }
    });

    return response.text?.trim() || "";
  } catch (error) {
    console.error("Menu analysis error:", error);
    return "";
  }
};

export const recommendKeywords = async (menu: string): Promise<string[]> => {
  try {
    const ai = getClient();
    const allKeywords = [
      ...KEYWORD_DATA.Texture,
      ...KEYWORD_DATA.Vibe,
      ...KEYWORD_DATA.Overall
    ];

    const prompt = `
      Given the menu "${menu}", select the 3-5 most relevant keywords from this list:
      [${allKeywords.join(', ')}]
      
      Return ONLY the selected keywords separated by commas.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt
    });

    const text = response.text || "";
    return text.split(',').map(s => s.trim()).filter(s => allKeywords.includes(s));
  } catch (error) {
    console.error("Keyword recommendation error:", error);
    return [];
  }
}
