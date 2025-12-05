import React, { useMemo } from 'react';
import { Layout } from '../components/Layout';
import { ReviewRecord } from '../types';
import { calculateLevel, BADGES, calculateGourmetMBTI } from '../utils/gamification';
import { Trophy, Lock, Camera, MapPin, PenTool, Star, Target, Award, TrendingUp, Hash } from 'lucide-react';

interface AchievementProps {
  records: ReviewRecord[];
}

export const Achievement: React.FC<AchievementProps> = ({ records }) => {
  const { level, nextLevelThreshold, progress } = calculateLevel(records.length);
  const earnedBadgeIds = BADGES.filter(b => b.condition(records)).map(b => b.id);
  const mbti = useMemo(() => calculateGourmetMBTI(records), [records]);
  
  // --- Detailed Stats Calculation ---
  const stats = useMemo(() => {
    const totalPhotos = records.reduce((acc, r) => acc + r.photos.length, 0);
    const totalAreas = new Set(records.map(r => r.location?.address || '').filter(Boolean)).size;
    const totalWords = records.reduce((acc, r) => acc + (r.aiGeneratedText?.length || 0), 0);
    const goodRatio = records.length > 0 
        ? Math.round((records.filter(r => r.preference === '좋아요').length / records.length) * 100) 
        : 0;

    return { totalPhotos, totalAreas, totalWords, goodRatio };
  }, [records]);

  // Calculate Top Keywords
  const topKeywords = useMemo(() => {
    const counts: Record<string, number> = {};
    records.forEach(r => {
        r.keywords.forEach(k => {
            counts[k] = (counts[k] || 0) + 1;
        });
    });
    return Object.entries(counts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([key]) => key);
  }, [records]);

  // --- Next Quest Logic ---
  const nextQuest = useMemo(() => {
      // Find the first unearned badge
      const unearned = BADGES.find(b => !earnedBadgeIds.includes(b.id));
      if (unearned) {
          return {
              badge: unearned,
              message: "다음 뱃지에 도전해보세요!"
          };
      }
      return {
          badge: null,
          message: "모든 업적을 달성했습니다! 당신은 진정한 미식 마스터!"
      };
  }, [earnedBadgeIds]);

  const renderTasteRow = (label: string, value: number, colorClass: string) => (
    <div className="mb-3">
        <div className="flex justify-between items-end mb-1">
            <span className="text-xs font-bold text-gray-400">{label}</span>
            <span className="text-xs font-bold text-secondary">{value.toFixed(1)}</span>
        </div>
        <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
            <div 
                className={`h-full rounded-full transition-all duration-1000 ${colorClass}`} 
                style={{ width: `${(value / 5) * 100}%` }} 
            />
        </div>
    </div>
  );

  return (
    <Layout title="미식 여정" showBack hasTabBar={true}>
      <div className="pb-8 px-5 pt-4">
        
        {/* 1. LEVEL HERO SECTION */}
        <section className="bg-secondary text-white rounded-[2rem] p-8 shadow-xl relative overflow-hidden mb-6 flex flex-col items-center text-center border border-gray-700">
            {/* Glow Effects */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-primary/20 rounded-full blur-[80px] pointer-events-none"></div>
            
            <div className="relative z-10 mb-4">
                {/* Circular Progress */}
                <div className="relative w-40 h-40 flex items-center justify-center">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                        {/* Background Circle */}
                        <path
                            className="text-gray-700"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                        />
                        {/* Progress Circle */}
                        <path
                            className="text-primary drop-shadow-[0_0_10px_rgba(255,107,53,0.5)]"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                            strokeDasharray={`${progress}, 100`}
                            strokeLinecap="round"
                        />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Level</span>
                        <span className="text-5xl font-black tracking-tighter text-white">{level}</span>
                    </div>
                </div>
            </div>

            <h2 className="text-xl font-bold mb-1">Gourmet Collector</h2>
            <p className="text-sm text-gray-400 mb-4">다음 레벨까지 <span className="text-primary font-bold">{Math.ceil(5 - (records.length % 5))}개</span>의 기록이 필요해요</p>
            
            <div className="bg-white/10 px-4 py-2 rounded-xl text-xs font-medium border border-white/10">
                현재 경험치: <span className="text-white font-bold">{records.length} XP</span>
            </div>
        </section>

        {/* 2. NEXT QUEST (Motivation) */}
        {nextQuest.badge && (
            <section className="mb-6">
                <div className="flex items-center gap-2 mb-3 px-1">
                    <Target className="text-red-500" size={20} />
                    <h3 className="font-bold text-secondary text-lg">다음 목표 (Next Quest)</h3>
                </div>
                
                <div className="bg-gradient-to-r from-orange-50 to-white p-5 rounded-2xl border border-orange-100 shadow-sm flex items-center gap-4 relative overflow-hidden">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm text-gray-300 flex-shrink-0 border border-gray-100">
                        <Lock size={20} />
                    </div>
                    <div>
                        <div className="text-[10px] font-bold text-primary uppercase tracking-wider mb-1">LOCKED BADGE</div>
                        <h4 className="font-bold text-secondary text-base">{nextQuest.badge.label}</h4>
                        <p className="text-xs text-gray-500 mt-0.5">{nextQuest.badge.description}</p>
                    </div>
                    <Award className="absolute right-[-10px] bottom-[-10px] text-orange-100 rotate-12" size={80} />
                </div>
            </section>
        )}

        {/* 3. TASTE DNA & DETAILED STATS */}
        <section className="mb-8">
             <div className="flex items-center gap-2 mb-4 px-1">
                 <TrendingUp className="text-primary" size={20} />
                 <h3 className="font-bold text-secondary text-lg">미식 데이터</h3>
             </div>

             {/* Taste Bars */}
             <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm mb-4">
                <h4 className="text-sm font-bold text-secondary mb-4">입맛 DNA</h4>
                {mbti ? (
                     <div className="grid grid-cols-2 gap-x-8 gap-y-2">
                        {renderTasteRow('맵기 (Kick)', mbti.scores.spiciness, 'bg-red-400')}
                        {renderTasteRow('단맛 (Main)', mbti.scores.sweetness, 'bg-pink-400')}
                        {renderTasteRow('짠맛 (Main)', mbti.scores.saltiness, 'bg-blue-400')}
                        {renderTasteRow('풍미 (Body)', mbti.scores.richness, 'bg-orange-400')}
                    </div>
                ) : (
                    <div className="text-center py-6 text-xs text-gray-400">
                        데이터가 충분하지 않습니다.
                    </div>
                )}

                {/* Top Keywords */}
                {topKeywords.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-50">
                        <div className="flex items-center gap-2 mb-3">
                            <Hash size={16} className="text-gray-400" />
                            <span className="text-xs font-bold text-gray-400">자주 쓰는 표현</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {topKeywords.map(k => (
                                <span key={k} className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-xs font-bold border border-gray-200">
                                    #{k}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
             </div>

             {/* Stats Grid */}
             <div className="grid grid-cols-2 gap-3">
                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between h-24">
                    <div className="flex justify-between items-start">
                        <span className="text-xs text-gray-400 font-medium">총 기록 사진</span>
                        <Camera size={16} className="text-blue-400" />
                    </div>
                    <span className="text-2xl font-bold text-secondary">{stats.totalPhotos}</span>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between h-24">
                    <div className="flex justify-between items-start">
                        <span className="text-xs text-gray-400 font-medium">방문한 지역</span>
                        <MapPin size={16} className="text-green-400" />
                    </div>
                    <span className="text-2xl font-bold text-secondary">{stats.totalAreas}</span>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between h-24">
                    <div className="flex justify-between items-start">
                        <span className="text-xs text-gray-400 font-medium">미식 만족도</span>
                        <Star size={16} className="text-yellow-400" />
                    </div>
                    <span className="text-2xl font-bold text-secondary">{stats.goodRatio}%</span>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between h-24">
                    <div className="flex justify-between items-start">
                        <span className="text-xs text-gray-400 font-medium">기록한 글자수</span>
                        <PenTool size={16} className="text-purple-400" />
                    </div>
                    <span className="text-2xl font-bold text-secondary">{stats.totalWords}</span>
                </div>
             </div>
        </section>

        {/* 4. BADGE COLLECTION (Hall of Fame) */}
        <section>
            <div className="flex items-center justify-between mb-4 px-1">
                <h3 className="font-bold text-secondary text-lg flex items-center">
                    <Trophy className="text-yellow-500 mr-2" size={20} />
                    뱃지 컬렉션
                </h3>
                <span className="text-xs font-bold text-primary bg-orange-50 px-2 py-1 rounded-lg">
                    {earnedBadgeIds.length} / {BADGES.length}
                </span>
            </div>
           
           <div className="grid grid-cols-3 gap-3">
              {BADGES.map((badge) => {
                const isUnlocked = earnedBadgeIds.includes(badge.id);
                
                return (
                  <div 
                    key={badge.id} 
                    className={`aspect-square rounded-2xl flex flex-col items-center justify-center p-2 text-center transition-all border relative overflow-hidden group ${
                        isUnlocked 
                        ? `bg-white border-gray-100 shadow-sm` 
                        : 'bg-gray-50 border-gray-100'
                    }`}
                  >
                    {/* Badge Icon */}
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-transform ${
                        isUnlocked ? badge.color : 'bg-gray-200 text-gray-400 grayscale'
                    }`}>
                        {isUnlocked ? badge.icon : <Lock size={16} />}
                    </div>
                    
                    <span className={`text-[10px] font-bold leading-tight ${isUnlocked ? 'text-secondary' : 'text-gray-400'}`}>
                        {badge.label}
                    </span>

                    {/* Tooltip / Overlay */}
                    <div className="absolute inset-0 bg-black/80 text-white flex items-center justify-center opacity-0 group-active:opacity-100 group-hover:opacity-100 transition-opacity p-2 z-20 pointer-events-none">
                        <p className="text-[9px] font-medium break-keep">
                            {badge.description}
                        </p>
                    </div>
                  </div>
                );
              })}
           </div>
        </section>
      </div>
    </Layout>
  );
};