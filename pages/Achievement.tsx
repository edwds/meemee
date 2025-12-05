
import React, { useMemo } from 'react';
import { Layout } from '../components/Layout';
import { ReviewRecord, Preference } from '../types';
import { calculateLevel, BADGES, calculateGourmetMBTI } from '../utils/gamification';
import { Trophy, Lock, Star, Target, Crown, Utensils, TrendingUp, ChevronRight, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

interface AchievementProps {
  records: ReviewRecord[];
}

export const Achievement: React.FC<AchievementProps> = ({ records }) => {
  const navigate = useNavigate();
  const { level, nextLevelThreshold, progress } = calculateLevel(records.length);
  const earnedBadgeIds = BADGES.filter(b => b.condition(records)).map(b => b.id);
  const mbti = useMemo(() => calculateGourmetMBTI(records), [records]);
  
  // 1. Soul Foods (Top Categories)
  const soulFoods = useMemo(() => {
    const counts: Record<string, number> = {};
    records.forEach(r => { if(r.category) counts[r.category] = (counts[r.category] || 0) + 1; });
    return Object.entries(counts).sort((a,b) => b[1] - a[1]).slice(0, 3);
  }, [records]);

  // 2. Hall of Fame (Top Ranked Restaurants)
  const topRestaurants = useMemo(() => {
     return records
        .filter(r => r.preference === Preference.GOOD && r.rank)
        .sort((a, b) => (a.rank || 999) - (b.rank || 999))
        .slice(0, 3);
  }, [records]);

  // 3. Next Quest
  const nextQuest = useMemo(() => {
      const unearned = BADGES.find(b => !earnedBadgeIds.includes(b.id));
      return unearned 
        ? { badge: unearned, label: "다음 뱃지 도전" } 
        : { badge: null, label: "마스터 달성!" };
  }, [earnedBadgeIds]);

  return (
    <Layout title="" hideHeader={true} hasTabBar={false} backgroundColor="bg-black">
      <div className="pb-10 min-h-full text-white px-5">
        
        {/* Floating Back Button */}
        <div className="sticky top-0 z-50 pt-4 pb-2 bg-black/80 backdrop-blur-sm -mx-5 px-5 mb-2">
            <button 
                onClick={() => navigate(-1)} 
                className="w-10 h-10 rounded-full bg-[#1A1A1A] border border-white/10 flex items-center justify-center text-white hover:bg-[#252525] transition-colors"
            >
                <ArrowLeft size={20} />
            </button>
        </div>
        
        {/* 1. IDENTITY CARD */}
        <section className="bg-[#1A1A1A] rounded-[2rem] p-6 shadow-xl border border-white/5 relative overflow-hidden mb-8">
            <div className="flex items-center gap-5 relative z-10">
                <div className="relative">
                    <div className="w-20 h-20 rounded-full p-1 bg-gradient-to-tr from-primary to-gray-700">
                         <img 
                            src="https://images.unsplash.com/photo-1563237023-b1e970526dcb?auto=format&fit=crop&w=400&q=80" 
                            className="w-full h-full object-cover rounded-full border-4 border-[#1A1A1A]" 
                            alt="User"
                        />
                    </div>
                    <div className="absolute -bottom-1 -right-1 bg-white text-black text-xs font-black px-2 py-0.5 rounded-lg border-2 border-[#1A1A1A]">
                        Lv.{level}
                    </div>
                </div>
                <div>
                    <h2 className="text-2xl font-black mb-1">edwards</h2>
                    {mbti ? (
                        <div>
                             <div className="flex items-center gap-2 mb-1">
                                <span className="text-primary font-black text-lg tracking-tight">{mbti.code}</span>
                                <span className="text-[10px] text-gray-400 font-bold uppercase border border-white/10 px-1.5 py-0.5 rounded">{mbti.title}</span>
                             </div>
                             <p className="text-xs text-gray-500 font-medium line-clamp-1">"{mbti.nuance}"</p>
                        </div>
                    ) : (
                        <p className="text-xs text-gray-500">기록을 시작해보세요.</p>
                    )}
                </div>
            </div>
            {/* Background Deco */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -translate-y-10 translate-x-10"></div>
        </section>

        {/* 2. PREFERENCES */}
        <section className="mb-10">
             <div className="flex items-center gap-2 mb-4">
                 <Utensils className="text-primary" size={20} />
                 <h3 className="font-bold text-lg">My Preferences</h3>
             </div>

             {/* Soul Food */}
             <div className="mb-6">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 pl-1">Soul Food</h4>
                <div className="flex gap-3">
                    {soulFoods.length > 0 ? soulFoods.map(([cat, count], idx) => (
                        <div key={cat} className="flex-1 bg-[#1A1A1A] rounded-2xl p-4 border border-white/5 flex flex-col items-center">
                            <span className={`text-lg font-black mb-1 ${idx === 0 ? 'text-white' : 'text-gray-400'}`}>{cat}</span>
                            <span className="text-xs text-gray-500 font-medium">{count} Records</span>
                        </div>
                    )) : (
                        <div className="w-full text-center py-4 bg-[#1A1A1A] rounded-2xl text-xs text-gray-500">데이터가 부족합니다.</div>
                    )}
                </div>
             </div>

             {/* Hall of Fame */}
             <div>
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 pl-1">Hall of Fame</h4>
                <div className="space-y-3">
                    {topRestaurants.length > 0 ? topRestaurants.map((record) => (
                         <Link key={record.id} to={`/record/${record.id}`} className="flex items-center bg-[#1A1A1A] p-2 pr-4 rounded-2xl border border-white/5 active:scale-[0.98] transition-transform">
                             <div className="w-14 h-14 rounded-xl bg-gray-800 overflow-hidden relative mr-4 flex-shrink-0">
                                 <img src={record.representativePhoto} className="w-full h-full object-cover" alt="" />
                                 <div className="absolute top-0 left-0 bg-yellow-500 text-black text-[9px] font-black px-1.5 py-0.5 rounded-br-lg">
                                     #{record.rank}
                                 </div>
                             </div>
                             <div className="flex-1 min-w-0">
                                 <h5 className="font-bold text-white text-base truncate">{record.title}</h5>
                                 <p className="text-xs text-gray-500 truncate">{record.menu}</p>
                             </div>
                             <ChevronRight size={16} className="text-gray-600" />
                         </Link>
                    )) : (
                        <div className="w-full text-center py-6 bg-[#1A1A1A] rounded-2xl text-xs text-gray-500">
                            '좋아요' 평가와 함께 랭킹을 매겨보세요.
                        </div>
                    )}
                </div>
             </div>
        </section>

        {/* 3. GROWTH */}
        <section className="mb-10">
             <div className="flex items-center gap-2 mb-4">
                 <TrendingUp className="text-green-500" size={20} />
                 <h3 className="font-bold text-lg">Growth</h3>
             </div>
             
             <div className="bg-[#1A1A1A] rounded-[2rem] p-6 border border-white/5">
                 {/* Level Progress */}
                 <div className="mb-6">
                     <div className="flex justify-between items-end mb-2">
                         <span className="text-sm font-bold text-white">Level {level}</span>
                         <span className="text-xs text-gray-500 font-medium">{records.length} / {nextLevelThreshold} XP</span>
                     </div>
                     <div className="h-3 w-full bg-gray-800 rounded-full overflow-hidden">
                         <div 
                            className="h-full bg-gradient-to-r from-primary to-yellow-500 rounded-full shadow-[0_0_10px_rgba(255,107,53,0.4)]" 
                            style={{ width: `${progress}%` }}
                         />
                     </div>
                 </div>

                 {/* Next Goal */}
                 {nextQuest.badge && (
                     <div className="bg-white/5 rounded-2xl p-4 flex items-center gap-4 border border-white/5">
                         <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-500">
                             <Target size={18} />
                         </div>
                         <div className="flex-1">
                             <div className="text-[10px] font-bold text-primary uppercase tracking-wider mb-0.5">NEXT GOAL</div>
                             <div className="text-sm font-bold text-white mb-0.5">{nextQuest.badge.label}</div>
                             <div className="text-xs text-gray-500">{nextQuest.badge.description}</div>
                         </div>
                     </div>
                 )}
             </div>
        </section>

        {/* 4. COLLECTION */}
        <section>
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Crown className="text-yellow-500" size={20} />
                    <h3 className="font-bold text-lg">Collection</h3>
                </div>
                <span className="text-xs font-bold text-gray-500 bg-[#1A1A1A] px-2 py-1 rounded-lg border border-white/5">
                    {earnedBadgeIds.length} / {BADGES.length}
                </span>
            </div>
            
            <div className="grid grid-cols-4 gap-3">
                {BADGES.map((badge) => {
                    const isUnlocked = earnedBadgeIds.includes(badge.id);
                    return (
                        <div key={badge.id} className="flex flex-col items-center gap-2">
                             <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border transition-all ${
                                 isUnlocked 
                                 ? 'bg-[#1A1A1A] border-primary/30 text-primary shadow-[0_0_15px_rgba(255,107,53,0.2)]' 
                                 : 'bg-[#111] border-white/5 text-gray-700'
                             }`}>
                                 {isUnlocked ? badge.icon : <Lock size={18} />}
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
