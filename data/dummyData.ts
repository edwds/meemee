
import { DiscoverRestaurant, LeaderboardUser, FeedPost, ReviewRecord, Preference, DetailedEvaluation } from '../types';

// --- SHARED KEYWORDS & POOLS ---
export const KEYWORD_POOLS = {
  texture: ['쫄깃한', '부드러운', '바삭한', '녹진한', '탱글한', '꾸덕한', '촉촉한', '몽글몽글', '야들야들'],
  flavor: ['불향', '버터미', '고소한', '감칠맛', '산뜻한', '육향가득', '트러플향', '스모키한', '알싸한'],
  note: ['본연의 맛', '이색적인', '중독성 있는', '술을 부르는', '밥도둑', '깔끔한', '현지의 맛', '해장되는'],
  atmosphere: ['힙한', '차분한', '활기찬', '로맨틱', '노포 감성', '인스타감성', '모던한', '이국적인'],
  service: ['친절한', '전문적인', '빠른 응대', '주차가능', '예약 필수', '프라이빗']
};

const getRandomItems = (arr: string[], count: number) => {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

// --- FEED DATA GENERATION ---
const MOCK_AUTHORS = [
  { name: '강민지', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80' },
  { name: '박철수', avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=150&q=80' },
  { name: '김지현', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80' },
  { name: '최준호', avatar: 'https://images.unsplash.com/photo-1552058544-f2b08422138a?auto=format&fit=crop&w=150&q=80' },
  { name: '이수진', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80' },
  { name: '정우성', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&q=80' }
];

const MOCK_CONTENTS = [
  {
    title: '미드나잇 라멘', menu: '돈코츠 라멘', category: '일식',
    photo: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=800&q=80',
    text: '국물의 깊이가 남다르다. 자가제면의 식감도 훌륭하고, 차슈의 불향이 국물과 완벽하게 어우러진다. 해장이 필요할 때 무조건 생각날 맛.'
  },
  {
    title: '카페 레이어드', menu: '스콘 & 커피', category: '카페',
    photo: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=800&q=80',
    text: '버터 풍미 가득한 스콘과 산미 있는 아메리카노의 조화. 채광 좋은 창가 자리는 덤이다. 주말에는 웨이팅이 필수지만 그럴 가치가 충분하다.'
  },
  {
    title: '도산 분식', menu: '육회 김밥', category: '한식',
    photo: 'https://images.unsplash.com/photo-1580651315530-69c8e0026377?auto=format&fit=crop&w=800&q=80',
    text: '레트로한 분위기 속에서 즐기는 육회 김밥의 고소함. 분식의 고급화란 이런 것일까. 친구들과 가볍게 들르기 좋은 힙한 공간.'
  },
  {
    title: '타코 튜즈데이', menu: '비리아 타코', category: '멕시칸',
    photo: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=800&q=80',
    text: '한 입 베어 물자마자 터지는 육즙과 고수의 향. 멕시코 현지의 맛을 그대로 재현했다. 라임즙을 듬뿍 뿌려 먹으면 풍미가 배가된다.'
  },
  {
    title: '한남 솥밥', menu: '스테이크 솥밥', category: '한식',
    photo: 'https://images.unsplash.com/photo-1590301157890-4810ed352733?auto=format&fit=crop&w=800&q=80',
    text: '갓 지은 밥의 고슬고슬함과 부드러운 스테이크. 마지막 누룽지까지 완벽한 한 끼. 부모님을 모시고 와도 좋을 정갈한 식사.'
  }
];

export const MOCK_FEED_POSTS: FeedPost[] = Array.from({ length: 20 }).map((_, i) => {
    const content = MOCK_CONTENTS[i % MOCK_CONTENTS.length];
    const author = MOCK_AUTHORS[i % MOCK_AUTHORS.length];
    
    const detailedEval: DetailedEvaluation = {
      menu: {
        texture: getRandomItems(KEYWORD_POOLS.texture, 1),
        flavor: getRandomItems(KEYWORD_POOLS.flavor, 1),
        note: getRandomItems(KEYWORD_POOLS.note, 1)
      },
      venue: {
        atmosphere: getRandomItems(KEYWORD_POOLS.atmosphere, 1),
        service: getRandomItems(KEYWORD_POOLS.service, 1)
      }
    };

    const allKeywords = [
      ...detailedEval.menu.texture,
      ...detailedEval.menu.flavor,
      ...detailedEval.menu.note,
      ...detailedEval.venue.atmosphere
    ];

    const dummyPhotos = [content.photo, content.photo, content.photo];

    const record: ReviewRecord = {
      id: `feed-rec-${i}`, // Unique ID for feed
      title: content.title,
      category: content.category,
      photos: dummyPhotos,
      representativePhoto: content.photo,
      preference: Math.random() > 0.3 ? Preference.GOOD : Preference.NORMAL,
      menu: content.menu,
      visitDate: '2024-05-22',
      companions: '친구',
      tasteProfile: { 
        spiciness: Math.ceil(Math.random() * 5), 
        sweetness: Math.ceil(Math.random() * 5), 
        saltiness: Math.ceil(Math.random() * 5), 
        acidity: Math.ceil(Math.random() * 5), 
        richness: Math.ceil(Math.random() * 5) 
      },
      detailedEvaluation: detailedEval,
      keywords: allKeywords,
      reviewText: content.text,
      createdAt: Date.now() - Math.floor(Math.random() * 100000000),
      rank: Math.random() > 0.8 ? Math.ceil(Math.random() * 10) : undefined,
      location: { lat: 37.5 + Math.random() * 0.1, lng: 127.0 + Math.random() * 0.1, address: '서울' }
    };
    
    return {
      id: `feed-post-${i}`,
      author: author,
      timeAgo: `${Math.floor(Math.random() * 23) + 1}시간 전`,
      likeCount: 10 + Math.floor(Math.random() * 100),
      isLiked: Math.random() > 0.7,
      record: record
    };
});

// --- USER PROFILE MOCK RECORDS ---
export const MOCK_FRIEND_RECORDS: ReviewRecord[] = [
  {
    id: 'friend-u-1', 
    title: '카페 레이어드', 
    category: '카페', 
    photos: ['https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=800&q=80'], 
    representativePhoto: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=800&q=80', 
    preference: Preference.GOOD, 
    menu: '스콘', 
    visitDate: '2024-05-15', 
    companions: '친구', 
    tasteProfile: { spiciness: 1, sweetness: 5, saltiness: 2, acidity: 2, richness: 4 }, 
    detailedEvaluation: {
        venue: { atmosphere: ['유럽풍', '채광 좋은'], service: ['친절한'] },
        menu: { texture: ['촉촉한', '부드러운'], flavor: ['버터미', '향긋한'], note: ['여유로운'] }
    },
    keywords: ['유럽풍', '버터미', '촉촉한'], 
    reviewText: '얼그레이의 향긋함과 스콘의 버터 풍미가 완벽하다. 따뜻한 햇살 아래서 즐기는 여유로운 오후.', 
    createdAt: 1715700000000, 
    rank: 1
  },
  {
    id: 'friend-u-2', 
    title: '도산 분식', 
    category: '분식', 
    photos: ['https://images.unsplash.com/photo-1580651315530-69c8e0026377?auto=format&fit=crop&w=800&q=80'], 
    representativePhoto: 'https://images.unsplash.com/photo-1580651315530-69c8e0026377?auto=format&fit=crop&w=800&q=80', 
    preference: Preference.GOOD, 
    menu: '육회 김밥', 
    visitDate: '2024-05-10', 
    companions: '연인', 
    tasteProfile: { spiciness: 3, sweetness: 4, saltiness: 3, acidity: 2, richness: 3 }, 
    detailedEvaluation: {
        venue: { atmosphere: ['레트로', '힙한'], service: ['웨이팅 있음'] },
        menu: { texture: ['쫄깃한', '고소한'], flavor: ['감칠맛', '매콤달콤'], note: ['이색적인'] }
    },
    keywords: ['레트로', '감칠맛', '이색적인'], 
    reviewText: '분식의 고급화. 육회 김밥은 고소함의 끝판왕이다. 레트로한 접시도 사진 찍기 좋음.', 
    createdAt: 1715200000000, 
    rank: 2
  },
  {
    id: 'friend-u-3', 
    title: '블루 보틀', 
    category: '카페', 
    photos: ['https://images.unsplash.com/photo-1521017432531-fbd92d768814?auto=format&fit=crop&w=800&q=80'], 
    representativePhoto: 'https://images.unsplash.com/photo-1521017432531-fbd92d768814?auto=format&fit=crop&w=800&q=80', 
    preference: Preference.NORMAL, 
    menu: '뉴올리언스', 
    visitDate: '2024-05-01', 
    companions: '혼자', 
    tasteProfile: { spiciness: 1, sweetness: 3, saltiness: 1, acidity: 2, richness: 3 }, 
    detailedEvaluation: {
        venue: { atmosphere: ['모던한', '미니멀'], service: ['전문적인'] },
        menu: { texture: ['부드러운'], flavor: ['고소한'], note: ['깔끔한'] }
    },
    keywords: ['모던한', '깔끔한', '고소한'], 
    reviewText: '라떼는 확실히 맛있다. 사람이 너무 많아서 앉을 자리가 없는게 아쉽다.', 
    createdAt: 1714500000000
  }
];

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

export const MOCK_GROUP_USERS: LeaderboardUser[] = [
  { id: 'g-1', rank: 1, name: '에드워즈', avatar: 'https://images.unsplash.com/photo-1563237023-b1e970526dcb?auto=format&fit=crop&w=150&q=80', level: 24, mbti: 'BZRH', nuance: '강렬한 매운맛 중독자', stats: { count: 342, label: '기록' } },
  { id: 'g-2', rank: 2, name: '디자인팀장', avatar: 'https://i.pravatar.cc/150?u=40', level: 21, mbti: 'MSLP', nuance: '섬세한 브런치 탐험가', stats: { count: 289, label: '기록' } },
  { id: 'g-3', rank: 3, name: '개발막내', avatar: 'https://i.pravatar.cc/150?u=41', level: 19, mbti: 'MZLH', nuance: '깔끔한 일식 선호', stats: { count: 210, label: '기록' } },
  { id: 'g-4', rank: 4, name: '마케터Kim', avatar: 'https://i.pravatar.cc/150?u=42', level: 15, mbti: 'BSRP', nuance: '달콤한 디저트 러버', stats: { count: 156, label: '기록' } },
  { id: 'g-5', rank: 5, name: 'HR매니저', avatar: 'https://i.pravatar.cc/150?u=43', level: 12, mbti: 'MZRP', nuance: '슴슴한 평양냉면파', stats: { count: 98, label: '기록' } },
];

export const MOCK_ACTIVE_USERS: LeaderboardUser[] = [
  { id: 'l-1', rank: 1, name: '맛잘알_김', avatar: 'https://i.pravatar.cc/150?u=1', level: 24, mbti: 'BZRH', nuance: '자극적인 맛을 찾아다님', stats: { count: 342, label: '기록' } },
  { id: 'l-2', rank: 2, name: '카페투어', avatar: 'https://i.pravatar.cc/150?u=2', level: 18, mbti: 'MSLP', nuance: '햇살 좋은 카페 수집가', stats: { count: 215, label: '기록' } },
  { id: 'l-3', rank: 3, name: '고독한미식가', avatar: 'https://i.pravatar.cc/150?u=3', level: 15, mbti: 'MZRP', nuance: '재료 본연의 맛 중시', stats: { count: 189, label: '기록' } },
  { id: 'l-4', rank: 4, name: '빵순이', avatar: 'https://i.pravatar.cc/150?u=4', level: 12, mbti: 'BSLP', nuance: '버터 풍미 가득한 빵 선호', stats: { count: 156, label: '기록' } },
  { id: 'l-5', rank: 5, name: '스시로', avatar: 'https://i.pravatar.cc/150?u=5', level: 11, mbti: 'MZLH', nuance: '오마카세 도장깨기 중', stats: { count: 132, label: '기록' } },
];

export const MOCK_POPULAR_USERS: LeaderboardUser[] = [
  { id: 'p-1', rank: 1, name: '강민지', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=100&q=80', level: 22, mbti: 'BSRH', nuance: '트렌디한 핫플 마스터', stats: { count: 1540, label: '팔로워' } },
  { id: 'p-2', rank: 2, name: '이현우', avatar: 'https://i.pravatar.cc/150?u=8', level: 19, mbti: 'BZRP', nuance: '숨은 노포 맛집 전문가', stats: { count: 1203, label: '팔로워' } },
  { id: 'p-3', rank: 3, name: '박지은', avatar: 'https://i.pravatar.cc/150?u=9', level: 17, mbti: 'MSLH', nuance: '비건 & 건강식 큐레이터', stats: { count: 980, label: '팔로워' } },
  { id: 'p-4', rank: 4, name: '최준호', avatar: 'https://i.pravatar.cc/150?u=10', level: 14, mbti: 'BZRH', nuance: '매운맛 챌린지 도전자', stats: { count: 854, label: '팔로워' } },
  { id: 'p-5', rank: 5, name: '김나영', avatar: 'https://i.pravatar.cc/150?u=11', level: 12, mbti: 'MSLP', nuance: '감성 카페 포토그래퍼', stats: { count: 721, label: '팔로워' } },
];

export const MOCK_REGIONAL_DATA: Record<string, LeaderboardUser[]> = {
  '성수': [
    { id: 'r-1', rank: 1, name: '성수동힙스터', avatar: 'https://i.pravatar.cc/150?u=20', level: 15, mbti: 'BZRH', nuance: '성수동 모든 팝업 섭렵', stats: { count: 45, label: '성수 기록' } },
    { id: 'r-2', rank: 2, name: '카페러버', avatar: 'https://i.pravatar.cc/150?u=21', level: 12, mbti: 'MSLP', nuance: '조용한 작업실 카페 수집', stats: { count: 38, label: '성수 기록' } },
    { id: 'r-3', rank: 3, name: '팝업사냥꾼', avatar: 'https://i.pravatar.cc/150?u=22', level: 9, mbti: 'BSRH', nuance: '웨이팅도 마다하지 않음', stats: { count: 32, label: '성수 기록' } },
  ],
  '강남': [
    { id: 'r-4', rank: 1, name: '강남직장인', avatar: 'https://i.pravatar.cc/150?u=25', level: 18, mbti: 'MZRP', nuance: '직장인 점심 맛집 지도', stats: { count: 52, label: '강남 기록' } },
    { id: 'r-5', rank: 2, name: '오마카세', avatar: 'https://i.pravatar.cc/150?u=26', level: 14, mbti: 'MZLH', nuance: '하이엔드 다이닝 리뷰어', stats: { count: 41, label: '강남 기록' } },
  ],
  '한남/이태원': [
    { id: 'r-6', rank: 1, name: '브런치퀸', avatar: 'https://i.pravatar.cc/150?u=30', level: 20, mbti: 'BSLP', nuance: '테라스가 있는 브런치', stats: { count: 60, label: '한남 기록' } },
    { id: 'r-7', rank: 2, name: '와인러버', avatar: 'https://i.pravatar.cc/150?u=31', level: 16, mbti: 'BZLP', nuance: '내추럴 와인바 전문', stats: { count: 48, label: '한남 기록' } },
  ]
};
