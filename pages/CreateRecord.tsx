
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, X, Wand2, Users, Calendar, Sparkles, Trophy, Swords, ChefHat, ChevronRight, Tag, Utensils } from 'lucide-react';
import { Layout } from '../components/Layout';
import { Button } from '../components/Button';
import { Preference, ReviewStyle, KEYWORD_DATA, KeywordCategory, TasteProfile, ReviewRecord } from '../types';
import { generateReviewText, analyzeMenuFromImages, recommendKeywords } from '../services/geminiService';
// Import EXIF carefully to handle ESM environment differences
import * as EXIF from 'exif-js';

// Type assertion for EXIF to avoid TS errors if types are missing or incompatible
const EXIF_LIB = EXIF as any;

interface CreateRecordProps {
  onSave: (record: ReviewRecord, updatedRecords?: ReviewRecord[]) => void;
  existingRecords?: ReviewRecord[];
}

const STEPS = {
  PHOTOS: 0,
  DETAILS: 1,
  EVALUATION: 2, // Combined Taste & Keywords
  REVIEW: 3,
  RANKING: 4,
};

interface RankingState {
  status: 'idle' | 'comparing' | 'finished';
  low: number;
  high: number;
  mid: number;
  sortedExisting: ReviewRecord[];
}

export const CreateRecord: React.FC<CreateRecordProps> = ({ onSave, existingRecords = [] }) => {
  const navigate = useNavigate();
  const [step, setStep] = useState(STEPS.PHOTOS);
  const [isLoading, setIsLoading] = useState(false);
  
  // Analysis States
  const [isProcessingImages, setIsProcessingImages] = useState(false);
  const [isAnalyzingMenu, setIsAnalyzingMenu] = useState(false);
  const [isRecommendingTags, setIsRecommendingTags] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [visitDate, setVisitDate] = useState('');
  const [companions, setCompanions] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [preference, setPreference] = useState<Preference | null>(null);
  const [menu, setMenu] = useState('');
  
  // Taste Profile State
  const [tasteProfile, setTasteProfile] = useState<TasteProfile>({
    spiciness: 1,
    sweetness: 1,
    saltiness: 1,
    acidity: 1,
    richness: 1
  });

  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
  const [recommendedTags, setRecommendedTags] = useState<string[]>([]);
  const [reviewStyle, setReviewStyle] = useState<ReviewStyle>(ReviewStyle.BASIC);
  const [aiText, setAiText] = useState('');
  
  // Ranking State (A vs B Comparison)
  const [rankingState, setRankingState] = useState<RankingState>({
    status: 'idle',
    low: 0,
    high: 0,
    mid: 0,
    sortedExisting: []
  });
  
  // Set default date to today
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setVisitDate(today);
  }, []);

  // Initialize ranking logic when entering ranking step
  useEffect(() => {
    if (step === STEPS.RANKING) {
      const goodRecords = existingRecords
        .filter(r => r.preference === Preference.GOOD)
        .sort((a, b) => (a.rank || 999) - (b.rank || 999));

      if (goodRecords.length === 0) {
        // No existing records, this is #1
        handleFinalSave(1, []);
      } else {
        // Start Binary Search
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

  // Effect: When photos are added, auto-analyze menu
  useEffect(() => {
    if (photos.length > 0 && !menu && !isAnalyzingMenu) {
      const autoAnalyze = async () => {
        setIsAnalyzingMenu(true);
        try {
            const detected = await analyzeMenuFromImages(photos);
            if (detected) setMenu(detected);
        } catch(e) {
            console.log("Auto analysis failed", e);
        } finally {
            setIsAnalyzingMenu(false);
        }
      };
      autoAnalyze();
    }
  }, [photos]);

  // Effect: When Menu is set (and we are entering Evaluation step), recommend tags
  useEffect(() => {
    if (menu && step === STEPS.EVALUATION && recommendedTags.length === 0) {
        const getTags = async () => {
            setIsRecommendingTags(true);
            const tags = await recommendKeywords(menu);
            setRecommendedTags(tags);
            setIsRecommendingTags(false);
        };
        getTags();
    }
  }, [menu, step]);

  // Helper to get EXIF Date
  const getExifDate = (file: File): Promise<string | null> => {
    return new Promise((resolve) => {
      if (!EXIF_LIB || !EXIF_LIB.getData) {
        console.warn("EXIF library not loaded properly");
        resolve(null);
        return;
      }
      
      try {
        EXIF_LIB.getData(file as any, function(this: any) {
          const dateString = EXIF_LIB.getTag(this, "DateTimeOriginal");
          if (dateString) {
            // Format: "YYYY:MM:DD HH:MM:SS" -> "YYYY-MM-DD"
            const [datePart] = dateString.split(' ');
            const formattedDate = datePart.replace(/:/g, '-');
            resolve(formattedDate);
          } else {
            resolve(null);
          }
        });
      } catch (e) {
        console.error("EXIF extraction error", e);
        resolve(null);
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
            if (width > MAX_SIZE) {
              height *= MAX_SIZE / width;
              width = MAX_SIZE;
            }
          } else {
            if (height > MAX_SIZE) {
              width *= MAX_SIZE / height;
              height = MAX_SIZE;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.7));
        };
        img.onerror = (e) => reject(e);
      };
      reader.onerror = (e) => reject(e);
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setIsProcessingImages(true);
      const files = Array.from(e.target.files) as File[];
      const newPhotos: string[] = [];
      
      // Date Logic
      const dates: string[] = [];

      try {
        for (const file of files) {
          // Resize
          const resized = await resizeImage(file);
          newPhotos.push(resized);

          // Extract Date
          const exifDate = await getExifDate(file);
          if (exifDate) dates.push(exifDate);
        }

        setPhotos(prev => [...prev, ...newPhotos].slice(0, 10));

        // Determine Visit Date
        // If all photos have the same date, use it.
        // If dates differ or none found, keep default (today) or existing.
        if (dates.length > 0) {
            const allSame = dates.every(d => d === dates[0]);
            if (allSame) {
                setVisitDate(dates[0]);
            }
        }

      } catch (error) {
        console.error("Image processing failed", error);
        alert("이미지 처리 중 오류가 발생했습니다.");
      } finally {
        setIsProcessingImages(false);
      }
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const toggleKeyword = (keyword: string) => {
    setSelectedKeywords(prev => 
      prev.includes(keyword) 
        ? prev.filter(k => k !== keyword)
        : [...prev, keyword]
    );
  };

  const handleTasteChange = (key: keyof TasteProfile, value: number) => {
    setTasteProfile(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleGenerateAI = async () => {
    if (!preference) return;
    setIsLoading(true);
    const text = await generateReviewText({
      preference,
      menu,
      keywords: selectedKeywords,
      tasteProfile,
      style: reviewStyle,
      title,
      visitDate,
      companions
    });
    setAiText(text);
    setIsLoading(false);
  };

  const handleComparisonChoice = (winner: 'new' | 'existing') => {
    const { low, high, mid } = rankingState;
    let newLow = low;
    let newHigh = high;

    if (winner === 'new') {
      newHigh = mid - 1;
    } else {
      newLow = mid + 1;
    }

    if (newLow > newHigh) {
      const finalInsertIndex = newLow;
      finishRanking(finalInsertIndex);
    } else {
      setRankingState(prev => ({
        ...prev,
        low: newLow,
        high: newHigh,
        mid: Math.floor((newLow + newHigh) / 2)
      }));
    }
  };

  const finishRanking = (insertIndex: number) => {
    const { sortedExisting } = rankingState;
    const newRank = insertIndex + 1;
    const updatedRecords = sortedExisting.map((record, index) => {
      if (index >= insertIndex) {
        return { ...record, rank: (record.rank || index + 1) + 1 }; 
      }
      return record;
    });
    handleFinalSave(newRank, updatedRecords);
  };

  const handleNextAfterReview = () => {
    if (preference === Preference.GOOD) {
      setStep(STEPS.RANKING);
    } else {
      handleFinalSave();
    }
  };

  const handleFinalSave = (rank?: number, updatedRecords: ReviewRecord[] = []) => {
    if (!title) {
      alert('식당 이름을 입력해주세요.');
      return;
    }

    const recordId = Date.now().toString();
    
    const newRecord: ReviewRecord = {
      id: recordId,
      title,
      photos,
      representativePhoto: photos[0] || '',
      preference: preference || Preference.NORMAL,
      menu,
      visitDate,
      companions,
      tasteProfile,
      keywords: selectedKeywords,
      aiGeneratedText: aiText,
      createdAt: Date.now(),
      rank
    };
    
    onSave(newRecord, updatedRecords);
    navigate('/');
  };

  // --- RENDER STEPS ---

  const renderPhotosStep = () => (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
        <div className="text-center space-y-2 mb-4">
          <h2 className="text-2xl font-bold text-secondary">어떤 미식이었나요?</h2>
          <p className="text-gray-500">맛있는 순간의 사진을 골라주세요</p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <label className={`aspect-square rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition ${isProcessingImages ? 'opacity-50 pointer-events-none' : ''}`}>
            <Camera className="text-gray-400 mb-2" size={24} />
            <span className="text-xs text-gray-500 font-medium">사진 추가</span>
            <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
          </label>
          
          {photos.map((photo, idx) => (
            <div key={idx} className="aspect-square rounded-xl overflow-hidden relative shadow-sm border border-gray-200 group">
              <img src={photo} alt={`upload-${idx}`} className="w-full h-full object-cover" />
              <button 
                onClick={() => removePhoto(idx)}
                className="absolute top-1 right-1 bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="p-6 bg-white border-t border-gray-100 pb-safe">
          {photos.length > 0 && isAnalyzingMenu && (
             <div className="flex items-center justify-center text-xs text-primary mb-4 animate-pulse bg-orange-50 py-2 rounded-lg">
                 <Wand2 size={14} className="mr-2" />
                 메뉴를 분석하고 있습니다...
             </div>
          )}

          <Button 
            fullWidth 
            size="lg"
            disabled={photos.length === 0 || isProcessingImages}
            onClick={() => setStep(STEPS.DETAILS)}
          >
            다음으로
          </Button>
      </div>
    </div>
  );

  const renderDetailsStep = () => (
    <div className="flex flex-col h-full">
        <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
            <h2 className="text-2xl font-bold text-secondary mb-6">기본 정보를<br/>알려주세요</h2>
            
            <div className="space-y-6">
                {/* Title Input */}
                <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">장소 이름</label>
                    <div className="relative">
                        <input 
                            type="text" 
                            value={title} 
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="예: 오마카세 스시선"
                            className="w-full p-4 bg-white border border-gray-200 rounded-2xl text-lg font-semibold focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-gray-900 placeholder-gray-300"
                        />
                        <ChefHat className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
                    </div>
                </div>

                 {/* Menu Input (Auto filled) */}
                 <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1 flex items-center justify-between">
                        <span>먹은 메뉴</span>
                        {isAnalyzingMenu && <span className="text-primary text-[10px] flex items-center"><Wand2 size={10} className="mr-1"/>분석중</span>}
                    </label>
                    <div className="relative">
                        <input 
                            type="text" 
                            value={menu} 
                            onChange={(e) => setMenu(e.target.value)}
                            placeholder="사진 분석 대기중..."
                            className="w-full p-4 bg-white border border-gray-200 rounded-2xl text-base font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-gray-900 placeholder-gray-300"
                        />
                        <Utensils className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    {/* Date Input */}
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">날짜</label>
                        <div className="relative">
                            <input 
                                type="date" 
                                value={visitDate} 
                                onChange={(e) => setVisitDate(e.target.value)}
                                className="w-full p-3 bg-white border border-gray-200 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-gray-900"
                            />
                        </div>
                    </div>

                    {/* Companions Input */}
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">함께한 사람</label>
                        <div className="relative">
                            <input 
                                type="text" 
                                value={companions} 
                                onChange={(e) => setCompanions(e.target.value)}
                                placeholder="혼자"
                                className="w-full p-3 bg-white border border-gray-200 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-gray-900 placeholder-gray-300"
                            />
                        </div>
                    </div>
                </div>

                 {/* Preference Selection */}
                <div className="space-y-2 pt-4">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">만족도</label>
                    <div className="grid grid-cols-3 gap-3">
                        {[Preference.GOOD, Preference.NORMAL, Preference.BAD].map((p) => (
                        <button
                            key={p}
                            onClick={() => setPreference(p)}
                            className={`p-4 rounded-2xl font-medium transition-all flex flex-col items-center justify-center gap-2 border-2 ${
                            preference === p
                                ? 'border-primary bg-primary/5 text-primary'
                                : 'border-transparent bg-white text-gray-400 hover:bg-gray-50'
                            }`}
                        >
                            <span className="text-2xl">
                            {p === Preference.GOOD ? '😍' : p === Preference.NORMAL ? '🙂' : '😢'}
                            </span>
                            <span className="text-xs">{p}</span>
                        </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>

        <div className="p-6 bg-white border-t border-gray-100 pb-safe">
            <Button 
                fullWidth 
                size="lg" 
                disabled={!title || !preference}
                onClick={() => setStep(STEPS.EVALUATION)}
            >
                맛 평가하기
            </Button>
        </div>
    </div>
  );

  const renderEvaluationStep = () => (
    <div className="flex flex-col h-full">
      <div className="p-6 bg-white shadow-sm z-10 flex-shrink-0">
          <h2 className="text-xl font-bold text-secondary mb-1">맛과 느낌을<br/>표현해주세요</h2>
          {menu && <p className="text-xs text-gray-400">For: {menu}</p>}
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8 no-scrollbar">
        {/* Section 1: Taste Balance */}
        <section>
            <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center">
                <span className="w-1.5 h-4 bg-primary rounded-full mr-2"></span>
                밸런스 (1-5)
            </h3>
            <div className="space-y-4 bg-white p-4 rounded-2xl border border-gray-100">
                {(Object.keys(tasteProfile) as Array<keyof TasteProfile>).map((key) => (
                <div key={key} className="flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-500 w-12 capitalize">{key}</span>
                    <div className="flex-1 mx-4 flex gap-1 h-6">
                    {[1, 2, 3, 4, 5].map((level) => (
                        <button
                        key={level}
                        onClick={() => handleTasteChange(key, level)}
                        className={`flex-1 rounded-sm transition-all ${
                            tasteProfile[key] >= level ? 'bg-primary' : 'bg-gray-100'
                        } ${tasteProfile[key] === level ? 'opacity-100' : 'opacity-60'}`}
                        />
                    ))}
                    </div>
                    <span className="text-xs font-bold text-secondary w-4 text-right">{tasteProfile[key]}</span>
                </div>
                ))}
            </div>
        </section>

        {/* Section 2: Recommended Tags */}
        <section>
             <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center justify-between">
                <div className="flex items-center">
                    <span className="w-1.5 h-4 bg-secondary rounded-full mr-2"></span>
                    추천 키워드
                </div>
                {isRecommendingTags && <span className="text-[10px] text-primary animate-pulse">AI 추천중...</span>}
            </h3>
            {recommendedTags.length > 0 ? (
                 <div className="flex flex-wrap gap-2">
                    {recommendedTags.map(tag => (
                        <button
                            key={tag}
                            onClick={() => toggleKeyword(tag)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                                selectedKeywords.includes(tag)
                                ? 'bg-primary text-white border-primary shadow-md transform scale-105'
                                : 'bg-orange-50 text-primary border-orange-100 hover:bg-orange-100'
                            }`}
                        >
                            {tag}
                            {selectedKeywords.includes(tag) && <span className="ml-1">✓</span>}
                        </button>
                    ))}
                 </div>
            ) : (
                <div className="text-xs text-gray-400 p-4 bg-gray-50 rounded-xl text-center">
                    메뉴에 어울리는 태그를 찾고 있어요...
                </div>
            )}
        </section>

        {/* Section 3: All Categories */}
        <section className="space-y-6">
            {(Object.keys(KEYWORD_DATA) as KeywordCategory[]).map(category => (
                <div key={category}>
                     <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 ml-1">{category}</h4>
                     <div className="flex flex-wrap gap-2">
                         {KEYWORD_DATA[category].map(keyword => {
                             const isSelected = selectedKeywords.includes(keyword);
                             return (
                                <button
                                    key={keyword}
                                    onClick={() => toggleKeyword(keyword)}
                                    className={`px-3 py-1.5 rounded-lg text-xs transition-all border ${
                                        isSelected
                                        ? 'bg-secondary text-white border-secondary'
                                        : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
                                    }`}
                                >
                                    {keyword}
                                </button>
                             );
                         })}
                     </div>
                </div>
            ))}
        </section>
      </div>
      
      <div className="p-6 bg-white border-t border-gray-100 pb-safe flex-shrink-0">
        <Button fullWidth size="lg" onClick={() => {
            handleGenerateAI();
            setStep(STEPS.REVIEW);
        }}>
            리포트 생성하기
        </Button>
      </div>
    </div>
  );

  const renderReviewStep = () => (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-6 no-scrollbar">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-secondary mb-2">미식 리포트 도착!</h2>
          <p className="text-gray-500 text-sm">AI가 당신의 미식을 분석했습니다</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 min-h-[300px]">
          {isLoading ? (
            <div className="h-full flex flex-col items-center justify-center space-y-4 py-12">
              <Sparkles className="text-primary animate-bounce" size={32} />
              <p className="text-gray-400 text-sm animate-pulse">미식 뉘앙스를 분석하는 중...</p>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
                 <span className="text-sm font-bold text-gray-400">TASTING NOTE</span>
                 <span className="text-xs bg-secondary text-white px-2 py-1 rounded">{reviewStyle}</span>
              </div>
              <textarea
                className="w-full h-64 p-0 text-gray-700 leading-relaxed resize-none focus:outline-none bg-transparent"
                value={aiText}
                onChange={(e) => setAiText(e.target.value)}
              />
              <div className="flex justify-end mt-4">
                  <button 
                      onClick={handleGenerateAI}
                      className="text-xs text-primary flex items-center hover:underline"
                  >
                      <Wand2 size={12} className="mr-1" />
                      다시 쓰기
                  </button>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="p-6 bg-white border-t border-gray-100 pb-safe">
        <Button fullWidth size="lg" onClick={handleNextAfterReview} disabled={isLoading}>
          {preference === Preference.GOOD ? '랭킹 정하기' : '저장하기'}
        </Button>
      </div>
    </div>
  );

  const renderRankingStep = () => {
    const { status, sortedExisting, mid } = rankingState;
    const opponent = sortedExisting[mid];

    return (
      <div className="flex flex-col h-full">
         <div className="flex-1 overflow-y-auto p-6 text-center no-scrollbar">
            <h2 className="text-2xl font-bold text-secondary mb-2">랭킹 매치</h2>
            <p className="text-gray-500 mb-8">더 만족스러웠던 경험을 골라주세요</p>

            {status === 'comparing' && opponent ? (
                <div className="flex flex-col justify-center space-y-8 pb-8">
                    
                    {/* Option A: New */}
                    <button 
                        onClick={() => handleComparisonChoice('new')}
                        className="bg-white p-6 rounded-2xl shadow-md border-2 border-transparent hover:border-primary transition-all group relative overflow-hidden"
                    >
                        <div className="absolute top-0 left-0 bg-primary text-white text-xs font-bold px-3 py-1 rounded-br-lg">
                            NEW
                        </div>
                        <div className="w-full h-32 bg-gray-100 rounded-xl mb-3 overflow-hidden">
                             <img src={photos[0]} className="w-full h-full object-cover" alt="New" />
                        </div>
                        <h3 className="text-xl font-bold text-secondary">{title}</h3>
                        <p className="text-sm text-gray-500">{menu}</p>
                    </button>

                    <div className="flex items-center justify-center text-gray-300 font-bold">
                        <Swords size={24} />
                        <span className="mx-2 text-lg">VS</span>
                        <Swords size={24} className="transform scale-x-[-1]" />
                    </div>

                    {/* Option B: Existing */}
                     <button 
                        onClick={() => handleComparisonChoice('existing')}
                        className="bg-white p-6 rounded-2xl shadow-md border-2 border-transparent hover:border-secondary transition-all group"
                    >
                        <div className="absolute top-0 right-0 bg-gray-200 text-gray-600 text-xs font-bold px-3 py-1 rounded-bl-lg">
                            Rank #{opponent.rank}
                        </div>
                        <div className="w-full h-32 bg-gray-100 rounded-xl mb-3 overflow-hidden">
                             <img src={opponent.representativePhoto} className="w-full h-full object-cover" alt="Existing" />
                        </div>
                        <h3 className="text-xl font-bold text-secondary">{opponent.title}</h3>
                        <p className="text-sm text-gray-500">{opponent.menu}</p>
                    </button>

                </div>
            ) : (
                <div className="flex items-center justify-center h-64">
                     <Trophy className="text-yellow-400 animate-bounce mb-4" size={48} />
                </div>
            )}
         </div>
      </div>
    );
  };

  return (
    <Layout title="기록하기" showBack hasTabBar={false}>
      {step === STEPS.PHOTOS && renderPhotosStep()}
      {step === STEPS.DETAILS && renderDetailsStep()}
      {step === STEPS.EVALUATION && renderEvaluationStep()}
      {step === STEPS.REVIEW && renderReviewStep()}
      {step === STEPS.RANKING && renderRankingStep()}
    </Layout>
  );
};
