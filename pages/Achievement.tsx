
import React, { useMemo } from 'react';
import { Layout } from '../components/Layout';
import { ReviewRecord } from '../types';
import { calculateLevel, BADGES } from '../utils/gamification';
import { Trophy, Star, Lock, Sparkles, TrendingUp, Hash } from 'lucide-react';

interface AchievementProps {
  records: ReviewRecord[];
}

export const Achievement: React.FC<AchievementProps> = ({ records }) => {
  const { level, nextLevelThreshold, progress } = calculateLevel(records.length);
  const earnedBadgeIds = BADGES.filter(b => b.condition(records)).map(b => b.id);
  
  // 1. Load Taste Identity from LocalStorage (Cached in Home.tsx)
  const tasteIdentity = localStorage.getItem('meemee_taste_identity') || "나만의 미식을 찾아가는 중";

  // 2. Calculate Taste Stats
  const tasteStats = useMemo(() => {
    if (records.length === 0) return null;
    
    const sums = records.reduce((acc, r) => ({
      spiciness: acc.spiciness + r.tasteProfile.spiciness,
      sweetness: acc.sweetness + r.tasteProfile.sweetness,
      saltiness: acc.saltiness + r.tasteProfile.saltiness,
      acidity: acc.acidity + r.tasteProfile.acidity,
      richness: acc.richness + r.tasteProfile.richness,
    }), { spiciness: 0, sweetness: 0, saltiness: 0, acidity: 0, richness: 0 });

    const count = records.length;
    return {
      spiciness: sums.spiciness / count,
      sweetness: sums.sweetness / count,
      saltiness: sums.saltiness / count,
      acidity: sums.acidity / count,
      richness: sums.richness / count,
    };
  }, [records]);

  // 3. Calculate Top Keywords
  const topKeywords = useMemo(() => {
    const counts: Record<string, number> = {};
    records.forEach(r => {
        r.keywords.forEach(k => {
            counts[k] = (counts[k] || 0) + 1;
        });
    });
    return Object.entries(counts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([key]) => key);
  }, [records]);

  // Helper for Taste Description
  const getTasteLabel = (val: number, type: string) => {
    if (type === 'spiciness') return val > 3.5 ? '화끈한 매운맛 매니아' : val > 2 ? '적당한 매콤함 선호' : '순한맛 지향';
    if (type === 'sweetness') return val > 3.5 ? '달콤한 디저트 러버' : val > 2 ? '은은한 단맛 선호' : '단맛은 적게';
    if (type === 'richness') return val > 3.5 ? '진하고 묵직한 바디감' : val > 2 ? '적당한 풍미' : '가볍고 깔끔한 맛';
    return val > 3 ? '강한 풍미 선호' : '밸런스 중시';
  };

  const renderTasteRow = (label: string, value: number, key: string, colorClass: string) => (
    <div className="mb-4">
        <div className="flex justify-between items-end mb-1">
            <span className="text-xs font-bold text-gray-500">{label}</span>
            <span className="text-[10px] font-medium text-primary">{getTasteLabel(value, key)}</span>
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
    <Layout title="마이 미식 리포트" showBack hasTabBar={true}>
      <div className="pb-8 px-5 pt-4">
        
        {/* 1. Identity Card */}
        <section className="bg-secondary text-white rounded-[2rem] p-6 shadow-xl relative overflow-hidden mb-6">
             {/* Background Deco */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl -translate-y-10 translate-x-10"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl translate-y-10 -translate-x-10"></div>

            <div className="relative z-10 flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-full p-1 bg-gradient-to-tr from-primary to-yellow-400 mb-3">
                    <img 
                        src="https://images.unsplash.com/photo-1563237023-b1e970526dcb?auto=format&fit=crop&w=400&q=80" 
                        alt="Profile" 
                        className="w-full h-full object-cover rounded-full border-2 border-secondary"
                    />
                </div>
                
                <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-xl font-bold">edwards</h2>
                    <span className="bg-white/10 text-white px-2 py-0.5 rounded text-[10px] font-bold border border-white/20">
                        Lv.{level}
                    </span>
                </div>

                <div className="bg-white/10 backdrop-blur-md rounded-xl px-4 py-2 mt-2 border border-white/10">
                    <div className="flex items-center justify-center gap-2 text-orange-300 mb-1">
                        <Sparkles size={14} />
                        <span className="text-[10px] font-bold tracking-widest uppercase">TASTE IDENTITY</span>
                    </div>
                    <p className="text-sm font-medium leading-relaxed">"{tasteIdentity}"</p>
                </div>

                {/* Next Level Progress */}
                <div className="w-full mt-6">
                    <div className="flex justify-between text-[10px] text-gray-400 mb-1.5">
                        <span>Current Lv.{level}</span>
                        <span className="text-primary">Next Lv.{level + 1}</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                        <div 
                            className="h-full bg-gradient-to-r from-primary to-yellow-400"
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                    <p className="text-[10px] text-gray-400 mt-2 text-right">
                        다음 레벨까지 기록 <span className="text-white font-bold">{nextLevelThreshold - records.length}</span>개 남음
                    </p>
                </div>
            </div>
        </section>

        {/* 2. Taste DNA Analysis */}
        <section className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mb-6">
            <div className="flex items-center gap-2 mb-6">
                <div className="p-2 bg-orange-50 rounded-lg text-primary">
                    <TrendingUp size={20} />
                </div>
                <div>
                    <h3 className="font-bold text-secondary text-lg">나의 입맛 DNA</h3>
                    <p className="text-xs text-gray-400">기록을 바탕으로 분석한 평균 데이터</p>
                </div>
            </div>

            {tasteStats ? (
                <div className="space-y-1">
                    {renderTasteRow('맵기 선호도', tasteStats.spiciness, 'spiciness', 'bg-red-400')}
                    {renderTasteRow('단맛 선호도', tasteStats.sweetness, 'sweetness', 'bg-pink-400')}
                    {renderTasteRow('바디감/풍미', tasteStats.richness, 'richness', 'bg-orange-400')}
                </div>
            ) : (
                <p className="text-center text-gray-400 text-sm py-4">아직 분석할 데이터가 부족해요</p>
            )}

            {/* Top Keywords */}
            {topKeywords.length > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-50">
                    <h4 className="text-xs font-bold text-gray-400 mb-3 flex items-center">
                        <Hash size={12} className="mr-1" /> 자주 쓰는 표현
                    </h4>
                    <div className="flex flex-wrap gap-2">
                        {topKeywords.map(k => (
                            <span key={k} className="px-3 py-1.5 bg-secondary text-white rounded-xl text-xs font-bold shadow-sm">
                                #{k}
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </section>

        {/* 3. Badge Collection */}
        <section>
            <div className="flex items-center justify-between mb-4 px-1">
                <h3 className="font-bold text-secondary text-lg flex items-center">
                    <Trophy className="text-yellow-500 mr-2" size={20} />
                    수집한 뱃지
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
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-transform group-hover:scale-110 ${
                        isUnlocked ? badge.color : 'bg-gray-200 text-gray-400 grayscale'
                    }`}>
                        {isUnlocked ? badge.icon : <Lock size={16} />}
                    </div>
                    
                    <span className={`text-[10px] font-bold leading-tight ${isUnlocked ? 'text-secondary' : 'text-gray-400'}`}>
                        {badge.label}
                    </span>

                    {!isUnlocked && (
                        <div className="absolute inset-0 bg-white/0 group-hover:bg-white/90 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                            <p className="text-[9px] text-gray-500 px-2 font-medium break-keep">
                                {badge.description}
                            </p>
                        </div>
                    )}
                  </div>
                );
              })}
           </div>
        </section>

        {/* Motivation Text */}
        <div className="mt-8 text-center pb-4">
            <p className="text-xs text-gray-400">
                더 많은 기록을 남기고<br/>새로운 미식 칭호를 획득해보세요!
            </p>
        </div>

      </div>
    </Layout>
  );
};
