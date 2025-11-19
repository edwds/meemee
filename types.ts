
export enum Preference {
  GOOD = '좋아요',
  NORMAL = '보통',
  BAD = '별로'
}

export enum ReviewStyle {
  EMOTIONAL = '감성적',
  BASIC = '기본형',
  DETAILED = '디테일형'
}

// Taste removed from here as it has its own dedicated UI
export type KeywordCategory = 'Texture' | 'Vibe' | 'Overall';

export interface TasteProfile {
  spiciness: number; // 1-5
  sweetness: number;
  saltiness: number;
  acidity: number;
  richness: number;
}

export interface ReviewRecord {
  id: string;
  title: string; // Restaurant Name
  photos: string[]; // Base64 strings
  representativePhoto: string;
  preference: Preference;
  menu: string;
  visitDate: string; // YYYY-MM-DD
  companions: string; // Who you went with
  tasteProfile: TasteProfile;
  keywords: string[];
  aiGeneratedText: string;
  createdAt: number; // Timestamp
  rank?: number; // Optional ranking for 'GOOD' preference records
}

export const KEYWORD_DATA: Record<KeywordCategory, string[]> = {
  Texture: ['부드러운', '쫄깃한', '촉촉한', '바삭한', '묵직한', '가벼운'],
  Vibe: ['조용한', '캐주얼', '데이트용', '혼밥 적합', '활기찬', '감성적'],
  Overall: ['만족스러움', '가격 대비 좋음', '서비스 친절', '재방문 의사 있음', '아쉬움 있음']
};
