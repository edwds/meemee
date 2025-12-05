
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home';
import { CreateRecord } from './pages/CreateRecord';
import { RecordDetail } from './pages/RecordDetail';
import { Discover } from './pages/Discover';
import { Feed } from './pages/Feed';
import { UserProfile } from './pages/UserProfile';
import { Achievement } from './pages/Achievement';
import { RestaurantDetail } from './pages/RestaurantDetail';
import { Leaderboard } from './pages/Leaderboard';
import { ReviewRecord, Preference } from './types';

const LOCAL_STORAGE_KEY = 'gourmet_log_records_v2';

const SAMPLE_RECORDS: ReviewRecord[] = [
  {
    id: 'rec-1',
    title: '스시 오마카세 젠',
    category: '일식',
    photos: ['https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1553621042-f6e147245754?auto=format&fit=crop&w=800&q=80'],
    representativePhoto: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=800&q=80',
    preference: Preference.GOOD,
    menu: '디너 오마카세',
    visitDate: '2024-05-25',
    companions: '연인',
    tasteProfile: { spiciness: 1, sweetness: 2, saltiness: 3, acidity: 4, richness: 4 },
    detailedEvaluation: {
        venue: { atmosphere: ['차분한', '프라이빗'], service: ['전문적인', '섬세한'] },
        menu: { texture: ['입안에서 녹는', '찰진'], flavor: ['감칠맛', '숙성된 맛'], note: ['여운이 긴', '정갈한'] }
    },
    keywords: ['차분한', '입안에서 녹는', '감칠맛', '정갈한'],
    reviewText: '적초 샤리의 산미와 네타의 감칠맛이 폭발한다. 특히 참치 뱃살은 입안에 넣자마자 녹아내리며 기름진 풍미를 남긴다. 셰프님의 접객도 부담스럽지 않고 세심했다.',
    createdAt: 1716601200000,
    rank: 1,
    location: { lat: 37.5237, lng: 127.0419, address: '청담' }
  },
  {
    id: 'rec-2',
    title: '성수동 파스타 클럽',
    category: '이탈리안',
    photos: ['https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=800&q=80'],
    representativePhoto: 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=800&q=80',
    preference: Preference.GOOD,
    menu: '트러플 뇨끼, 라구 파스타',
    visitDate: '2024-05-22',
    companions: '친구',
    tasteProfile: { spiciness: 1, sweetness: 1, saltiness: 4, acidity: 1, richness: 5 },
    detailedEvaluation: {
        venue: { atmosphere: ['힙한', '캐주얼'], service: ['웨이팅 필수'] },
        menu: { texture: ['쫄깃한', '꾸덕한'], flavor: ['트러플향', '크리미한'], note: ['와인을 부르는', '풍성한'] }
    },
    keywords: ['힙한', '쫄깃한', '트러플향', '꾸덕한'],
    reviewText: '성수동 바이브 그 자체. 뇨끼의 쫀득함은 서울 탑급이다. 트러플 크림 소스가 아주 진해서 바게트를 추가해 싹싹 긁어먹었다.',
    createdAt: 1716342000000,
    rank: 2,
    location: { lat: 37.5446, lng: 127.0559, address: '성수' }
  },
  {
    id: 'rec-3',
    title: '한우 명가',
    category: '한식',
    photos: ['https://images.unsplash.com/photo-1594041680534-e8c8cdebd659?auto=format&fit=crop&w=800&q=80'],
    representativePhoto: 'https://images.unsplash.com/photo-1594041680534-e8c8cdebd659?auto=format&fit=crop&w=800&q=80',
    preference: Preference.GOOD,
    menu: '특안심, 살치살',
    visitDate: '2024-05-18',
    companions: '가족',
    tasteProfile: { spiciness: 1, sweetness: 3, saltiness: 3, acidity: 1, richness: 5 },
    detailedEvaluation: {
        venue: { atmosphere: ['고급스러운', '프라이빗'], service: ['친절한', '구워주는'] },
        menu: { texture: ['야들야들', '부드러운'], flavor: ['육향가득', '숯불향'], note: ['입안에서 녹는', '호불호 없는'] }
    },
    keywords: ['야들야들', '육향가득', '숯불향', '고급스러운'],
    reviewText: '비싼 값을 하는 곳. 숯불에 구워진 투뿔 한우의 육향이 어마어마하다. 안심은 씹을 것도 없이 넘어가고, 살치살은 기름기가 팡 터진다.',
    createdAt: 1715996400000,
    rank: 3,
    location: { lat: 37.5250, lng: 127.0450, address: '청담' }
  },
  {
    id: 'rec-4',
    title: '카페 멜로우',
    category: '카페',
    photos: ['https://images.unsplash.com/photo-1485808191679-5f86510681a2?auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80'],
    representativePhoto: 'https://images.unsplash.com/photo-1485808191679-5f86510681a2?auto=format&fit=crop&w=800&q=80',
    preference: Preference.NORMAL,
    menu: '플랫화이트, 레몬 마들렌',
    visitDate: '2024-05-15',
    companions: '혼자',
    tasteProfile: { spiciness: 1, sweetness: 3, saltiness: 1, acidity: 3, richness: 3 },
    detailedEvaluation: {
        venue: { atmosphere: ['조용한', '채광 좋은'], service: ['콘센트 많음'] },
        menu: { texture: ['촉촉한', '부드러운'], flavor: ['산뜻한', '버터미'], note: ['깔끔한', '가벼운'] }
    },
    keywords: ['조용한', '채광 좋은', '산뜻한', '혼커'],
    reviewText: '햇살 맛집. 커피는 산미가 좀 있는 편이라 라떼보다는 아메리카노가 나을 듯. 마들렌은 촉촉하니 맛있었다. 책 읽기 좋은 공간.',
    createdAt: 1715737200000,
    location: { lat: 37.5348, lng: 126.9941, address: '이태원' }
  },
  {
    id: 'rec-5',
    title: '미드나잇 하이볼',
    category: '바/술집',
    photos: ['https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=800&q=80'],
    representativePhoto: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=800&q=80',
    preference: Preference.GOOD,
    menu: '얼그레이 하이볼, 명란구이',
    visitDate: '2024-05-10',
    companions: '친구',
    tasteProfile: { spiciness: 2, sweetness: 4, saltiness: 4, acidity: 2, richness: 2 },
    detailedEvaluation: {
        venue: { atmosphere: ['노포 감성', '시끄러운'], service: ['빠른 응대'] },
        menu: { texture: ['아삭한', '촉촉한'], flavor: ['짭조름한', '알싸한'], note: ['술을 부르는', '중독성 있는'] }
    },
    keywords: ['노포 감성', '술을 부르는', '짭조름한', '활기찬'],
    reviewText: '2차로 가기 딱 좋은 곳. 하이볼 비율이 기가 막힌다. 명란구이의 짭조름함이 술을 계속 부른다. 시끌벅적해서 대화하기는 좀 힘들지만 그게 매력.',
    createdAt: 1715305200000,
    rank: 4,
    location: { lat: 37.5559, lng: 126.9240, address: '홍대' }
  },
  {
    id: 'rec-6',
    title: '버거 랩',
    category: '양식',
    photos: ['https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80'],
    representativePhoto: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80',
    preference: Preference.NORMAL,
    menu: '클래식 치즈버거',
    visitDate: '2024-05-05',
    companions: '동료',
    tasteProfile: { spiciness: 1, sweetness: 2, saltiness: 5, acidity: 2, richness: 4 },
    detailedEvaluation: {
        venue: { atmosphere: ['미국맛', '캐주얼'], service: ['셀프 서비스'] },
        menu: { texture: ['육즙가득', '바삭한'], flavor: ['기름진', '짭조름한'], note: ['자극적인', '헤비한'] }
    },
    keywords: ['육즙가득', '자극적인', '미국맛', '캐주얼'],
    reviewText: '혈관이 막히는 맛. 패티의 육즙은 훌륭하나 간이 꽤 쎄서 콜라 필수다. 번이 좀 더 부드러웠으면 좋았을 듯.',
    createdAt: 1714873200000,
    location: { lat: 37.5209, lng: 127.0227, address: '신사' }
  },
  {
    id: 'rec-7',
    title: '평양 옥',
    category: '한식',
    photos: ['https://images.unsplash.com/photo-1593361427495-9df030df1a77?auto=format&fit=crop&w=800&q=80'],
    representativePhoto: 'https://images.unsplash.com/photo-1593361427495-9df030df1a77?auto=format&fit=crop&w=800&q=80',
    preference: Preference.GOOD,
    menu: '평양냉면, 만두',
    visitDate: '2024-04-28',
    companions: '부모님',
    tasteProfile: { spiciness: 1, sweetness: 1, saltiness: 2, acidity: 2, richness: 2 },
    detailedEvaluation: {
        venue: { atmosphere: ['노포 감성', '북적이는'], service: ['빠른 응대'] },
        menu: { texture: ['쫄깃한', '부드러운'], flavor: ['담백한', '육향가득'], note: ['본연의 맛', '삼삼한'] }
    },
    keywords: ['본연의 맛', '담백한', '육향가득', '노포 감성'],
    reviewText: '처음엔 맹물 같았는데 먹을수록 올라오는 육향이 예술이다. 메밀면의 툭툭 끊기는 식감도 매력적. 만두는 평범했다.',
    createdAt: 1714268400000,
    rank: 5,
    location: { lat: 37.5663, lng: 126.9998, address: '을지로' }
  },
  {
    id: 'rec-8',
    title: '타이 앤 조이',
    category: '아시안',
    photos: ['https://images.unsplash.com/photo-1559314809-0d155014e29e?auto=format&fit=crop&w=800&q=80'],
    representativePhoto: 'https://images.unsplash.com/photo-1559314809-0d155014e29e?auto=format&fit=crop&w=800&q=80',
    preference: Preference.NORMAL,
    menu: '팟타이, 똠양꿍',
    visitDate: '2024-04-20',
    companions: '친구',
    tasteProfile: { spiciness: 3, sweetness: 4, saltiness: 3, acidity: 4, richness: 3 },
    detailedEvaluation: {
        venue: { atmosphere: ['이국적인', '활기찬'], service: ['친절한'] },
        menu: { texture: ['아삭한', '쫄깃한'], flavor: ['향신료', '새콤달콤'], note: ['현지의 맛', '호불호 갈리는'] }
    },
    keywords: ['이국적인', '새콤달콤', '현지의 맛'],
    reviewText: '똠양꿍의 산미가 제대로다. 고수 팍팍 넣어 먹으니 태국 온 기분. 팟타이는 좀 달아서 아쉬웠음.',
    createdAt: 1713577200000,
    location: { lat: 37.5340, lng: 126.9940, address: '이태원' }
  },
  {
    id: 'rec-9',
    title: '베이커리 무드',
    category: '카페',
    photos: ['https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80'],
    representativePhoto: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80',
    preference: Preference.GOOD,
    menu: '소금빵, 잠봉뵈르',
    visitDate: '2024-04-15',
    companions: '혼자',
    tasteProfile: { spiciness: 1, sweetness: 2, saltiness: 3, acidity: 1, richness: 4 },
    detailedEvaluation: {
        venue: { atmosphere: ['아늑한', '감성적'], service: ['웨이팅 있음'] },
        menu: { texture: ['바삭한', '쫄깃한'], flavor: ['버터미', '고소한'], note: ['중독성 있는', '담백한'] }
    },
    keywords: ['버터미', '바삭한', '아늑한', '중독성 있는'],
    reviewText: '소금빵의 바닥이 아주 바삭하고 버터 동굴이 크다. 겉바속촉의 정석. 잠봉뵈르는 햄이 짜지 않아서 좋았다.',
    createdAt: 1713145200000,
    rank: 6,
    location: { lat: 37.541, lng: 127.056, address: '성수' }
  },
  {
    id: 'rec-10',
    title: '스파이시 마라',
    category: '중식',
    photos: ['https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=800&q=80'],
    representativePhoto: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=800&q=80',
    preference: Preference.GOOD,
    menu: '마라탕(3단계), 꿔바로우',
    visitDate: '2024-04-10',
    companions: '친구',
    tasteProfile: { spiciness: 5, sweetness: 3, saltiness: 4, acidity: 2, richness: 4 },
    detailedEvaluation: {
        venue: { atmosphere: ['시끄러운', '캐주얼'], service: ['빠른 응대'] },
        menu: { texture: ['쫄깃한', '바삭한'], flavor: ['알싸한', '자극적인'], note: ['스트레스 풀리는', '중독성 있는'] }
    },
    keywords: ['알싸한', '자극적인', '스트레스 풀리는', '바삭한'],
    reviewText: '마라 수혈 완료. 3단계인데 꽤 맵다. 꿔바로우가 엄청 바삭해서 매운맛을 잘 중화시켜줌. 위생도 깔끔한 편.',
    createdAt: 1712713200000,
    rank: 7,
    location: { lat: 37.498, lng: 127.027, address: '강남' }
  },
  {
    id: 'rec-11',
    title: '더 스테이크',
    category: '양식',
    photos: ['https://images.unsplash.com/photo-1600891964092-4316c288032e?auto=format&fit=crop&w=800&q=80'],
    representativePhoto: 'https://images.unsplash.com/photo-1600891964092-4316c288032e?auto=format&fit=crop&w=800&q=80',
    preference: Preference.NORMAL,
    menu: '티본 스테이크',
    visitDate: '2024-04-05',
    companions: '기념일',
    tasteProfile: { spiciness: 1, sweetness: 2, saltiness: 3, acidity: 1, richness: 5 },
    detailedEvaluation: {
        venue: { atmosphere: ['로맨틱', '뷰맛집'], service: ['친절한', '예약 필수'] },
        menu: { texture: ['부드러운', '육즙가득'], flavor: ['육향가득', '담백한'], note: ['고급스러운', '가격대비 아쉬움'] }
    },
    keywords: ['로맨틱', '뷰맛집', '고급스러운', '육즙가득'],
    reviewText: '분위기와 뷰는 최고. 고기 굽기도 적당했지만, 가격에 비해 사이드 디쉬가 좀 부실하다는 느낌. 특별한 날 기분 내기는 좋다.',
    createdAt: 1712281200000,
    location: { lat: 37.525, lng: 126.925, address: '여의도' }
  },
  {
    id: 'rec-12',
    title: '제주 국수',
    category: '한식',
    photos: ['https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?auto=format&fit=crop&w=800&q=80'],
    representativePhoto: 'https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?auto=format&fit=crop&w=800&q=80',
    preference: Preference.GOOD,
    menu: '고기국수',
    visitDate: '2024-03-28',
    companions: '가족',
    tasteProfile: { spiciness: 2, sweetness: 1, saltiness: 3, acidity: 1, richness: 5 },
    detailedEvaluation: {
        venue: { atmosphere: ['정겨운', '편안한'], service: ['친절한'] },
        menu: { texture: ['부드러운', '쫄깃한'], flavor: ['진한 국물맛', '담백한'], note: ['든든한', '해장되는'] }
    },
    keywords: ['진한 국물맛', '든든한', '정겨운', '해장되는'],
    reviewText: '제주도에서 먹던 그 맛. 국물이 정말 진하고 고기도 듬뿍 들어있다. 김치랑 같이 먹으면 환상적.',
    createdAt: 1711590000000,
    rank: 8,
    location: { lat: 37.555, lng: 126.936, address: '연남' }
  },
  {
    id: 'rec-13',
    title: '블루 보틀',
    category: '카페',
    photos: ['https://images.unsplash.com/photo-1521017432531-fbd92d768814?auto=format&fit=crop&w=800&q=80'],
    representativePhoto: 'https://images.unsplash.com/photo-1521017432531-fbd92d768814?auto=format&fit=crop&w=800&q=80',
    preference: Preference.NORMAL,
    menu: '뉴올리언스',
    visitDate: '2024-03-20',
    companions: '친구',
    tasteProfile: { spiciness: 1, sweetness: 3, saltiness: 1, acidity: 2, richness: 3 },
    detailedEvaluation: {
        venue: { atmosphere: ['모던한', '미니멀'], service: ['전문적인'] },
        menu: { texture: ['부드러운'], flavor: ['고소한', '은은한 단맛'], note: ['깔끔한', '대기가 긴'] }
    },
    keywords: ['모던한', '깔끔한', '고소한'],
    reviewText: '라떼는 확실히 맛있다. 우유가 고소함. 근데 사람이 너무 많아서 앉을 자리가 없다. 테이크아웃 추천.',
    createdAt: 1710898800000,
    location: { lat: 37.546, lng: 127.042, address: '성수' }
  },
  {
    id: 'rec-14',
    title: '서울 브루어리',
    category: '바/술집',
    photos: ['https://images.unsplash.com/photo-1518176258769-f227c798150e?auto=format&fit=crop&w=800&q=80'],
    representativePhoto: 'https://images.unsplash.com/photo-1518176258769-f227c798150e?auto=format&fit=crop&w=800&q=80',
    preference: Preference.GOOD,
    menu: 'IPA, 감자튀김',
    visitDate: '2024-03-15',
    companions: '친구',
    tasteProfile: { spiciness: 1, sweetness: 2, saltiness: 4, acidity: 3, richness: 3 },
    detailedEvaluation: {
        venue: { atmosphere: ['힙한', '탁 트인'], service: ['친절한'] },
        menu: { texture: ['바삭한', '탄산감'], flavor: ['과일향', '쌉싸름한'], note: ['청량한', '분위기 좋은'] }
    },
    keywords: ['힙한', '과일향', '청량한', '맥주 맛집'],
    reviewText: '수제맥주 퀄리티가 훌륭하다. 특히 IPA의 향이 너무 좋음. 안주는 평범하지만 맥주가 다 했다.',
    createdAt: 1710466800000,
    rank: 9,
    location: { lat: 37.549, lng: 127.051, address: '성수' }
  },
  {
    id: 'rec-15',
    title: '딤섬 가든',
    category: '중식',
    photos: ['https://images.unsplash.com/photo-1496116218417-1a781b1c423c?auto=format&fit=crop&w=800&q=80'],
    representativePhoto: 'https://images.unsplash.com/photo-1496116218417-1a781b1c423c?auto=format&fit=crop&w=800&q=80',
    preference: Preference.GOOD,
    menu: '샤오롱바오, 하가우',
    visitDate: '2024-03-10',
    companions: '가족',
    tasteProfile: { spiciness: 1, sweetness: 2, saltiness: 3, acidity: 1, richness: 4 },
    detailedEvaluation: {
        venue: { atmosphere: ['깔끔한', '단체석'], service: ['빠른 응대'] },
        menu: { texture: ['탱글한', '촉촉한'], flavor: ['육즙가득', '담백한'], note: ['현지의 맛', '재방문 필수'] }
    },
    keywords: ['육즙가득', '탱글한', '현지의 맛', '깔끔한'],
    reviewText: '샤오롱바오 육즙이 미쳤다. 뜨거울 때 호로록 먹어야 함. 새우 들어간 하가우도 탱글탱글하니 식감이 살아있다.',
    createdAt: 1710034800000,
    rank: 10,
    location: { lat: 37.513, lng: 127.058, address: '삼성' }
  },
  {
    id: 'rec-16',
    title: '텐동 요시',
    category: '일식',
    photos: ['https://images.unsplash.com/photo-1626804475297-411dbe6314f3?auto=format&fit=crop&w=800&q=80'],
    representativePhoto: 'https://images.unsplash.com/photo-1626804475297-411dbe6314f3?auto=format&fit=crop&w=800&q=80',
    preference: Preference.NORMAL,
    menu: '에비 텐동',
    visitDate: '2024-03-01',
    companions: '혼자',
    tasteProfile: { spiciness: 1, sweetness: 3, saltiness: 4, acidity: 1, richness: 5 },
    detailedEvaluation: {
        venue: { atmosphere: ['조용한', '혼밥 환영'], service: ['친절한'] },
        menu: { texture: ['바삭한', '기름진'], flavor: ['고소한', '짭조름한'], note: ['든든한', '느끼한'] }
    },
    keywords: ['바삭한', '혼밥 환영', '든든한'],
    reviewText: '튀김은 정말 바삭하고 맛있는데 먹다 보면 좀 느끼하다. 와사비랑 꽈리고추가 필수. 혼밥하기엔 편한 분위기.',
    createdAt: 1709257200000,
    location: { lat: 37.484, lng: 126.972, address: '서울대입구' }
  },
  {
    id: 'rec-17',
    title: '비건 테이블',
    category: '양식',
    photos: ['https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80'],
    representativePhoto: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80',
    preference: Preference.GOOD,
    menu: '후무스 샐러드',
    visitDate: '2024-02-25',
    companions: '친구',
    tasteProfile: { spiciness: 1, sweetness: 2, saltiness: 2, acidity: 3, richness: 3 },
    detailedEvaluation: {
        venue: { atmosphere: ['건강한', '밝은'], service: ['설명 잘해주는'] },
        menu: { texture: ['부드러운', '아삭한'], flavor: ['담백한', '고소한'], note: ['건강한 맛', '속이 편한'] }
    },
    keywords: ['건강한 맛', '담백한', '속이 편한', '밝은'],
    reviewText: '비건 음식이 이렇게 맛있을 수 있다니. 후무스가 정말 크리미하고 고소하다. 먹고 나서도 속이 편해서 좋음.',
    createdAt: 1708825200000,
    rank: 11,
    location: { lat: 37.538, lng: 127.002, address: '한남' }
  },
  {
    id: 'rec-18',
    title: '곱창 전골집',
    category: '한식',
    photos: ['https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80'],
    representativePhoto: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80',
    preference: Preference.GOOD,
    menu: '소곱창 전골',
    visitDate: '2024-02-15',
    companions: '회식',
    tasteProfile: { spiciness: 4, sweetness: 2, saltiness: 4, acidity: 1, richness: 5 },
    detailedEvaluation: {
        venue: { atmosphere: ['시끄러운', '노포 감성'], service: ['빠른 응대'] },
        menu: { texture: ['쫄깃한', '녹진한'], flavor: ['얼큰한', '진한 국물맛'], note: ['술안주', '중독성 있는'] }
    },
    keywords: ['얼큰한', '술안주', '노포 감성', '쫄깃한'],
    reviewText: '소주를 부르는 맛. 국물이 엄청 진하고 곱창에 곱이 가득 차 있다. 볶음밥은 선택이 아닌 필수.',
    createdAt: 1707961200000,
    rank: 12,
    location: { lat: 37.566, lng: 126.978, address: '시청' }
  },
  {
    id: 'rec-19',
    title: '베트남 쌀국수',
    category: '아시안',
    photos: ['https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=800&q=80'],
    representativePhoto: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=800&q=80',
    preference: Preference.NORMAL,
    menu: '양지 쌀국수',
    visitDate: '2024-02-05',
    companions: '혼자',
    tasteProfile: { spiciness: 1, sweetness: 2, saltiness: 3, acidity: 2, richness: 3 },
    detailedEvaluation: {
        venue: { atmosphere: ['편안한', '혼밥 적합'], service: ['키오스크'] },
        menu: { texture: ['부드러운'], flavor: ['담백한', '향신료'], note: ['무난한', '가성비 좋은'] }
    },
    keywords: ['담백한', '혼밥 적합', '가성비 좋은'],
    reviewText: '국물이 깔끔하고 고기도 넉넉하게 들어있다. 점심에 간단하게 먹기 좋음. 고수 많이 달라고 하면 많이 줌.',
    createdAt: 1707097200000,
    location: { lat: 37.502, lng: 127.036, address: '역삼' }
  },
  {
    id: 'rec-20',
    title: '와인 바 비노',
    category: '바/술집',
    photos: ['https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=800&q=80'],
    representativePhoto: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=800&q=80',
    preference: Preference.GOOD,
    menu: '레드 와인, 치즈 플래터',
    visitDate: '2024-01-30',
    companions: '연인',
    tasteProfile: { spiciness: 1, sweetness: 3, saltiness: 3, acidity: 3, richness: 4 },
    detailedEvaluation: {
        venue: { atmosphere: ['로맨틱', '조용한'], service: ['설명 잘해주는'] },
        menu: { texture: ['부드러운'], flavor: ['과일향', '오크향'], note: ['분위기 좋은', '고급스러운'] }
    },
    keywords: ['로맨틱', '와인 맛집', '분위기 좋은'],
    reviewText: '조용하게 대화하기 너무 좋은 곳. 추천받은 와인이 내 취향에 딱 맞았다. 치즈 플레이팅도 예쁘고 음악 선곡도 좋음.',
    createdAt: 1706578800000,
    rank: 13,
    location: { lat: 37.536, lng: 126.901, address: '망원' }
  }
];

