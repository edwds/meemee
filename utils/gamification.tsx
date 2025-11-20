
import React from 'react';
import { Utensils, Medal, Flame, Coffee, Fish, Crown, MapPin, Camera } from 'lucide-react';
import { Badge, ReviewRecord } from '../types';

// Level Logic
export const calculateLevel = (recordsCount: number) => {
  // Simple logic: Level up every 5 posts
  const level = Math.floor(recordsCount / 5) + 1;
  const nextLevelThreshold = level * 5;
  const progress = ((recordsCount % 5) / 5) * 100;
  
  return { level, nextLevelThreshold, progress };
};

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
