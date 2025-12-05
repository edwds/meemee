
import React, { useMemo } from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import { MapPin, Users, Utensils, Crown, CalendarCheck, Sparkles, Heart, ChevronRight, Share2, ArrowLeft } from 'lucide-react';
import { Layout } from '../components/Layout';
import { ReviewRecord, Preference, TasteProfile } from '../types';
import { DUMMY_DISCOVER_DATA, MOCK_FEED_POSTS, MOCK_GROUP_USERS } from '../data/dummyData';

interface RestaurantDetailProps { userRecords: ReviewRecord[]; }

export const RestaurantDetail: React.FC<RestaurantDetailProps> = ({ userRecords }) => {
  const { id } = useParams<{ id: string }>();
  const restaurant = DUMMY_DISCOVER_DATA.find(r => r.id === id);
  const navigate = window.history.back; // Simplified nav for demo

  if (!restaurant) return <Navigate to="/discover" />;

  // 1. Calculate Match Score Logic (Reused from Discover)
  const matchResult = useMemo(() => {
    if (userRecords.length === 0) return { score: 85, label: "취향 저격!" };

    const sums = userRecords.reduce((acc, r) => ({
      spiciness: acc.spiciness + r.tasteProfile.spiciness,
      sweetness: acc.sweetness + r.tasteProfile.sweetness,
      saltiness: acc.saltiness + r.tasteProfile.saltiness,
      acidity: acc.acidity + r.tasteProfile.acidity,
      richness: acc.richness + r.tasteProfile.richness,
    }), { spiciness: 0, sweetness: 0, saltiness: 0, acidity: 0, richness: 0 });

    const count = userRecords.length;
    const userAvg = {
      spiciness: sums.spiciness / count,
      sweetness: sums.sweetness / count,
      saltiness: sums.saltiness / count,
      acidity: sums.acidity / count,
      richness: sums.richness / count,
    };

    const dist = 
      Math.abs(userAvg.spiciness - restaurant.tasteProfile.spiciness) +
      Math.abs(userAvg.sweetness - restaurant.tasteProfile.sweetness) +
      Math.abs(userAvg.saltiness - restaurant.tasteProfile.saltiness) +
      Math.abs(userAvg.acidity - restaurant.tasteProfile.acidity) +
      Math.abs(userAvg.richness - restaurant.tasteProfile.richness);

    const score = Math.round(Math.max(10, Math.min(99, 100 - (dist / 20 * 100))));
    let label = "새로운 도전";
    if (score > 90) label = "운명적인 만남";
    else if (score > 80) label = "취향 저격";
    else if (score > 70) label = "믿고 먹는 곳";
    
    return { score, label };
  }, [userRecords, restaurant]);

  // Mock Friends Logic
  const friendsWhoLike = MOCK_GROUP_USERS.slice(0, 3); // Just pick first 3 for demo

  // Mock Logs Logic (Mix of real logs if any, plus mocks)
  const communityLogs = [
      ...MOCK_FEED_POSTS.map(p => ({ ...p.record, author: p.author })),
      { 
          id: 'mock-log-1', 
          title: restaurant.name,
          author: { name: '미식탐험가', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80' }, 
          preference: Preference.GOOD, 
          representativePhoto: restaurant.photo, 
          reviewText: `전반적으로 ${restaurant.keywords[0]} 느낌이 강해서 좋았습니다. 재방문 의사 100%!`,
          keywords: restaurant.keywords,
          visitDate: '2024-05-20',
          menu: restaurant.menu,
          category: restaurant.category,
          rank: undefined
      }
  ].slice(0, 5); // Limit to 5

  return (
    <Layout title="" hideHeader hasTabBar={false} backgroundColor="bg-black">
      <div className="pb-32 min-h-full bg-black text-white relative">
        
        {/* Floating Back Button */}
        <div className="fixed top-0 left-0 w-full z-40 px-4 py-4 flex justify-between items-center pointer-events-none">
             <Link to="/discover" className="w-10 h-10 rounded-full bg-black/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/40 transition-colors pointer-events-auto border border-white/10">
                 <ArrowLeft size={20} />
             </Link>
             <button className="w-10 h-10 rounded-full bg-black/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/40 transition-colors pointer-events-auto border border-white/10">
                 <Share2 size={20} />
             </button>
        </div>

        {/* 1. IMAGE (Hero) */}
        <div className="relative w-full aspect-[4/3]">
            <img src={restaurant.photo} className="w-full h-full object-cover" alt={restaurant.name} />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
            <div className="absolute bottom-0 left-0 w-full p-5">
                <span className="bg-primary/90 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider mb-2 inline-block">
                    {restaurant.category}
                </span>
                <h1 className="text-3xl font-black leading-tight drop-shadow-lg mb-1">{restaurant.name}</h1>
                <div className="flex items-center text-gray-300 text-xs">
                    <MapPin size={12} className="mr-1" />
                    {restaurant.area} · 1.2km
                </div>
            </div>
        </div>

        <div className="px-5 mt-6 space-y-8">
            
            {/* 2. KEYWORDS */}
            <div className="flex flex-wrap gap-2">
                {restaurant.keywords.map(k => (
                    <span key={k} className="px-3 py-1.5 rounded-lg border border-white/10 bg-[#1A1A1A] text-gray-300 text-xs font-medium">
                        #{k}
                    </span>
                ))}
            </div>

            {/* 3. MATCH SCORE */}
            <section className="bg-[#1A1A1A] rounded-2xl p-5 border border-white/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full blur-2xl -translate-y-5 translate-x-5"></div>
                <div className="relative z-10 flex items-center justify-between">
                    <div>
                        <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Taste Match</div>
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                            {matchResult.score}% <span className="text-sm font-medium text-gray-400">일치</span>
                        </h3>
                        <p className="text-xs text-primary mt-1">"{matchResult.label}"</p>
                    </div>
                    
                    {/* Visual Graph */}
                    <div className="w-16 h-16 relative flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90">
                            <circle cx="32" cy="32" r="28" stroke="#333" strokeWidth="4" fill="none" />
                            <circle 
                                cx="32" cy="32" r="28" 
                                stroke="#FF6B35" strokeWidth="4" fill="none" 
                                strokeDasharray="175" 
                                strokeDashoffset={175 - (175 * matchResult.score / 100)} 
                                strokeLinecap="round"
                            />
                        </svg>
                        <Sparkles size={16} className="absolute text-white" />
                    </div>
                </div>
            </section>

            {/* 4. FRIENDS */}
            <section>
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold text-gray-300">이곳을 좋아하는 친구</h3>
                    <ChevronRight size={16} className="text-gray-600" />
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex -space-x-3">
                        {friendsWhoLike.map((friend, i) => (
                            <img key={i} src={friend.avatar} className="w-10 h-10 rounded-full border-2 border-black object-cover" alt="" />
                        ))}
                        <div className="w-10 h-10 rounded-full border-2 border-black bg-gray-800 flex items-center justify-center text-[10px] font-bold text-gray-400">
                            +5
                        </div>
                    </div>
                    <p className="text-xs text-gray-500">
                        <span className="text-white font-bold">{friendsWhoLike[0].name}</span>님 외 5명이 방문했어요
                    </p>
                </div>
            </section>

            {/* 5. THE MASTER */}
            <section className="bg-gradient-to-br from-yellow-900/20 to-black rounded-2xl p-5 border border-yellow-500/20 relative overflow-hidden">
                <div className="flex items-center gap-4 relative z-10">
                    <div className="relative">
                        <img src="https://i.pravatar.cc/150?u=20" className="w-12 h-12 rounded-full border-2 border-yellow-500" alt="Master" />
                        <div className="absolute -top-2 -right-1">
                            <Crown size={16} className="text-yellow-500 fill-yellow-500" />
                        </div>
                    </div>
                    <div className="flex-1">
                        <div className="text-[10px] font-bold text-yellow-500 uppercase tracking-widest mb-0.5">Area Master</div>
                        <h3 className="text-base font-bold text-white">성수동 힙스터</h3>
                        <p className="text-xs text-gray-500">방문 12회 · 리뷰 12개</p>
                    </div>
                    <div className="text-right">
                        <div className="text-[10px] text-gray-500 mb-1">나의 랭킹</div>
                        <div className="text-lg font-black text-gray-300">4위</div>
                    </div>
                </div>
            </section>

            {/* 6. MENU */}
            <section>
                 <h3 className="text-sm font-bold text-gray-300 mb-3 flex items-center gap-2">
                    <Utensils size={16} /> 대표 메뉴
                 </h3>
                 <div className="bg-[#1A1A1A] p-4 rounded-2xl border border-white/5">
                     <p className="text-sm text-gray-300 leading-relaxed">{restaurant.menu}</p>
                 </div>
            </section>

            {/* 7. COMMUNITY LOGS */}
            <section>
                 <div className="flex items-center justify-between mb-4">
                     <h3 className="text-sm font-bold text-gray-300 flex items-center gap-2">
                        <Users size={16} /> Community Logs
                     </h3>
                     <span className="text-xs text-gray-500">Latest 5</span>
                 </div>
                 
                 <div className="space-y-4">
                     {communityLogs.map((log) => (
                         <Link key={log.id} to={`/record/${log.id}`} className="block group">
                             <div className="bg-[#1A1A1A] rounded-2xl overflow-hidden border border-white/5 shadow-lg">
                                 {/* Card Header Image */}
                                 <div className="h-40 relative">
                                     <img src={log.representativePhoto} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" alt="" />
                                     <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1A] to-transparent"></div>
                                     
                                     {/* Author Overlay */}
                                     <div className="absolute bottom-3 left-3 flex items-center gap-2">
                                         <img src={log.author?.avatar} className="w-6 h-6 rounded-full border border-white/20" alt="" />
                                         <span className="text-xs font-bold text-white">{log.author?.name}</span>
                                     </div>
                                 </div>
                                 
                                 {/* Content */}
                                 <div className="p-4 pt-2">
                                     <div className="flex gap-2 mb-2">
                                         {log.keywords.slice(0, 2).map(k => (
                                             <span key={k} className="text-[9px] bg-white/5 text-gray-400 px-1.5 py-0.5 rounded border border-white/5">#{k}</span>
                                         ))}
                                     </div>
                                     <div className="relative pl-3 border-l-2 border-primary/50">
                                         <p className="text-sm text-gray-300 font-serif italic line-clamp-2 leading-relaxed">
                                             "{log.reviewText}"
                                         </p>
                                     </div>
                                 </div>
                             </div>
                         </Link>
                     ))}
                 </div>
            </section>

        </div>
      </div>

      {/* 8. FLOATING CTA */}
      <div className="fixed bottom-0 left-0 w-full p-5 pb-8 bg-gradient-to-t from-black via-black to-transparent z-50">
          <a 
            href="https://app.catchtable.co.kr/" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="w-full bg-[#FE3D3D] text-white font-bold h-14 rounded-2xl flex items-center justify-center gap-2 shadow-[0_8px_20px_rgba(254,61,61,0.3)] active:scale-[0.98] transition-transform"
          >
              <CalendarCheck size={20} />
              <span>캐치테이블에서 예약하기</span>
          </a>
      </div>
    </Layout>
  );
};
