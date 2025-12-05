
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
    id: 'sample-1',
    title: '스시 오마카세 젠',
    category: '일식',
    photos: ['https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=800&q=80'],
    representativePhoto: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=800&q=80',
    preference: Preference.GOOD,
    menu: '런치 오마카세',
    visitDate: '2024-05-21',
    companions: '연인',
    tasteProfile: { spiciness: 1, sweetness: 2, saltiness: 3, acidity: 4, richness: 3 },
    detailedEvaluation: {
        venue: { atmosphere: ['차분한', '프라이빗'], service: ['전문적인', '섬세한'] },
        menu: { texture: ['입안에서 녹는', '찰진'], flavor: ['감칠맛', '숙성된 맛'], note: ['여운이 긴', '정갈한'] }
    },
    keywords: ['차분한', '입안에서 녹는', '감칠맛', '정갈한'],
    reviewText: '입안에서 부드럽게 녹아내리는 네타의 숙성도가 훌륭하다. 샤리의 간은 적당하며, 은은한 산미가 생선의 감칠맛을 돋보이게 한다. 정갈한 분위기 속에서 즐기는 미식의 여운이 길게 남는다.',
    createdAt: 1716256000000,
    rank: 1,
    location: { lat: 37.5237, lng: 127.0419, address: '청담' }
  },
  {
    id: 'sample-2',
    title: '성수동 파스타 클럽',
    category: '이탈리안',
    photos: ['https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=800&q=80'],
    representativePhoto: 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=800&q=80',
    preference: Preference.GOOD,
    menu: '트러플 크림 뇨끼',
    visitDate: '2024-05-20',
    companions: '친구',
    tasteProfile: { spiciness: 1, sweetness: 1, saltiness: 4, acidity: 1, richness: 5 },
    detailedEvaluation: {
        venue: { atmosphere: ['힙한', '캐주얼'], service: ['웨이팅 필수'] },
        menu: { texture: ['쫄깃한', '꾸덕한'], flavor: ['트러플향', '크리미한'], note: ['풍성한', '와인을 부르는'] }
    },
    keywords: ['힙한', '쫄깃한', '트러플향', '꾸덕한'],
    reviewText: '진득한 크림 소스의 풍미가 혀끝을 감싸며 강렬한 인상을 남긴다. 뇨끼의 쫄깃한 텍스처와 트러플의 향이 완벽한 밸런스를 이루며, 묵직한 바디감이 식사 후에도 기분 좋은 포만감을 선사한다.',
    createdAt: 1716170000000,
    rank: 2,
    location: { lat: 37.5446, lng: 127.0559, address: '성수' }
  },
  {
    id: 'sample-3',
    title: '청담 숯불갈비',
    category: '한식',
    photos: ['https://images.unsplash.com/photo-1594041680534-e8c8cdebd659?auto=format&fit=crop&w=800&q=80'],
    representativePhoto: 'https://images.unsplash.com/photo-1594041680534-e8c8cdebd659?auto=format&fit=crop&w=800&q=80',
    preference: Preference.NORMAL,
    menu: '양념 소갈비',
    visitDate: '2024-05-15',
    companions: '가족',
    tasteProfile: { spiciness: 1, sweetness: 4, saltiness: 3, acidity: 1, richness: 4 },
    detailedEvaluation: {
        venue: { atmosphere: ['활기찬', '노포 감성'], service: ['친절한', '주차가능'] },
        menu: { texture: ['야들야들', '부드러운'], flavor: ['숯불향', '육향가득'], note: ['밥도둑', '호불호 없는'] }
    },
    keywords: ['활기찬', '야들야들', '숯불향', '밥도둑'],
    reviewText: '육질은 놀라울 정도로 부드럽고, 달콤한 양념이 고기 깊숙이 배어있다. 다만 단맛이 다소 강해 후반부에는 쉽게 물리는 경향이 있다. 활기찬 분위기는 가족 모임에 적합하다.',
    createdAt: 1715700000000,
    location: { lat: 37.5250, lng: 127.0450, address: '청담' }
  },
  {
    id: 'sample-4',
    title: '카페 멜로우',
    category: '카페',
    photos: ['https://images.unsplash.com/photo-1485808191679-5f86510681a2?auto=format&fit=crop&w=800&q=80'],
    representativePhoto: 'https://images.unsplash.com/photo-1485808191679-5f86510681a2?auto=format&fit=crop&w=800&q=80',
    preference: Preference.NORMAL,
    menu: '아이스 아메리카노, 치즈 케이크',
    visitDate: '2024-05-10',
    companions: '혼자',
    tasteProfile: { spiciness: 1, sweetness: 4, saltiness: 1, acidity: 3, richness: 4 },
    detailedEvaluation: {
        venue: { atmosphere: ['조용한', '채광 좋은'], service: ['콘센트 많음', '혼밥 환영'] },
        menu: { texture: ['촉촉한', '부드러운'], flavor: ['진한 치즈맛', '산뜻한'], note: ['깔끔한', '가벼운'] }
    },
    keywords: ['조용한', '촉촉한', '진한 치즈맛', '깔끔한'],
    reviewText: '진한 치즈의 풍미가 돋보이는 케이크와 산미 있는 커피의 조화가 무난하다. 특별한 임팩트는 없지만 편안한 분위기에서 가볍게 즐기기 좋은 구성이다.',
    createdAt: 1715300000000,
    location: { lat: 37.5348, lng: 126.9941, address: '이태원' }
  },
  {
    id: 'sample-5',
    title: '파이어 버거',
    category: '양식',
    photos: ['https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80'],
    representativePhoto: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80',
    preference: Preference.BAD,
    menu: '더블 스파이시 버거',
    visitDate: '2024-05-01',
    companions: '친구',
    tasteProfile: { spiciness: 5, sweetness: 2, saltiness: 5, acidity: 2, richness: 5 },
    detailedEvaluation: {
        venue: { atmosphere: ['시끄러운', '힙한'], service: ['웨이팅 필수'] },
        menu: { texture: ['묵직한', '퍽퍽한'], flavor: ['자극적인', '매콤달콤'], note: ['실망스러운', '밸런스 붕괴'] }
    },
    keywords: ['자극적인', '묵직한', '실망스러운'],
    reviewText: '압도적인 짠맛과 통제되지 않은 매운맛이 재료 본연의 맛을 완전히 가려버렸다. 묵직한 패티의 식감은 나쁘지 않았으나, 전체적인 밸런스가 무너져 미식으로서의 즐거움을 찾기 어려웠다.',
    createdAt: 1714500000000,
    location: { lat: 37.5386, lng: 127.0024, address: '한남' }
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