const App: React.FC = () => {
  const [records, setRecords] = useState<ReviewRecord[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        const parsedData = JSON.parse(saved);
        if (Array.isArray(parsedData) && parsedData.length > 0) {
          setRecords(parsedData);
        } else {
          setRecords(SAMPLE_RECORDS);
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(SAMPLE_RECORDS));
        }
      } catch (e) {
        setRecords(SAMPLE_RECORDS);
      }
    } else {
      setRecords(SAMPLE_RECORDS);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(SAMPLE_RECORDS));
    }
  }, []);

  useEffect(() => {
    if (records.length > 0) {
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(records));
      } catch (error) {
         console.warn("Storage quota exceeded");
      }
    }
  }, [records]);

  const handleSaveRecord = (newRecord: ReviewRecord, updatedRecords?: ReviewRecord[]) => {
    setRecords(prev => {
        let nextState = [...prev];
        if (updatedRecords && updatedRecords.length > 0) {
           const updatedMap = new Map(updatedRecords.map(r => [r.id, r]));
           nextState = nextState.map(r => updatedMap.get(r.id) || r);
        }
        return [newRecord, ...nextState];
    });
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home records={records} />} />
        <Route path="/feed" element={<Feed />} />
        <Route path="/discover" element={<Discover userRecords={records} />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/create" element={<CreateRecord onSave={handleSaveRecord} existingRecords={records} />} />
        <Route path="/record/:id" element={<RecordDetail records={records} />} />
        <Route path="/profile/:userId" element={<UserProfile currentUserRecords={records} />} />
        <Route path="/achievement" element={<Achievement records={records} />} />
        <Route path="/restaurant/:id" element={<RestaurantDetail userRecords={records} />} />
      </Routes>
    </Router>
  );
};

export default App;
