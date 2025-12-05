import React from 'react';

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

export interface DetailedEvaluation {
  venue: {
    atmosphere: string[];
    service: string[];
  };
  menu: {
    texture: string[];
    flavor: string[];
    note: string[];
  };
}

export interface LocationData {
  lat: number;
  lng: number;
  address?: string;
}

export interface ReviewRecord {
  id: string;
  title: string; // Restaurant Name
  category: string; // Cuisine Category (e.g. Korean, Cafe)
  photos: string[]; // Base64 strings
  representativePhoto: string;
  preference: Preference;
  menu: string;
  visitDate: string; // YYYY-MM-DD
  companions: string; // Who you went with
  tasteProfile: TasteProfile;
  detailedEvaluation?: DetailedEvaluation;
  keywords: string[];
  reviewText: string; // Manually written review (formerly aiGeneratedText)
  createdAt: number; // Timestamp
  rank?: number; // Optional ranking for 'GOOD' preference records
  location?: LocationData;
}

export interface DiscoverRestaurant {
  id: string;
  name: string;
  category: string;
  photo: string;
  menu: string;
  keywords: string[];
  tasteProfile: TasteProfile;
  visitedFriends: string[]; // List of friend names
  area: string; // e.g. 성수, 강남
}

export interface FeedPost {
  id: string;
  author: {
    name: string;
    avatar: string;
  };
  record: ReviewRecord;
  likeCount: number;
  isLiked: boolean;
  timeAgo: string;
}

export interface Badge {
  id: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  description: string;
  condition: (records: ReviewRecord[]) => boolean;
}

export interface LeaderboardUser {
  id: string;
  rank: number;
  name: string;
  avatar: string;
  level: number;
  mbti: string; // e.g. BZRH
  nuance: string; // Taste description
  stats: {
    count: number; // Records or Followers depending on context
    label: string; // 'Records' or 'Followers'
  };
  region?: string; // For regional leaderboard
}

export const KEYWORD_DATA: Record<KeywordCategory, string[]> = {
  Texture: ['부드러운', '쫄깃한', '촉촉한', '바삭한', '묵직한', '가벼운'],
  Vibe: ['조용한', '캐주얼', '데이트용', '혼밥 적합', '활기찬', '감성적'],
  Overall: ['만족스러움', '가격 대비 좋음', '서비스 친절', '재방문 의사 있음', '아쉬움 있음']
};