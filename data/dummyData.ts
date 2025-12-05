
import { DiscoverRestaurant, LeaderboardUser } from '../types';

export const DUMMY_DISCOVER_DATA: DiscoverRestaurant[] = [
  {
    id: 'd-1',
    name: '미드나잇 라멘',
    category: '일식',
    photo: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=800&q=80',
    menu: '돈코츠 라멘, 마제소바',
    keywords: ['녹진한', '혼밥 환영', '감칠맛', '자가제면'],
    tasteProfile: { spiciness: 2, sweetness: 2, saltiness: 5, acidity: 1, richness: 5 },
    visitedFriends: ['민지', '철수'],
    area: '성수'
  },
  {
    id: 'd-2',
    name: '도산 분식 클럽',
    category: '한식/분식',
    photo: 'https://images.unsplash.com/photo-1580651315530-69c8e0026377?auto=format&fit=crop&w=800&q=80',
    menu: '육회 김밥, 떡볶이',
    keywords: ['레트로', '매콤달콤', '웨이팅 필수', '인스타감성'],
    tasteProfile: { spiciness: 4, sweetness: 4, saltiness: 3, acidity: 2, richness: 3 },
    visitedFriends: ['지은'],
    area: '도산공원'
  },
  {
    id: 'd-3',
    name: '카페 레이어드',
    category: '카페',
    photo: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=800&q=80',
    menu: '스콘, 얼그레이 케이크',
    keywords: ['버터미', '채광 좋은', '부드러운', '유럽풍'],
    tasteProfile: { spiciness: 1, sweetness: 5, saltiness: 2, acidity: 2, richness: 4 },
    visitedFriends: ['수진', '현우', '나영'],
    area: '연남'
  },
  {
    id: 'd-4',
    name: '타코 튜즈데이',
    category: '멕시칸',
    photo: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=800&q=80',
    menu: '비리아 타코, 과카몰리',
    keywords: ['현지의 맛', '활기찬', '육향가득', '이국적인'],
    tasteProfile: { spiciness: 3, sweetness: 2, saltiness: 4, acidity: 4, richness: 3 },
    visitedFriends: [],
    area: '이태원'
  },
  {
    id: 'd-5',
    name: '한남 솥밥',
    category: '한식',
    photo: 'https://images.unsplash.com/photo-1590301157890-4810ed352733?auto=format&fit=crop&w=800&q=80',
    menu: '스테이크 솥밥',
    keywords: ['정갈한', '고소한', '담백한', '부모님 동반'],
    tasteProfile: { spiciness: 1, sweetness: 2, saltiness: 2, acidity: 1, richness: 2 },
    visitedFriends: ['민수'],
    area: '한남'
  },
  {
    id: 'd-6',
    name: '버거 스탠드',
    category: '양식',
    photo: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=800&q=80',
    menu: '더블 치즈버거',
    keywords: ['육즙가득', '미국맛', '힙한', '꾸덕한'],
    tasteProfile: { spiciness: 1, sweetness: 3, saltiness: 5, acidity: 2, richness: 5 },
    visitedFriends: ['철수', '영희'],
    area: '성수'
  },
  {
    id: 'd-7',
    name: '사운즈 커피',
    category: '카페',
    photo: 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?auto=format&fit=crop&w=800&q=80',
    menu: '필터 커피',
    keywords: ['산뜻한', '조용한', '향긋한', '혼커'],
    tasteProfile: { spiciness: 1, sweetness: 1, saltiness: 1, acidity: 4, richness: 2 },
    visitedFriends: [],
    area: '한남'
  },
  {
    id: 'd-8',
    name: '마라 킹',
    category: '중식',
    photo: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=800&q=80',
    menu: '마라탕, 꿔바로우',
    keywords: ['알싸한', '중독성', '자극적인', '혼밥 환영'],
    tasteProfile: { spiciness: 5, sweetness: 3, saltiness: 4, acidity: 2, richness: 4 },
    visitedFriends: ['지훈', '유진'],
    area: '강남'
  },
  {
    id: 'd-9',
    name: '스시 소라',
    category: '일식',
    photo: 'https://images.unsplash.com/photo-1553621042-f6e147245754?auto=format&fit=crop&w=800&q=80',
    menu: '특선 초밥',
    keywords: ['신선한', '비리지 않은', '재방문 의사 있음', '깔끔한'],
    tasteProfile: { spiciness: 1, sweetness: 2, saltiness: 3, acidity: 3, richness: 3 },
    visitedFriends: ['성민'],
    area: '청담'
  },
  {
    id: 'd-10',
    name: '피자 웍스',
    category: '양식',
    photo: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80',
    menu: '페퍼로니 피자',
    keywords: ['크리스피', '짭조름한', '맥주 안주', '캐주얼'],
    tasteProfile: { spiciness: 2, sweetness: 2, saltiness: 5, acidity: 2, richness: 4 },
    visitedFriends: ['민지', '영수', '다혜'],
    area: '성수'
  }
];

