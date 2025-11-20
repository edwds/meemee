
import React from 'react';
import { Utensils, Medal, Flame, Coffee, Fish, Crown, Camera } from 'lucide-react';
import { Badge, ReviewRecord } from '../types';

// --- LEVEL LOGIC ---
export const calculateLevel = (recordsCount: number) => {
  // Simple logic: Level up every 5 posts
  const level = Math.floor(recordsCount / 5) + 1;
  const nextLevelThreshold = level * 5;
  const progress = ((recordsCount % 5) / 5) * 100;
  
  return { level, nextLevelThreshold, progress };
};

// --- BADGE DEFINITIONS ---
export const BADGES: Badge[] = [
  {
    id: 'collector_1',
    label: '시작된 여정',
    description: '첫 번째 미식 기록을 남겼습니다.',
    icon: <Utensils size={18} />,
    color: 'bg-blue-100 text-blue-600',
    condition: (r) => r.length >= 1
  },
  {
    id: 'collector_5',
    label: '미식 탐험가',
    description: '5곳 이상의 식당을 기록했습니다.',
    icon: <Medal size={18} />,
    color: 'bg-purple-100 text-purple-600',
    condition: (r) => r.length >= 5
  },
  {
    id: 'photo_master',
    label: '포토그래퍼',
    description: '10장 이상의 사진을 기록했습니다.',
    icon: <Camera size={18} />,
    color: 'bg-green-100 text-green-600',
    condition: (r) => r.reduce((acc, cur) => acc + cur.photos.length, 0) >= 10
  },
  {
    id: 'spicy_lover',
    label: '맵부심',
    description: '매운맛(3점 이상)을 3번 이상 즐겼습니다.',
    icon: <Flame size={18} />,
    color: 'bg-red-100 text-red-600',
    condition: (r) => {
      if (r.length < 3) return false;
      const spicyRecords = r.filter(i => i.tasteProfile.spiciness >= 3);
      return spicyRecords.length >= 3;
    }
  },
  {
    id: 'sweet_tooth',
    label: '디저트 러버',
    description: '카페 투어를 3번 이상 다녀왔습니다.',
    icon: <Coffee size={18} />,
    color: 'bg-pink-100 text-pink-600',
    condition: (r) => {
      const cafes = r.filter(i => i.category?.includes('카페') || i.tasteProfile.sweetness >= 4);
      return cafes.length >= 3;
    }
  },
  {
    id: 'sushi_master',
    label: '일식 전문가',
    description: '일식 카테고리를 3번 이상 기록했습니다.',
    icon: <Fish size={18} />,
    color: 'bg-indigo-100 text-indigo-600',
    condition: (r) => r.filter(i => i.category?.includes('일식')).length >= 3
  },
  {
    id: 'critic',
    label: '깐깐한 평론가',
    description: '총 10개의 미식 기록을 작성했습니다.',
    icon: <Crown size={18} />,
    color: 'bg-yellow-100 text-yellow-700',
    condition: (r) => r.length >= 10
  }
];

export const getEarnedBadges = (records: ReviewRecord[]) => {
  return BADGES.filter(b => b.condition(records));
};


// --- GOURMET MBTI LOGIC ---

export interface GourmetMBTI {
  code: string; // e.g., "BZRH"
  title: string;
  description: string;
  nuance: string; // Detailed description based on stats
  favoriteCategories: string[]; // Top 3 categories
  axes: {
    intensity: 'Bold' | 'Mild';
    mainNote: 'Sweet' | 'Zesty';
    body: 'Rich' | 'Light';
    kick: 'Hot' | 'Pure';
  };
  scores: {
    spiciness: number;
    sweetness: number;
    saltiness: number;
    acidity: number;
    richness: number;
  }
}

