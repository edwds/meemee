
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, X, Wand2, Users, Calendar, Sparkles, Trophy, Swords, ChefHat, Tag, Utensils, Loader2, MapPin, Check, AlignLeft, Lightbulb, Coffee, Volume2, Smile, ThumbsUp, Music, Armchair, Car, Accessibility, DollarSign, Gift, Zap } from 'lucide-react';
import { Layout } from '../components/Layout';
import { Button } from '../components/Button';
import { Preference, TasteProfile, ReviewRecord, DetailedEvaluation } from '../types';
import { analyzeImageContext } from '../services/geminiService';
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
  
  // Taste Profile State - Initialized to 3 (Balanced)
  const [tasteProfile, setTasteProfile] = useState<TasteProfile>({
    spiciness: 3, sweetness: 3, saltiness: 3, acidity: 3, richness: 3
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

  // Helper to find category for recommended tags
  const findKeywordCategory = (tag: string) => {
      // Search Menu
      for (const subCat of Object.keys(GOURMET_KEYWORDS.menu)) {
          if (GOURMET_KEYWORDS.menu[subCat as keyof typeof GOURMET_KEYWORDS.menu].includes(tag)) {
              return { category: 'menu', subCategory: subCat };
          }
      }
      // Search Venue
      for (const subCat of Object.keys(GOURMET_KEYWORDS.venue)) {
          if (GOURMET_KEYWORDS.venue[subCat as keyof typeof GOURMET_KEYWORDS.venue].includes(tag)) {
              return { category: 'venue', subCategory: subCat };
          }
      }
      return null;
  };

  // Improved Tag Handling
  const toggleEvalTag = (category: 'venue' | 'menu', subCategory: string, tag: string) => {
    setDetailedEval(prev => {
      // Cast to Record<string, string[]> to avoid union type index errors
      const section = prev[category] as Record<string, string[]>;
      const currentList = section[subCategory] || [];
      
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

  // --- DARK THEME COMPONENTS ---
  const DarkInput = ({ label, value, onChange, placeholder, type = 'text' }: any) => (
    <div className="space-y-2">
        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">{label}</label>
        <input 
            type={type}
            value={value} 
            onChange={onChange} 
            className="w-full p-4 bg-[#1A1A1A] border border-white/5 rounded-2xl text-base font-medium text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all" 
            placeholder={placeholder} 
        />
    </div>
  );

  // --- RENDER STEPS ---
  const renderPhotosStep = () => (
    <div className="h-full relative flex flex-col bg-black">
      <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar pb-32">
        <div className="text-center space-y-2 mb-8 mt-6">
          <h2 className="text-3xl font-black text-white tracking-tight">Capture<br/>The Moment</h2>
          <p className="text-sm text-gray-400 font-medium">맛있는 순간을 기록하세요</p>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <label className="aspect-square rounded-2xl bg-[#1A1A1A] border border-dashed border-white/20 flex flex-col items-center justify-center cursor-pointer hover:bg-[#252525] transition active:scale-95 group">
            <Camera className="text-gray-500 group-hover:text-primary transition-colors mb-2" size={28} />
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Add Photo</span>
            <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
          </label>
          {photos.map((photo, idx) => (
            <div key={idx} className="aspect-square rounded-2xl overflow-hidden relative shadow-lg border border-white/5 bg-gray-900 group">
              <img src={photo} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
              <button onClick={() => setPhotos(p => p.filter((_, i) => i !== idx))} className="absolute top-1 right-1 bg-black/60 text-white p-1 rounded-full backdrop-blur-md hover:bg-red-500/80 transition-colors"><X size={14} /></button>
            </div>
          ))}
        </div>
      </div>
      {isAnalyzing && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-md z-[60] flex flex-col items-center justify-center text-center p-6 animate-fade-in">
          <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center mb-6 relative animate-pulse">
             <Loader2 size={40} className="text-primary animate-spin" />
             <Wand2 size={24} className="absolute text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
          </div>
          <h3 className="text-2xl font-black text-white mb-2">Analyzing...</h3>
          <p className="text-sm text-gray-400">AI가 미식 데이터를 분석 중입니다</p>
        </div>
      )}
      <div className="absolute bottom-0 left-0 w-full p-5 pb-10 bg-black border-t border-white/5 z-50">
          <Button fullWidth size="lg" disabled={photos.length === 0 || isAnalyzing} onClick={handleAnalyzeAndNext}>다음으로</Button>
      </div>
    </div>
  );

  const renderDetailsStep = () => (
    <div className="h-full relative flex flex-col bg-black">
        <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar pb-32">
            <div className="mt-4 mb-8">
                 <h2 className="text-3xl font-black text-white mb-2">Basic Info</h2>
                 <p className="text-sm text-gray-400">기본 정보를 확인해주세요</p>
            </div>
            
            <DarkInput label="장소 이름 (Place)" value={title} onChange={(e: any) => setTitle(e.target.value)} placeholder="예: 오마카세 스시선" />
            
            <div className="grid grid-cols-2 gap-4">
                <DarkInput label="카테고리" value={category} onChange={(e: any) => setCategory(e.target.value)} placeholder="예: 일식" />
                <DarkInput label="지역 (Area)" value={area} onChange={(e: any) => setArea(e.target.value)} placeholder="예: 성수동" />
            </div>

            <DarkInput label="메뉴 (Menu)" value={menu} onChange={(e: any) => setMenu(e.target.value)} placeholder="주문한 메뉴" />

            <div className="grid grid-cols-2 gap-4">
                <DarkInput label="날짜" type="date" value={visitDate} onChange={(e: any) => setVisitDate(e.target.value)} />
                <DarkInput label="함께한 사람" value={companions} onChange={(e: any) => setCompanions(e.target.value)} placeholder="혼자" />
            </div>
        </div>
        <div className="absolute bottom-0 left-0 w-full p-5 pb-10 bg-black border-t border-white/5 z-50">
            <Button fullWidth size="lg" disabled={!title} onClick={() => setStep(STEPS.PREFERENCE)}>다음으로</Button>
        </div>
    </div>
  );

  const renderPreferenceStep = () => (
    <div className="h-full relative flex flex-col justify-between bg-black">
      <div className="flex-1 flex flex-col justify-center px-6 pb-20">
        <h2 className="text-3xl font-black text-white text-center mb-12">How was it?</h2>
        <div className="grid grid-cols-1 gap-4">
            {[Preference.GOOD, Preference.NORMAL, Preference.BAD].map((p) => (
            <button
                key={p}
                onClick={() => { setPreference(p); setStep(STEPS.DETAILED_EVAL); }}
                className={`p-6 rounded-3xl transition-all flex items-center justify-between border active:scale-95 group relative overflow-hidden ${
                preference === p
                    ? 'bg-primary/20 border-primary text-white shadow-[0_0_20px_rgba(255,107,53,0.3)]'
                    : 'bg-[#1A1A1A] border-white/5 text-gray-400 hover:bg-[#252525] hover:text-white'
                }`}
            >
                {/* Glow Effect */}
                <div className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent transition-transform duration-1000 ${preference === p ? 'translate-x-full' : '-translate-x-full'}`}></div>

                <span className="text-xl font-bold tracking-tight">{p}</span>
                <span className={`text-4xl filter drop-shadow-lg transition-transform ${preference === p ? 'scale-110' : 'grayscale group-hover:grayscale-0'}`}>
                    {p === Preference.GOOD ? '😍' : p === Preference.NORMAL ? '🙂' : '😢'}
                </span>
            </button>
            ))}
        </div>
      </div>
    </div>
  );

  const renderDetailedEvalStep = () => {
    // Determine Suggested Keywords
    const suggestedKeywords = recommendedTags
        .map(tag => {
            const match = findKeywordCategory(tag);
            return match ? { tag, ...match } : null;
        })
        .filter((item): item is { tag: string; category: 'venue' | 'menu'; subCategory: string } => !!item);

    return (
        <div className="h-full relative flex flex-col bg-black">
        <div className="flex-1 overflow-y-auto p-6 space-y-12 no-scrollbar pb-32">
            <div className="mt-4">
                <h2 className="text-3xl font-black text-white mb-2">Gourmet Details</h2>
                <p className="text-sm text-gray-400">미식 경험을 상세하게 기록해보세요</p>
            </div>
            
            {/* TAB 1: MENU EVALUATION (The Palate) */}
            <section>
            <div className="flex items-center gap-2 mb-6 text-primary">
                <ChefHat size={20} />
                <h3 className="text-xl font-black uppercase tracking-wider">The Palate</h3>
            </div>

            <div className="bg-[#1A1A1A] p-6 rounded-[2rem] border border-white/5 space-y-8">
                {/* Taste Balance Sliders */}
                <div>
                    <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-6">Taste Balance</h4>
                    <div className="space-y-6">
                        {/* Properly type the keys to avoid any index error */}
                        {(Object.keys(tasteProfile) as Array<keyof TasteProfile>).map((k) => (
                        <div key={k}>
                            <div className="flex justify-between mb-3 px-1">
                                <span className="text-sm font-bold text-gray-300 capitalize w-20">{k.slice(0,3)}</span>
                                <span className="text-xs font-bold text-primary">
                                    {tasteProfile[k] <= 2 ? 'Weak' : tasteProfile[k] === 3 ? 'Balanced' : 'Bold'}
                                </span>
                            </div>
                            <div className="flex gap-1.5 h-8">
                            {[1,2,3,4,5].map(n => (
                                <button 
                                    key={n} 
                                    onClick={() => handleTasteChange(k, n)} 
                                    className={`flex-1 rounded transition-all duration-200 ${
                                        tasteProfile[k] >= n 
                                        ? n <= 2 ? 'bg-orange-900/40' : n === 3 ? 'bg-orange-600/60' : 'bg-primary shadow-[0_0_10px_rgba(255,107,53,0.5)]' 
                                        : 'bg-white/5 hover:bg-white/10'
                                    }`}
                                />
                            ))}
                            </div>
                        </div>
                        ))}
                    </div>
                </div>
            </div>
            </section>
            
            {/* Visual Separator */}
            <div className="border-t border-white/10 mx-2"></div>

            {/* AI Suggestions Section */}
            {suggestedKeywords.length > 0 && (
                <section className="animate-fade-in-up">
                    <div className="flex items-center gap-2 mb-4 text-purple-400">
                        <Sparkles size={18} />
                        <h3 className="text-sm font-bold uppercase tracking-wider">AI Suggestions</h3>
                    </div>
                    <div className="bg-purple-900/20 p-5 rounded-2xl border border-purple-500/20">
                         <div className="flex flex-wrap gap-2">
                            {suggestedKeywords.map(({ tag, category, subCategory }) => {
                                // Safe access to dynamic properties using casting
                                const isSelected = (detailedEval[category] as Record<string, string[]>)[subCategory]?.includes(tag);
                                return (
                                    <button 
                                        key={`suggest-${tag}`} 
                                        onClick={() => toggleEvalTag(category, subCategory, tag)} 
                                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all active:scale-95 ${
                                            isSelected 
                                            ? 'bg-purple-600 text-white border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.4)]' 
                                            : 'bg-purple-900/40 text-purple-200 border-purple-500/30 hover:bg-purple-900/60'
                                        }`}
                                    >
                                        {tag}
                                    </button>
                                );
                            })}
                         </div>
                    </div>
                </section>
            )}

            {/* Keywords Sections */}
            <section>
                <div className="space-y-6">
                    {['Texture', 'Flavor', 'Note'].map((cat, i) => (
                        <div key={cat}>
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3 block pl-1">{cat}</label>
                        <div className="flex flex-wrap gap-2">
                            {GOURMET_KEYWORDS.menu[cat.toLowerCase() as keyof typeof GOURMET_KEYWORDS.menu].map(tag => {
                                const isSelected = detailedEval.menu[cat.toLowerCase() as keyof typeof detailedEval.menu].includes(tag);
                                return (
                                    <button 
                                        key={tag} 
                                        onClick={() => toggleEvalTag('menu', cat.toLowerCase(), tag)} 
                                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all active:scale-95 ${
                                            isSelected 
                                            ? 'bg-primary text-white border-primary shadow-[0_0_15px_rgba(255,107,53,0.4)]' 
                                            : 'bg-[#1A1A1A] text-gray-400 border-white/5 hover:bg-[#252525] hover:text-gray-200'
                                        }`}
                                    >
                                        {tag}
                                    </button>
                                );
                            })}
                        </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* TAB 2: VENUE EVALUATION (The Vibe) */}
            <section>
            <div className="flex items-center gap-2 mb-6 text-white pt-6 border-t border-white/10">
                <Armchair size={20} />
                <h3 className="text-xl font-black uppercase tracking-wider">The Vibe</h3>
            </div>
            
            <div className="space-y-6">
                {['Atmosphere', 'Service'].map((cat) => (
                    <div key={cat}>
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3 block pl-1">{cat}</label>
                        <div className="flex flex-wrap gap-2">
                            {GOURMET_KEYWORDS.venue[cat.toLowerCase() as keyof typeof GOURMET_KEYWORDS.venue].map(tag => {
                                const isSelected = detailedEval.venue[cat.toLowerCase() as keyof typeof detailedEval.venue].includes(tag);
                                return (
                                    <button 
                                        key={tag} 
                                        onClick={() => toggleEvalTag('venue', cat.toLowerCase(), tag)} 
                                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all active:scale-95 ${
                                            isSelected 
                                            ? 'bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.3)]' 
                                            : 'bg-[#1A1A1A] text-gray-400 border-white/5 hover:bg-[#252525] hover:text-gray-200'
                                        }`}
                                    >
                                        {tag}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
            </section>

        </div>
        <div className="absolute bottom-0 left-0 w-full p-5 pb-10 bg-black border-t border-white/5 z-50">
            <Button fullWidth size="lg" onClick={handleNextAfterEval}>다음으로</Button>
        </div>
        </div>
    );
  };

  const renderWritingStep = () => (
    <div className="h-full relative flex flex-col bg-black">
      <div className="flex-1 overflow-y-auto p-6 no-scrollbar pb-32">
         <h2 className="text-3xl font-black text-white mt-4 mb-2">Tasting Note</h2>
         <p className="text-sm text-gray-400 mb-8">나만의 미식 로그를 남겨주세요</p>
         
         {/* Selected Tags Display */}
         <div className="flex flex-wrap gap-1.5 mb-6 max-h-24 overflow-y-auto">
             {[
                 ...detailedEval.venue.atmosphere, 
                 ...detailedEval.venue.service, 
                 ...detailedEval.menu.texture, 
                 ...detailedEval.menu.flavor, 
                 ...detailedEval.menu.note
             ].map(k => (
                 <span key={k} className="text-[10px] bg-white/10 text-gray-300 px-2 py-1 rounded border border-white/5">#{k}</span>
             ))}
         </div>

         <div className="bg-[#1A1A1A] p-6 rounded-[2rem] border border-white/5 shadow-inner min-h-[350px] relative">
             <div className="absolute top-4 left-4 opacity-20"><Quote size={24} className="text-white rotate-180" /></div>
             <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="맛, 분위기, 서비스는 어땠나요?&#13;&#10;솔직한 감상을 기록해주세요."
                className="w-full h-full min-h-[300px] resize-none bg-transparent outline-none text-lg leading-loose text-gray-200 placeholder-gray-600 font-serif pt-6 relative z-10"
                autoFocus
             />
             <div className="absolute bottom-6 right-6 text-xs text-gray-500 font-mono">
                 {reviewText.length} chars
             </div>
         </div>
      </div>
      <div className="absolute bottom-0 left-0 w-full p-5 pb-10 bg-black border-t border-white/5 z-50">
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
      <div className="h-full relative flex flex-col bg-black">
         <div className="flex-1 overflow-y-auto p-6 text-center no-scrollbar pb-32">
            <h2 className="text-3xl font-black text-white mb-2 mt-4">Ranking Match</h2>
            <p className="text-sm text-gray-400 mb-10">더 만족스러웠던 경험을 선택하세요</p>

            {status === 'comparing' && opponent ? (
                <div className="flex flex-col justify-center space-y-6 pb-8">
                    <button 
                        onClick={() => handleComparisonChoice('new')}
                        className="bg-[#1A1A1A] p-0 rounded-3xl shadow-lg border border-white/5 active:border-primary transition-all group relative overflow-hidden text-left w-full active:scale-[0.98]"
                    >
                        <div className="absolute top-0 left-0 bg-primary text-white text-xs font-black px-4 py-1.5 rounded-br-2xl z-10 uppercase tracking-wider">Challenger</div>
                        <div className="w-full h-40 bg-gray-800 mb-0 overflow-hidden relative">
                             <img src={photos[0]} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" alt="New" />
                             <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1A] to-transparent"></div>
                        </div>
                        <div className="p-5 -mt-10 relative z-10">
                            <h3 className="text-2xl font-black text-white truncate mb-1">{title}</h3>
                            <p className="text-sm text-gray-400 truncate font-serif italic">{menu}</p>
                        </div>
                    </button>

                    <div className="flex items-center justify-center text-gray-600 font-black">
                        <span className="text-xs tracking-[0.5em] uppercase">VS</span>
                    </div>

                     <button 
                        onClick={() => handleComparisonChoice('existing')}
                        className="bg-[#1A1A1A] p-0 rounded-3xl shadow-lg border border-white/5 active:border-white transition-all group text-left w-full active:scale-[0.98] relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 bg-white text-black text-xs font-black px-4 py-1.5 rounded-bl-2xl z-10 uppercase tracking-wider">Rank #{opponent.rank}</div>
                        <div className="w-full h-40 bg-gray-800 mb-0 overflow-hidden relative">
                             <img src={opponent.representativePhoto} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" alt="Existing" />
                             <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1A] to-transparent"></div>
                        </div>
                        <div className="p-5 -mt-10 relative z-10 text-right">
                            <h3 className="text-2xl font-black text-white truncate mb-1">{opponent.title}</h3>
                            <p className="text-sm text-gray-400 truncate font-serif italic">{opponent.menu}</p>
                        </div>
                    </button>
                </div>
            ) : (
                <div className="flex items-center justify-center h-64">
                     <Trophy className="text-yellow-500 animate-bounce mb-4 drop-shadow-[0_0_15px_rgba(234,179,8,0.5)]" size={64} />
                </div>
            )}
         </div>
      </div>
    );
  };

  // Missing Icon Shim
  function Quote(props: any) { return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M14.017 21L14.017 18C14.017 16.8954 14.9124 16 16.017 16H19.017C19.5693 16 20.017 15.5523 20.017 15V9C20.017 8.44772 19.5693 8 19.017 8H15.017C14.4647 8 14.017 8.44772 14.017 9V11C14.017 11.5523 13.5693 12 13.017 12H12.017V5H22.017V15C22.017 18.3137 19.3307 21 16.017 21H14.017ZM5.0166 21L5.0166 18C5.0166 16.8954 5.91203 16 7.0166 16H10.0166C10.5689 16 11.0166 15.5523 11.0166 15V9C11.0166 8.44772 10.5689 8 10.0166 8H6.0166C5.46432 8 5.0166 8.44772 5.0166 9V11C5.0166 11.5523 4.56889 12 4.0166 12H3.0166V5H13.0166V15C13.0166 18.3137 10.3303 21 7.0166 21H5.0166Z" /></svg>}

  return (
    <Layout title="New Log" showBack hasTabBar={false} scrollable={false} backgroundColor="bg-black">
      {step === STEPS.PHOTOS && renderPhotosStep()}
      {step === STEPS.DETAILS && renderDetailsStep()}
      {step === STEPS.PREFERENCE && renderPreferenceStep()}
      {step === STEPS.DETAILED_EVAL && renderDetailedEvalStep()}
      {step === STEPS.WRITING && renderWritingStep()}
      {step === STEPS.RANKING && renderRankingStep()}
    </Layout>
  );
};
