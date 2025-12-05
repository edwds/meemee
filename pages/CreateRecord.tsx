import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, X, Wand2, Users, Calendar, Sparkles, Trophy, Swords, ChefHat, Tag, Utensils, Loader2, MapPin, Check, AlignLeft, Lightbulb, Coffee, Volume2, Smile, ThumbsUp, Music, Armchair, Car, Accessibility, DollarSign, Gift, Zap } from 'lucide-react';
import { Layout } from '../components/Layout';
import { Button } from '../components/Button';
import { Preference, TasteProfile, ReviewRecord, DetailedEvaluation } from '../types';
import { analyzeImageContext } from '../services/geminiService';
import { calculateGourmetMBTI } from '../utils/gamification';
import * as EXIF from 'exif-js';

const EXIF_LIB = EXIF as any;

interface CreateRecordProps {
  onSave: (record: ReviewRecord, updatedRecords?: ReviewRecord[]) => void;
  existingRecords?: ReviewRecord[];
}

const STEPS = {
  PHOTOS: 0,
  DETAILS: 1,
  PREFERENCE: 2,
  DETAILED_EVAL: 3,
  WRITING: 4,
  RANKING: 5,
};

interface RankingState {
  status: 'idle' | 'comparing' | 'finished';
  low: number;
  high: number;
  mid: number;
  sortedExisting: ReviewRecord[];
}

interface LocationInfo {
  lat: number;
  lng: number;
}

// Extensive Gourmet Keyword Data
const GOURMET_KEYWORDS = {
  menu: {
    texture: [
      '바삭한', '쫄깃한', '부드러운', '녹진한', '탱글한', 
      '꾸덕한', '아삭한', '포슬포슬한', '촉촉한', '찰진',
      '꼬들꼬들', '오독오독', '야들야들', '몽글몽글', '쥬시한',
      '크리스피', '쫀득한', '입안에서 녹는', '탄력있는', '질기지 않은',
      '파삭한', '묵직한', '가벼운', '부들부들', '씹는맛이 좋은'
    ],
    flavor: [
      '불향', '버터미', '산뜻한', '고소한', '감칠맛', 
      '크리미한', '시트러스', '스모키한', '허브향', '육향가득',
      '트러플향', '은은한 단맛', '깊은 국물맛', '잡내 없는', '알싸한',
      '숯불향', '과일향', '견과류 풍미', '진한 치즈맛', '담백한',
      '짭조름한', '매콤달콤', '비리지 않은', '숙성된 맛', '구수한'
    ],
    note: [
      '본연의 맛', '이색적인', '복합적인', '자극적인', '삼삼한',
      '깔끔한', '여운이 긴', '밸런스 좋은', '정갈한', '고급스러운',
      '중독성 있는', '술을 부르는', '밥도둑', '해장되는', '현지의 맛',
      '창의적인', '조화로운', '풍성한', '건강한 맛', '실망시키지 않는',
      '가정식 느낌', '호불호 없는', '독창적인', '재료가 신선한', '플레이팅이 예쁜'
    ]
  },
  venue: {
    atmosphere: [
      '모던한', '클래식한', '힙한', '차분한', '활기찬', 
      '로맨틱', '뷰맛집', '이국적인', '미니멀', '빈티지',
      '아늑한', '세련된', '조용한', '시끄러운', '노포 감성',
      '인스타감성', '탁 트인', '프라이빗', '채광 좋은', '음악 맛집',
      '레트로', '고즈넉한', '화려한', '편안한', '이색 데이트'
    ],
    service: [
      '친절한', '전문적인', '섬세한', '빠른 응대', '주차가능',
      '프라이빗', '단체석', '콜키지프리', '반려동물 동반', '예약 필수',
      '웨이팅 필수', '혼밥 환영', '청결한', '화장실 깨끗', '콘센트 많음'
    ]
  }
};

