
import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Users, Utensils, ArrowRight, Compass, Zap, TrendingUp, Flag } from 'lucide-react';
import { Layout } from '../components/Layout';
import { BottomTabBar } from '../components/BottomTabBar';
import { ReviewRecord, TasteProfile, DiscoverRestaurant } from '../types';
import { DUMMY_DISCOVER_DATA } from '../data/dummyData';

interface DiscoverProps {
  userRecords: ReviewRecord[];
}

export const Discover: React.FC<DiscoverProps> = ({ userRecords }) => {

  // --- 1. Base Logic for Match Score ---
  const calculateMatchScore = useMemo(() => (restProfile: TasteProfile) => {
    if (userRecords.length === 0) return 80;

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
      Math.abs(userAvg.spiciness - restProfile.spiciness) +
      Math.abs(userAvg.sweetness - restProfile.sweetness) +
      Math.abs(userAvg.saltiness - restProfile.saltiness) +
      Math.abs(userAvg.acidity - restProfile.acidity) +
      Math.abs(userAvg.richness - restProfile.richness);

    return Math.round(Math.max(10, Math.min(99, 100 - (dist / 20 * 100))));
  }, [userRecords]);


  // --- 2. Section Logic ---

  // A. Personalized Top Picks (Based on High Match Score)
  const personalizedPicks = useMemo(() => {
    return [...DUMMY_DISCOVER_DATA]
      .map(r => ({ ...r, matchScore: calculateMatchScore(r.tasteProfile) }))
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 4);
  }, [calculateMatchScore]);

  // B. Friend Recommendation (Mock: "Minji" likes these)
  const friendName = "민지";
  const friendPicks = useMemo(() => {
    return DUMMY_DISCOVER_DATA.filter(r => r.visitedFriends.includes(friendName)).slice(0, 3);
  }, []);

  // C. Area Recommendation (Based on user's most visited area, or default 'Seongsu')
  const topArea = useMemo(() => {
    if (userRecords.length === 0) return '성수';
    const areaCounts: Record<string, number> = {};
    userRecords.forEach(r => {
        // Extract area from address if available, or use a mock mechanism
        const area = r.location?.address?.split(' ')[0] || '성수';
        areaCounts[area] = (areaCounts[area] || 0) + 1;
    });
    // Find key with max value
    return Object.entries(areaCounts).sort((a, b) => b[1] - a[1])[0][0];
  }, [userRecords]);

  const areaPicks = useMemo(() => {
    return DUMMY_DISCOVER_DATA.filter(r => r.area === topArea);
  }, [topArea]);

  // D. Challenge Category (A category user rarely visits)
  const challengeCategory = useMemo(() => {
    const visitedCats = new Set(userRecords.map(r => r.category));
    const allCats = Array.from(new Set(DUMMY_DISCOVER_DATA.map(d => d.category)));
    // Find a category in DUMMY that is NOT in user records
    const unvisited = allCats.find(c => !visitedCats.has(c));
    return unvisited || '이색 요리';
  }, [userRecords]);

  const challengePicks = useMemo(() => {
    return DUMMY_DISCOVER_DATA.filter(r => r.category === challengeCategory);
  }, [challengeCategory]);

  // E. Trending (Randomly selected 'Hot' places)
  const trendingPicks = useMemo(() => {
      // Just pick even indexed items for variety
      return DUMMY_DISCOVER_DATA.filter((_, i) => i % 2 === 0).slice(0, 4);
  }, []);


  // --- 3. Helper Components ---

  const HorizontalSection = ({ title, subtitle, icon: Icon, items }: { title: string, subtitle?: string, icon?: any, items: DiscoverRestaurant[] }) => (
    <div className="mb-8">
      <div className="flex items-center justify-between px-5 mb-3">
        <div>
            <div className="flex items-center gap-1.5 mb-0.5">
                {Icon && <Icon size={18} className="text-primary" />}
                <h3 className="text-lg font-bold text-white">{title}</h3>
            </div>
            {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
        </div>
        <button className="text-xs font-bold text-gray-500 hover:text-white flex items-center transition-colors">
            더보기 <ArrowRight size={12} className="ml-1" />
        </button>
      </div>

      <div className="flex overflow-x-auto px-5 gap-3 pb-4 no-scrollbar snap-x snap-mandatory">
        {items.length > 0 ? (
            items.map(item => {
                const score = calculateMatchScore(item.tasteProfile);
                return (
                    <Link 
                        key={item.id} 
                        to={`/restaurant/${item.id}`} 
                        className="flex-shrink-0 w-[260px] bg-[#1A1A1A] rounded-2xl overflow-hidden border border-white/5 shadow-lg snap-center active:scale-[0.98] transition-transform group"
                    >
                        <div className="h-36 relative overflow-hidden">
                            <img src={item.photo} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80 group-hover:opacity-100" />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1A] to-transparent opacity-60"></div>
                            <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-2 py-1 rounded-full border border-white/10 flex items-center gap-1">
                                <span className={`text-[10px] font-bold ${score >= 80 ? 'text-primary' : 'text-white'}`}>{score}%</span>
                            </div>
                            <div className="absolute bottom-2 left-2">
                                <span className="bg-black/50 backdrop-blur-md text-white text-[10px] px-1.5 py-0.5 rounded font-bold border border-white/5">
                                    {item.area}
                                </span>
                            </div>
                        </div>
                        <div className="p-4">
                            <div className="flex justify-between items-start mb-1">
                                <h4 className="font-bold text-white text-base truncate pr-2">{item.name}</h4>
                                <span className="text-[10px] text-gray-400 whitespace-nowrap bg-white/5 px-1.5 py-0.5 rounded">{item.category}</span>
                            </div>
                            <p className="text-xs text-gray-500 truncate mb-3 font-medium">{item.menu}</p>
                            <div className="flex gap-1 overflow-hidden">
                                {item.keywords.slice(0, 2).map(k => (
                                    <span key={k} className="text-[9px] bg-[#252525] text-gray-400 px-2 py-1 rounded border border-white/5 whitespace-nowrap">
                                        #{k}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </Link>
                );
            })
        ) : (
            <div className="w-full py-8 text-center bg-[#1A1A1A] rounded-2xl border border-dashed border-white/10">
                <p className="text-xs text-gray-500">추천할 장소가 없습니다 🥲</p>
            </div>
        )}
      </div>
    </div>
  );

  return (
    <Layout title="디스커버" hasTabBar={true} hideHeader={true} backgroundColor="bg-black">
      <div className="pb-32 pt-8 bg-black min-h-full">
        
        {/* Custom Header Title */}
        <div className="px-5 mb-8 flex items-center justify-between">
            <h1 className="text-3xl font-black text-white tracking-tight">Discover</h1>
            <span className="text-[10px] font-bold text-black bg-white px-2.5 py-1 rounded-full uppercase tracking-wider">
                Explorer
            </span>
        </div>
        
        {/* 1. Personalized Recommendation */}
        <HorizontalSection 
            title="나를 위한 취향 저격" 
            subtitle="내 입맛 데이터와 90% 이상 일치해요" 
            icon={Zap}
            items={personalizedPicks} 
        />

        {/* 2. Friend Recommendation */}
        <HorizontalSection 
            title={`${friendName}님과 함께라면`} 
            subtitle="친구가 최근에 극찬한 곳들이에요" 
            icon={Users}
            items={friendPicks} 
        />

        {/* 3. Area Recommendation */}
        <HorizontalSection 
            title={`자주 가는 ${topArea} 맛집`} 
            subtitle="아직 안 가본 숨은 보석을 찾아보세요" 
            icon={MapPin}
            items={areaPicks} 
        />

        {/* 4. Trending Now */}
        <div className="px-5 mb-8">
            <div className="flex items-center gap-1.5 mb-4">
                <TrendingUp size={18} className="text-red-500" />
                <h3 className="text-lg font-bold text-white">오늘 뜨는 곳 🔥</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
                {trendingPicks.slice(0, 4).map((item, idx) => (
                    <Link key={item.id} to={`/restaurant/${item.id}`} className="bg-[#1A1A1A] rounded-2xl p-3 flex items-center gap-3 border border-white/5 shadow-lg active:scale-[0.98] transition-transform group">
                        <div className="w-12 h-12 bg-gray-800 rounded-xl flex-shrink-0 overflow-hidden relative">
                            <img src={item.photo} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" alt="" />
                            <div className="absolute top-0 left-0 bg-white text-black text-[9px] font-black w-4 h-4 flex items-center justify-center rounded-br-lg">
                                {idx + 1}
                            </div>
                        </div>
                        <div className="min-w-0">
                            <h4 className="font-bold text-sm text-white truncate mb-0.5">{item.name}</h4>
                            <div className="flex items-center text-[10px] text-gray-500">
                                <MapPin size={10} className="mr-0.5" /> {item.area}
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>

        {/* 5. Challenge Category */}
        {challengePicks.length > 0 && (
            <div className="px-5 mb-8">
                 <div className="bg-gradient-to-br from-[#1A1A1A] to-black rounded-[2rem] p-6 text-white relative overflow-hidden border border-white/5 shadow-2xl">
                    {/* Deco */}
                    <div className="absolute top-0 right-0 w-40 h-40 bg-primary/20 rounded-full blur-3xl -translate-y-10 translate-x-10"></div>
                    
                    <div className="relative z-10 mb-5">
                        <div className="flex items-center gap-2 text-primary font-bold text-[10px] uppercase tracking-widest mb-1.5">
                            <Flag size={12} />
                            New Challenge
                        </div>
                        <h3 className="text-xl font-bold leading-tight">
                            맨날 먹던 것 말고<br/>
                            <span className="text-primary">{challengeCategory}</span> 어때요?
                        </h3>
                    </div>

                    <div className="space-y-3 relative z-10">
                        {challengePicks.slice(0, 2).map(item => (
                             <Link key={item.id} to={`/restaurant/${item.id}`} className="flex items-center bg-white/5 rounded-2xl p-2.5 hover:bg-white/10 transition-colors backdrop-blur-sm border border-white/5">
                                <img src={item.photo} className="w-12 h-12 rounded-xl object-cover mr-3 opacity-90" alt="" />
                                <div>
                                    <h4 className="font-bold text-sm text-white">{item.name}</h4>
                                    <p className="text-[10px] text-gray-400">{item.menu}</p>
                                </div>
                             </Link>
                        ))}
                    </div>
                 </div>
            </div>
        )}

      </div>
      
      <BottomTabBar activeTab="discover" />
    </Layout>
  );
};