export const MOCK_ACTIVE_USERS: LeaderboardUser[] = [
  { id: 'l-1', rank: 1, name: '맛잘알_김', avatar: 'https://i.pravatar.cc/150?u=1', level: 24, mbti: 'BZRH', stats: { count: 342, label: '기록' } },
  { id: 'l-2', rank: 2, name: '카페투어', avatar: 'https://i.pravatar.cc/150?u=2', level: 18, mbti: 'MSLP', stats: { count: 215, label: '기록' } },
  { id: 'l-3', rank: 3, name: '고독한미식가', avatar: 'https://i.pravatar.cc/150?u=3', level: 15, mbti: 'MZRP', stats: { count: 189, label: '기록' } },
  { id: 'l-4', rank: 4, name: '빵순이', avatar: 'https://i.pravatar.cc/150?u=4', level: 12, mbti: 'BSLP', stats: { count: 156, label: '기록' } },
  { id: 'l-5', rank: 5, name: '스시로', avatar: 'https://i.pravatar.cc/150?u=5', level: 11, mbti: 'MZLH', stats: { count: 132, label: '기록' } },
];

export const MOCK_POPULAR_USERS: LeaderboardUser[] = [
  { id: 'p-1', rank: 1, name: '강민지', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=100&q=80', level: 22, mbti: 'BSRH', stats: { count: 1540, label: '팔로워' } },
  { id: 'p-2', rank: 2, name: '이현우', avatar: 'https://i.pravatar.cc/150?u=8', level: 19, mbti: 'BZRP', stats: { count: 1203, label: '팔로워' } },
  { id: 'p-3', rank: 3, name: '박지은', avatar: 'https://i.pravatar.cc/150?u=9', level: 17, mbti: 'MSLH', stats: { count: 980, label: '팔로워' } },
  { id: 'p-4', rank: 4, name: '최준호', avatar: 'https://i.pravatar.cc/150?u=10', level: 14, mbti: 'BZRH', stats: { count: 854, label: '팔로워' } },
  { id: 'p-5', rank: 5, name: '김나영', avatar: 'https://i.pravatar.cc/150?u=11', level: 12, mbti: 'MSLP', stats: { count: 721, label: '팔로워' } },
];

export const MOCK_REGIONAL_DATA: Record<string, LeaderboardUser[]> = {
  '성수': [
    { id: 'r-1', rank: 1, name: '성수동힙스터', avatar: 'https://i.pravatar.cc/150?u=20', level: 15, mbti: 'BZRH', stats: { count: 45, label: '성수 기록' } },
    { id: 'r-2', rank: 2, name: '카페러버', avatar: 'https://i.pravatar.cc/150?u=21', level: 12, mbti: 'MSLP', stats: { count: 38, label: '성수 기록' } },
    { id: 'r-3', rank: 3, name: '팝업사냥꾼', avatar: 'https://i.pravatar.cc/150?u=22', level: 9, mbti: 'BSRH', stats: { count: 32, label: '성수 기록' } },
  ],
  '강남': [
    { id: 'r-4', rank: 1, name: '강남직장인', avatar: 'https://i.pravatar.cc/150?u=25', level: 18, mbti: 'MZRP', stats: { count: 52, label: '강남 기록' } },
    { id: 'r-5', rank: 2, name: '오마카세', avatar: 'https://i.pravatar.cc/150?u=26', level: 14, mbti: 'MZLH', stats: { count: 41, label: '강남 기록' } },
  ],
  '한남/이태원': [
    { id: 'r-6', rank: 1, name: '브런치퀸', avatar: 'https://i.pravatar.cc/150?u=30', level: 20, mbti: 'BSLP', stats: { count: 60, label: '한남 기록' } },
    { id: 'r-7', rank: 2, name: '와인러버', avatar: 'https://i.pravatar.cc/150?u=31', level: 16, mbti: 'BZLP', stats: { count: 48, label: '한남 기록' } },
  ]
};
