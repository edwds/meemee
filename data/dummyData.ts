
import { DiscoverRestaurant } from '../types';

export const DUMMY_DISCOVER_DATA: DiscoverRestaurant[] = [
  {
    id: 'd-1',
    name: '미드나잇 라멘',
    category: '일식',
    photo: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=800&q=80',
    menu: '돈코츠 라멘, 마제소바',
    keywords: ['묵직한', '혼밥 적합', '감칠맛'],
    tasteProfile: { spiciness: 2, sweetness: 2, saltiness: 5, acidity: 1, richness: 5 },
    visitedFriends: ['민지', '철수']
  },
  {
    id: 'd-2',
    name: '도산 분식 클럽',
    category: '한식/분식',
    photo: 'https://images.unsplash.com/photo-1580651315530-69c8e0026377?auto=format&fit=crop&w=800&q=80',
    menu: '육회 김밥, 떡볶이',
    keywords: ['캐주얼', '매콤한', '활기찬'],
    tasteProfile: { spiciness: 4, sweetness: 4, saltiness: 3, acidity: 2, richness: 3 },
    visitedFriends: ['지은']
  },
  {
    id: 'd-3',
    name: '카페 레이어드',
    category: '카페',
    photo: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=800&q=80',
    menu: '스콘, 얼그레이 케이크',
    keywords: ['감성적', '데이트용', '부드러운'],
    tasteProfile: { spiciness: 1, sweetness: 5, saltiness: 2, acidity: 2, richness: 4 },
    visitedFriends: ['수진', '현우', '나영']
  },
  {
    id: 'd-4',
    name: '타코 튜즈데이',
    category: '멕시칸',
    photo: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=800&q=80',
    menu: '비리아 타코, 과카몰리',
    keywords: ['이국적인', '활기찬', '가격 대비 좋음'],
    tasteProfile: { spiciness: 3, sweetness: 2, saltiness: 4, acidity: 4, richness: 3 },
    visitedFriends: []
  },
  {
    id: 'd-5',
    name: '한남 솥밥',
    category: '한식',
    photo: 'https://images.unsplash.com/photo-1590301157890-4810ed352733?auto=format&fit=crop&w=800&q=80',
    menu: '스테이크 솥밥',
    keywords: ['정갈한', '서비스 친절', '담백한'],
    tasteProfile: { spiciness: 1, sweetness: 2, saltiness: 2, acidity: 1, richness: 2 },
    visitedFriends: ['민수']
  },
  {
    id: 'd-6',
    name: '버거 스탠드',
    category: '양식',
    photo: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=800&q=80',
    menu: '더블 치즈버거',
    keywords: ['묵직한', '미국맛', '캐주얼'],
    tasteProfile: { spiciness: 1, sweetness: 3, saltiness: 5, acidity: 2, richness: 5 },
    visitedFriends: ['철수', '영희']
  },
  {
    id: 'd-7',
    name: '사운즈 커피',
    category: '카페',
    photo: 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?auto=format&fit=crop&w=800&q=80',
    menu: '필터 커피',
    keywords: ['조용한', '혼밥 적합', '향긋한'],
    tasteProfile: { spiciness: 1, sweetness: 1, saltiness: 1, acidity: 4, richness: 2 },
    visitedFriends: []
  },
  {
    id: 'd-8',
    name: '마라 킹',
    category: '중식',
    photo: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=800&q=80',
    menu: '마라탕, 꿔바로우',
    keywords: ['자극적인', '매콤한', '중독성'],
    tasteProfile: { spiciness: 5, sweetness: 3, saltiness: 4, acidity: 2, richness: 4 },
    visitedFriends: ['지훈', '유진']
  },
  {
    id: 'd-9',
    name: '스시 소라',
    category: '일식',
    photo: 'https://images.unsplash.com/photo-1553621042-f6e147245754?auto=format&fit=crop&w=800&q=80',
    menu: '특선 초밥',
    keywords: ['신선한', '깔끔한', '재방문 의사 있음'],
    tasteProfile: { spiciness: 1, sweetness: 2, saltiness: 3, acidity: 3, richness: 3 },
    visitedFriends: ['성민']
  },
  {
    id: 'd-10',
    name: '피자 웍스',
    category: '양식',
    photo: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80',
    menu: '페퍼로니 피자',
    keywords: ['바삭한', '짭짤한', '맥주 안주'],
    tasteProfile: { spiciness: 2, sweetness: 2, saltiness: 5, acidity: 2, richness: 4 },
    visitedFriends: ['민지', '영수', '다혜']
  }
];