const MBTI_PERSONAS: Record<string, { title: string; desc: string }> = {
  // B (Bold) Types
  'BZRH': { title: '도파민 사냥꾼', desc: '강렬하고 자극적인 맛이 아니면 만족하지 못하는 타입' },
  'BZRP': { title: '감칠맛의 제왕', desc: '깊고 진한 육수와 풍미 가득한 요리를 사랑하는 미식가' },
  'BZLH': { title: '짜릿한 헌터', desc: '가벼우면서도 톡 쏘는 자극을 즐기는 힙한 입맛' },
  'BZLP': { title: '소스 마니아', desc: '재료보다는 소스와 양념 맛을 중요하게 생각하는 타입' },
  'BSRH': { title: '단짠단짠 파이터', desc: '맵고 달고 짜고! 화려한 맛의 축제를 즐기는 타입' },
  'BSRP': { title: '묵직한 단맛 중독자', desc: '진한 초콜릿이나 버터리한 디저트에 진심인 편' },
  'BSLH': { title: '새콤달콤 스파이시', desc: '동남아 음식처럼 다채로운 향신료와 단맛을 즐기는 타입' },
  'BSLP': { title: '과즙 팡팡', desc: '상큼하고 진한 과일 맛이나 칵테일을 좋아하는 타입' },

  // M (Mild) Types
  'MZRH': { title: '은은한 얼큰함', desc: '자극적이지 않지만 속이 풀리는 국물 요리를 선호하는 타입' },
  'MZRP': { title: '평양냉면파', desc: '슴슴하면서도 깊은 메밀향 같은 본연의 맛을 즐기는 고수' },
  'MZLH': { title: '깔끔한 미식가', desc: '군더더기 없이 정갈하고 산뜻한 요리를 찾는 타입' },
  'MZLP': { title: '재료 본연주의자', desc: '간을 최소화하고 신선한 재료의 맛을 그대로 느끼는 타입' },
  'MSRH': { title: '부드러운 반전 매력', desc: '부드러운 식감 속에 숨겨진 약간의 킥을 즐기는 타입' },
  'MSRP': { title: '디저트 힐러', desc: '따뜻한 라떼와 부드러운 케이크로 위로받는 감성 입맛' },
  'MSLH': { title: '상큼한 밸런서', desc: '요거트나 과일 샐러드처럼 가볍고 달콤한 맛을 선호' },
  'MSLP': { title: '햇살 가득 브런치', desc: '자극 없이 편안하고 가벼운 브런치 메뉴를 사랑하는 타입' }
};

export const calculateGourmetMBTI = (records: ReviewRecord[]): GourmetMBTI | null => {
  if (records.length === 0) return null;

  const sums = records.reduce((acc, r) => ({
    spiciness: acc.spiciness + r.tasteProfile.spiciness,
    sweetness: acc.sweetness + r.tasteProfile.sweetness,
    saltiness: acc.saltiness + r.tasteProfile.saltiness,
    acidity: acc.acidity + r.tasteProfile.acidity,
    richness: acc.richness + r.tasteProfile.richness,
  }), { spiciness: 0, sweetness: 0, saltiness: 0, acidity: 0, richness: 0 });

  // Calculate Category frequency
  const catCounts: Record<string, number> = {};
  records.forEach(r => {
    if (r.category) {
        catCounts[r.category] = (catCounts[r.category] || 0) + 1;
    }
  });
  const favoriteCategories = Object.entries(catCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([cat]) => cat);

  const count = records.length;
  const avg = {
    spiciness: sums.spiciness / count,
    sweetness: sums.sweetness / count,
    saltiness: sums.saltiness / count,
    acidity: sums.acidity / count,
    richness: sums.richness / count,
  };

  // 1. Intensity (Overall Avg)
  const overallAvg = (avg.spiciness + avg.sweetness + avg.saltiness + avg.acidity + avg.richness) / 5;
  const axisIntensity = overallAvg >= 2.8 ? 'B' : 'M'; // Bold vs Mild

  // 2. Main Note (Sweet vs Salty/Umami)
  const axisMain = avg.sweetness >= avg.saltiness ? 'S' : 'Z'; // Sweet vs Zesty

  // 3. Body (Richness vs Acidity/Lightness)
  const axisBody = avg.richness >= avg.acidity ? 'R' : 'L'; // Rich vs Light

  // 4. Kick (Spiciness threshold)
  const axisKick = avg.spiciness >= 2.5 ? 'H' : 'P'; // Hot vs Pure

  const code = `${axisIntensity}${axisMain}${axisBody}${axisKick}`;
  const persona = MBTI_PERSONAS[code] || { title: '미식 탐험가', desc: '아직 정의되지 않은 유니크한 입맛' };

  // Generate Nuance Text
  let nuance = "다양한 맛을 즐기는 균형 잡힌 입맛입니다.";
  if (avg.spiciness > 4) nuance = "혀끝을 때리는 강렬한 매운맛을 즐기시네요.";
  else if (avg.sweetness > 4) nuance = "달콤한 디저트나 소스를 특히 선호하는 편입니다.";
  else if (avg.richness > 4) nuance = "깊고 진한 풍미와 묵직한 바디감을 사랑합니다.";
  else if (avg.acidity > 4) nuance = "산미가 도드라지는 신선하고 상큼한 맛을 찾으시네요.";
  else if (overallAvg < 2) nuance = "재료 본연의 슴슴하고 담백한 맛을 즐기는 미식가입니다.";

  return {
    code,
    title: persona.title,
    description: persona.desc,
    nuance,
    favoriteCategories,
    axes: {
      intensity: axisIntensity === 'B' ? 'Bold' : 'Mild',
      mainNote: axisMain === 'S' ? 'Sweet' : 'Zesty',
      body: axisBody === 'R' ? 'Rich' : 'Light',
      kick: axisKick === 'H' ? 'Hot' : 'Pure',
    },
    scores: avg
  };
};