export const CreateRecord: React.FC<CreateRecordProps> = ({ onSave, existingRecords = [] }) => {
  const navigate = useNavigate();
  const [step, setStep] = useState(STEPS.PHOTOS);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [area, setArea] = useState('');
  const [visitDate, setVisitDate] = useState('');
  const [companions, setCompanions] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [preference, setPreference] = useState<Preference | null>(null);
  const [menu, setMenu] = useState('');
  const [location, setLocation] = useState<LocationInfo | null>(null);
  const [reviewText, setReviewText] = useState('');
  
  // Taste Profile State
  const [tasteProfile, setTasteProfile] = useState<TasteProfile>({
    spiciness: 1, sweetness: 1, saltiness: 1, acidity: 1, richness: 1
  });

  // Detailed Evaluation State - Gourmet Structure
  const [detailedEval, setDetailedEval] = useState<DetailedEvaluation>({
    venue: { atmosphere: [], service: [] },
    menu: { texture: [], flavor: [], note: [] }
  });

  const [recommendedTags, setRecommendedTags] = useState<string[]>([]);
  
  // Ranking State
  const [rankingState, setRankingState] = useState<RankingState>({
    status: 'idle', low: 0, high: 0, mid: 0, sortedExisting: []
  });
  
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setVisitDate(today);
  }, []);

  // Ranking Logic Initialization
  useEffect(() => {
    if (step === STEPS.RANKING) {
      const goodRecords = existingRecords
        .filter(r => r.preference === Preference.GOOD)
        .sort((a, b) => (a.rank || 999) - (b.rank || 999));

      if (goodRecords.length === 0) {
        handleFinalSave(1, []);
      } else {
        setRankingState({
          status: 'comparing',
          low: 0,
          high: goodRecords.length - 1,
          mid: Math.floor((0 + goodRecords.length - 1) / 2),
          sortedExisting: goodRecords
        });
      }
    }
  }, [step]);

  // EXIF & Image Helpers
  const toDecimal = (number: number[], ref: string) => {
      if (!number || number.length < 3) return 0;
      let decimal = number[0] + number[1] / 60 + number[2] / 3600;
      return (ref === "S" || ref === "W") ? decimal * -1 : decimal;
  };

  const getExifData = (file: File): Promise<{ date: string | null, location: LocationInfo | null }> => {
    return new Promise((resolve) => {
      if (!EXIF_LIB || !EXIF_LIB.getData) {
        resolve({ date: null, location: null });
        return;
      }
      try {
        EXIF_LIB.getData(file as any, function(this: any) {
          const result: { date: string | null, location: LocationInfo | null } = { date: null, location: null };
          const dateString = EXIF_LIB.getTag(this, "DateTimeOriginal");
          if (dateString) {
            const [datePart] = dateString.split(' ');
            result.date = datePart.replace(/:/g, '-');
          }
          const lat = EXIF_LIB.getTag(this, "GPSLatitude");
          const latRef = EXIF_LIB.getTag(this, "GPSLatitudeRef");
          const lng = EXIF_LIB.getTag(this, "GPSLongitude");
          const lngRef = EXIF_LIB.getTag(this, "GPSLongitudeRef");

          if (lat && lng && latRef && lngRef) {
              result.location = {
                  lat: toDecimal(lat, latRef),
                  lng: toDecimal(lng, lngRef)
              };
          }
          resolve(result);
        });
      } catch (e) {
        resolve({ date: null, location: null });
      }
    });
  };

  const resizeImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_SIZE = 800;
          let width = img.width;
          let height = img.height;
          if (width > height) {
            if (width > MAX_SIZE) { height *= MAX_SIZE / width; width = MAX_SIZE; }
          } else {
            if (height > MAX_SIZE) { width *= MAX_SIZE / height; height = MAX_SIZE; }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.7));
        };
        img.onerror = (e) => reject(e);
      };
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files) as File[];
      const newPhotos: string[] = [];
      const dates: string[] = [];
      const locs: LocationInfo[] = [];

      try {
        for (const file of files) {
          const resized = await resizeImage(file);
          newPhotos.push(resized);
          const exif = await getExifData(file);
          if (exif.date) dates.push(exif.date);
          if (exif.location) locs.push(exif.location);
        }
        setPhotos(prev => [...prev, ...newPhotos].slice(0, 10));
        if (dates.length > 0) setVisitDate(dates[0]);
        if (locs.length > 0 && !location) setLocation(locs[0]);
      } catch (error) {
        alert("이미지 처리 중 오류가 발생했습니다.");
      }
    }
  };

  const handleAnalyzeAndNext = async () => {
    if (photos.length === 0) return;
    setIsAnalyzing(true);
    try {
      const result = await analyzeImageContext(photos);
      if (result.placeName) setTitle(result.placeName);
      if (result.category) setCategory(result.category);
      if (result.menu) setMenu(result.menu);
      if (result.area) setArea(result.area);
      if (result.keywords) setRecommendedTags(result.keywords);
      setStep(STEPS.DETAILS);
    } catch (error) {
      setStep(STEPS.DETAILS);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleTasteChange = (key: keyof TasteProfile, value: number) => {
    setTasteProfile(prev => ({ ...prev, [key]: value }));
  };

  // Improved Tag Handling
  const toggleEvalTag = (category: 'venue' | 'menu', subCategory: string, tag: string) => {
    setDetailedEval(prev => {
      const catKey = category as keyof DetailedEvaluation;
      const subKey = subCategory as keyof DetailedEvaluation[typeof catKey];
      const currentList = prev[catKey][subKey] as string[];
      
      const newList = currentList.includes(tag) 
        ? currentList.filter(t => t !== tag) 
        : [...currentList, tag];
      
      return {
        ...prev,
        [category]: {
          ...prev[category],
          [subCategory]: newList
        }
      };
    });
  };

  const handleComparisonChoice = (winner: 'new' | 'existing') => {
    const { low, high, mid } = rankingState;
    let newLow = low;
    let newHigh = high;
    if (winner === 'new') newHigh = mid - 1;
    else newLow = mid + 1;

    if (newLow > newHigh) finishRanking(newLow);
    else setRankingState(prev => ({ ...prev, low: newLow, high: newHigh, mid: Math.floor((newLow + newHigh) / 2) }));
  };

  const finishRanking = (insertIndex: number) => {
    const { sortedExisting } = rankingState;
    const newRank = insertIndex + 1;
    const updatedRecords = sortedExisting.map((record, index) => {
      if (index >= insertIndex) return { ...record, rank: (record.rank || index + 1) + 1 }; 
      return record;
    });
    handleFinalSave(newRank, updatedRecords);
  };

  const handleNextAfterEval = () => {
    setStep(STEPS.WRITING);
  };

  const handleFinalSave = (rank?: number, updatedRecords: ReviewRecord[] = []) => {
    if (!title) return alert('식당 이름을 입력해주세요.');
    const recordId = Date.now().toString();
    const finalLocation = location ? { lat: location.lat, lng: location.lng, address: area || 'Unknown' } : {
        lat: 37.5665 + (Math.random() * 0.02 - 0.01),
        lng: 126.9780 + (Math.random() * 0.02 - 0.01),
        address: area || '서울'
    };
    
    // Combine all selected tags into keywords
    const allKeywords = [
        ...detailedEval.venue.atmosphere,
        ...detailedEval.venue.service,
        ...detailedEval.menu.texture,
        ...detailedEval.menu.flavor,
        ...detailedEval.menu.note
    ];

    const newRecord: ReviewRecord = {
      id: recordId, title, category, photos, representativePhoto: photos[0] || '',
      preference: preference || Preference.NORMAL, menu, visitDate, companions,
      tasteProfile, detailedEvaluation: detailedEval, keywords: allKeywords,
      reviewText: reviewText, createdAt: Date.now(), rank, location: finalLocation
    };
    
    onSave(newRecord, updatedRecords);
    navigate('/');
  };

  // --- RENDER STEPS ---
  const renderPhotosStep = () => (
    <div className="h-full relative flex flex-col">
      <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar pb-32">
        <div className="text-center space-y-2 mb-6 mt-4">
          <h2 className="text-2xl font-bold text-secondary">어떤 미식이었나요?</h2>
          <p className="text-lg text-gray-500">맛있는 순간의 사진을 골라주세요</p>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <label className="aspect-square rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition active:scale-95">
            <Camera className="text-gray-400 mb-2" size={32} />
            <span className="text-sm text-gray-500 font-medium">사진 추가</span>
            <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
          </label>
          {photos.map((photo, idx) => (
            <div key={idx} className="aspect-square rounded-xl overflow-hidden relative shadow-sm border border-gray-200">
              <img src={photo} className="w-full h-full object-cover" />
              <button onClick={() => setPhotos(p => p.filter((_, i) => i !== idx))} className="absolute top-1 right-1 bg-black/60 text-white p-1.5 rounded-full"><X size={16} /></button>
            </div>
          ))}
        </div>
      </div>
      {isAnalyzing && (
        <div className="absolute inset-0 bg-white/90 backdrop-blur-sm z-[60] flex flex-col items-center justify-center text-center p-6">
          <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mb-6 relative">
             <Loader2 size={40} className="text-primary animate-spin" />
             <Wand2 size={20} className="absolute text-primary" />
          </div>
          <h3 className="text-xl font-bold text-secondary mb-2">미식 데이터 분석 중</h3>
          <p className="text-base text-gray-500">메뉴와 장소를 확인하고 있어요...</p>
        </div>
      )}
      <div className="absolute bottom-0 left-0 w-full p-4 pb-10 bg-white border-t border-gray-100 z-50">
          <Button fullWidth size="lg" disabled={photos.length === 0 || isAnalyzing} onClick={handleAnalyzeAndNext}>다음으로</Button>
      </div>
    </div>
  );

  const renderDetailsStep = () => (
    <div className="h-full relative flex flex-col">
        <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar pb-32">
            <h2 className="text-2xl font-bold text-secondary mb-6 mt-4">기본 정보를<br/>확인해주세요</h2>
            <div className="space-y-6">
                <div className="space-y-1.5">
                    <label className="text-sm font-bold text-gray-500 uppercase ml-1">장소 이름</label>
                    <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full p-4 bg-white border border-gray-200 rounded-2xl text-base font-semibold text-gray-900" placeholder="예: 오마카세 스시선" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <label className="text-sm font-bold text-gray-500 uppercase ml-1">카테고리</label>
                        <input type="text" value={category} onChange={(e) => setCategory(e.target.value)} className="w-full p-3.5 bg-white border border-gray-200 rounded-2xl text-base font-medium text-gray-900" placeholder="예: 한식" />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-sm font-bold text-gray-500 uppercase ml-1">지역</label>
                        <input type="text" value={area} onChange={(e) => setArea(e.target.value)} className="w-full p-3.5 bg-white border border-gray-200 rounded-2xl text-base font-medium text-gray-900" placeholder="예: 성수동" />
                    </div>
                </div>
                <div className="space-y-1.5">
                    <label className="text-sm font-bold text-gray-500 uppercase ml-1">먹은 메뉴</label>
                    <input type="text" value={menu} onChange={(e) => setMenu(e.target.value)} className="w-full p-4 bg-white border border-gray-200 rounded-2xl text-base font-medium text-gray-900" placeholder="메뉴 입력" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <label className="text-sm font-bold text-gray-500 uppercase ml-1">날짜</label>
                        <input type="date" value={visitDate} onChange={(e) => setVisitDate(e.target.value)} className="w-full p-3.5 bg-white border border-gray-200 rounded-2xl text-base font-medium text-gray-900" />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-sm font-bold text-gray-500 uppercase ml-1">함께한 사람</label>
                        <input type="text" value={companions} onChange={(e) => setCompanions(e.target.value)} className="w-full p-3.5 bg-white border border-gray-200 rounded-2xl text-base font-medium text-gray-900" placeholder="혼자" />
                    </div>
                </div>
            </div>
        </div>
        <div className="absolute bottom-0 left-0 w-full p-4 pb-10 bg-white border-t border-gray-100 z-50">
            <Button fullWidth size="lg" disabled={!title} onClick={() => setStep(STEPS.PREFERENCE)}>다음으로</Button>
        </div>
    </div>
  );

  const renderPreferenceStep = () => (
    <div className="h-full relative flex flex-col justify-between">
      <div className="flex-1 flex flex-col justify-center px-6">
        <h2 className="text-2xl font-bold text-secondary text-center mb-10">전반적인 경험은 어땠나요?</h2>
        <div className="grid grid-cols-1 gap-4">
            {[Preference.GOOD, Preference.NORMAL, Preference.BAD].map((p) => (
            <button
                key={p}
                onClick={() => { setPreference(p); setStep(STEPS.DETAILED_EVAL); }}
                className={`p-6 rounded-2xl font-medium transition-all flex items-center justify-between border-2 active:scale-95 ${
                preference === p
                    ? 'border-primary bg-orange-50 text-primary'
                    : 'border-gray-100 bg-white text-gray-500 hover:border-gray-200'
                }`}
            >
                <span className="text-lg font-bold">{p}</span>
                <span className="text-4xl">{p === Preference.GOOD ? '😍' : p === Preference.NORMAL ? '🙂' : '😢'}</span>
            </button>
            ))}
        </div>
      </div>
    </div>
  );

  const renderDetailedEvalStep = () => (
    <div className="h-full relative flex flex-col">
      <div className="flex-1 overflow-y-auto p-6 space-y-10 no-scrollbar pb-32">
        <div className="mt-4">
            <h2 className="text-2xl font-bold text-secondary mb-2">미식 디테일</h2>
            <p className="text-gray-500 text-sm">맛과 경험을 상세하게 기록해보세요.</p>
        </div>
        
        {/* TAB 1: MENU EVALUATION (The Palate) */}
        <section>
          <div className="flex items-center gap-2 mb-6">
              <span className="bg-primary text-white p-1.5 rounded-lg"><ChefHat size={18}/></span>
              <h3 className="text-lg font-bold text-secondary">The Palate (맛)</h3>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-8 mb-8">
             {/* Taste Balance Sliders */}
             <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Taste Balance</h4>
                <div className="space-y-6">
                    {(Object.keys(tasteProfile).map((k) => (
                    <div key={k}>
                        <div className="flex justify-between mb-2 px-1">
                            <span className="text-sm font-bold text-gray-700 capitalize w-20">{k.slice(0,3)}</span>
                            <span className="text-xs font-medium text-primary">
                                {tasteProfile[k as keyof TasteProfile] <= 2 ? '부족/연함' : tasteProfile[k as keyof TasteProfile] === 3 ? '적당함' : '강함/풍부'}
                            </span>
                        </div>
                        <div className="flex gap-1.5 h-10">
                        {[1,2,3,4,5].map(n => (
                            <button 
                                key={n} 
                                onClick={() => handleTasteChange(k as any, n)} 
                                className={`flex-1 rounded-lg transition-all duration-200 ${
                                    tasteProfile[k as keyof TasteProfile] >= n 
                                    ? n <= 2 ? 'bg-orange-200' : n === 3 ? 'bg-orange-400' : 'bg-primary' 
                                    : 'bg-gray-100 hover:bg-gray-200'
                                }`}
                            />
                        ))}
                        </div>
                        <div className="flex justify-between mt-1 px-1 text-[10px] text-gray-400 font-medium">
                            <span>Weak</span>
                            <span>Balanced</span>
                            <span>Bold</span>
                        </div>
                    </div>
                    )))}
                </div>
             </div>
             
             {/* Gourmet Keywords */}
             <div className="space-y-5 pt-4 border-t border-gray-50">
                 <div>
                    <label className="text-xs font-bold text-gray-500 mb-3 block">식감 (Texture)</label>
                    <div className="flex flex-wrap gap-2">
                        {GOURMET_KEYWORDS.menu.texture.map(tag => (
                        <button key={tag} onClick={() => toggleEvalTag('menu', 'texture', tag)} className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all active:scale-95 ${detailedEval.menu.texture.includes(tag) ? 'bg-primary text-white border-primary shadow-sm' : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'}`}>{tag}</button>
                        ))}
                    </div>
                 </div>
                 <div>
                    <label className="text-xs font-bold text-gray-500 mb-3 block">향미 (Flavor)</label>
                    <div className="flex flex-wrap gap-2">
                        {GOURMET_KEYWORDS.menu.flavor.map(tag => (
                        <button key={tag} onClick={() => toggleEvalTag('menu', 'flavor', tag)} className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all active:scale-95 ${detailedEval.menu.flavor.includes(tag) ? 'bg-primary text-white border-primary shadow-sm' : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'}`}>{tag}</button>
                        ))}
                    </div>
                 </div>
                 <div>
                    <label className="text-xs font-bold text-gray-500 mb-3 block">뉘앙스 (Note)</label>
                    <div className="flex flex-wrap gap-2">
                        {GOURMET_KEYWORDS.menu.note.map(tag => (
                        <button key={tag} onClick={() => toggleEvalTag('menu', 'note', tag)} className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all active:scale-95 ${detailedEval.menu.note.includes(tag) ? 'bg-primary text-white border-primary shadow-sm' : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'}`}>{tag}</button>
                        ))}
                    </div>
                 </div>
             </div>
          </div>
        </section>

        {/* TAB 2: VENUE EVALUATION (The Vibe) */}
        <section>
           <div className="flex items-center gap-2 mb-6">
              <span className="bg-secondary text-white p-1.5 rounded-lg"><Armchair size={18}/></span>
              <h3 className="text-lg font-bold text-secondary">The Vibe (공간)</h3>
           </div>
           
           <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-6">
              <div>
                  <label className="text-xs font-bold text-gray-500 mb-3 block">분위기 (Atmosphere)</label>
                  <div className="flex flex-wrap gap-2">
                    {GOURMET_KEYWORDS.venue.atmosphere.map(tag => (
                      <button key={tag} onClick={() => toggleEvalTag('venue', 'atmosphere', tag)} className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all active:scale-95 ${detailedEval.venue.atmosphere.includes(tag) ? 'bg-secondary text-white border-secondary shadow-sm' : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'}`}>{tag}</button>
                    ))}
                  </div>
              </div>
              <div>
                  <label className="text-xs font-bold text-gray-500 mb-3 block">서비스 / 편의</label>
                  <div className="flex flex-wrap gap-2">
                    {GOURMET_KEYWORDS.venue.service.map(tag => (
                      <button key={tag} onClick={() => toggleEvalTag('venue', 'service', tag)} className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all active:scale-95 ${detailedEval.venue.service.includes(tag) ? 'bg-secondary text-white border-secondary shadow-sm' : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'}`}>{tag}</button>
                    ))}
                  </div>
              </div>
           </div>
        </section>

      </div>
      <div className="absolute bottom-0 left-0 w-full p-4 pb-10 bg-white border-t border-gray-100 z-50">
        <Button fullWidth size="lg" onClick={handleNextAfterEval}>다음으로</Button>
      </div>
    </div>
  );

  const renderWritingStep = () => (
    <div className="h-full relative flex flex-col">
      <div className="flex-1 overflow-y-auto p-6 no-scrollbar pb-32">
         <h2 className="text-2xl font-bold text-secondary mt-4 mb-2">나만의 미식 로그를<br/>남겨주세요</h2>
         <p className="text-sm text-gray-400 mb-6">선택한 키워드를 참고해서 자유롭게 적어보세요</p>
         
         {/* Selected Tags Display */}
         <div className="flex flex-wrap gap-1.5 mb-4 max-h-24 overflow-y-auto">
             {[
                 ...detailedEval.venue.atmosphere, 
                 ...detailedEval.venue.service, 
                 ...detailedEval.menu.texture, 
                 ...detailedEval.menu.flavor,
                 ...detailedEval.menu.note
             ].map(k => (
                 <span key={k} className="text-[10px] bg-gray-100 text-gray-500 px-2 py-1 rounded-lg">#{k}</span>
             ))}
         </div>

         <div className="bg-white p-4 rounded-2xl border border-primary/20 shadow-sm min-h-[300px] relative">
             <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="맛, 분위기, 서비스는 어땠나요?&#13;&#10;솔직한 감상을 기록해주세요."
                className="w-full h-full min-h-[250px] resize-none outline-none text-base leading-relaxed text-secondary placeholder-gray-300 font-serif"
                autoFocus
             />
             <div className="absolute bottom-4 right-4 text-xs text-gray-300 font-bold">
                 {reviewText.length}자
             </div>
         </div>
      </div>
      <div className="absolute bottom-0 left-0 w-full p-4 pb-10 bg-white border-t border-gray-100 z-50">
         <Button fullWidth size="lg" disabled={reviewText.length < 5} onClick={() => preference === Preference.GOOD ? setStep(STEPS.RANKING) : handleFinalSave()}>
             {preference === Preference.GOOD ? '랭킹 정하기' : '완료하기'}
         </Button>
      </div>
    </div>
  );

  const renderRankingStep = () => {
    const { status, sortedExisting, mid } = rankingState;
    const opponent = sortedExisting[mid];

    return (
      <div className="h-full relative flex flex-col">
         <div className="flex-1 overflow-y-auto p-6 text-center no-scrollbar pb-32">
            <h2 className="text-2xl font-bold text-secondary mb-2 mt-4">랭킹 매치</h2>
            <p className="text-lg text-gray-500 mb-8">더 만족스러웠던 경험을 골라주세요</p>

            {status === 'comparing' && opponent ? (
                <div className="flex flex-col justify-center space-y-6 pb-8">
                    <button 
                        onClick={() => handleComparisonChoice('new')}
                        className="bg-white p-5 rounded-2xl shadow-md border-2 border-transparent active:border-primary transition-all group relative overflow-hidden text-left w-full active:scale-[0.98]"
                    >
                        <div className="absolute top-0 left-0 bg-primary text-white text-xs font-bold px-3 py-1 rounded-br-lg z-10">NEW</div>
                        <div className="w-full h-40 bg-gray-100 rounded-xl mb-4 overflow-hidden">
                             <img src={photos[0]} className="w-full h-full object-cover" alt="New" />
                        </div>
                        <h3 className="text-xl font-bold text-secondary truncate">{title}</h3>
                        <p className="text-base text-gray-500 truncate">{menu}</p>
                    </button>

                    <div className="flex items-center justify-center text-gray-300 font-bold">
                        <Swords size={24} /> <span className="mx-2 text-base">VS</span> <Swords size={24} className="transform scale-x-[-1]" />
                    </div>

                     <button 
                        onClick={() => handleComparisonChoice('existing')}
                        className="bg-white p-5 rounded-2xl shadow-md border-2 border-transparent active:border-secondary transition-all group text-left w-full active:scale-[0.98]"
                    >
                        <div className="absolute top-0 right-0 bg-gray-200 text-gray-600 text-xs font-bold px-3 py-1 rounded-bl-lg z-10">Rank #{opponent.rank}</div>
                        <div className="w-full h-40 bg-gray-100 rounded-xl mb-4 overflow-hidden">
                             <img src={opponent.representativePhoto} className="w-full h-full object-cover" alt="Existing" />
                        </div>
                        <h3 className="text-xl font-bold text-secondary truncate">{opponent.title}</h3>
                        <p className="text-base text-gray-500 truncate">{opponent.menu}</p>
                    </button>
                </div>
            ) : (
                <div className="flex items-center justify-center h-64">
                     <Trophy className="text-yellow-400 animate-bounce mb-4" size={64} />
                </div>
            )}
         </div>
      </div>
    );
  };

  return (
    <Layout title="기록하기" showBack hasTabBar={false} scrollable={false}>
      {step === STEPS.PHOTOS && renderPhotosStep()}
      {step === STEPS.DETAILS && renderDetailsStep()}
      {step === STEPS.PREFERENCE && renderPreferenceStep()}
      {step === STEPS.DETAILED_EVAL && renderDetailedEvalStep()}
      {step === STEPS.WRITING && renderWritingStep()}
      {step === STEPS.RANKING && renderRankingStep()}
    </Layout>
  );
};