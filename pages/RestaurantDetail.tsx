
import React, { useMemo } from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import { MapPin, Users, Utensils, Star, MessageSquare, Trophy, Sparkles, Crown, TrendingUp } from 'lucide-react';
import { Layout } from '../components/Layout';
import { ReviewRecord, TasteProfile, Preference } from '../types';
import { DUMMY_DISCOVER_DATA } from '../data/dummyData';

interface RestaurantDetailProps {
  userRecords: ReviewRecord[];
}

export const RestaurantDetail: React.FC<RestaurantDetailProps> = ({ userRecords }) => {
  const { id } = useParams<{ id: string }>();
  const restaurant = DUMMY_DISCOVER_DATA.find(r => r.id === id);

  if (!restaurant) {
    return <Navigate to="/discover" />;
  }

  // 1. Calculate Match Score (Logic shared with Discover)
  const matchScore = useMemo(() => {
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
      Math.abs(userAvg.spiciness - restaurant.tasteProfile.spiciness) +
      Math.abs(userAvg.sweetness - restaurant.tasteProfile.sweetness) +
      Math.abs(userAvg.saltiness - restaurant.tasteProfile.saltiness) +
      Math.abs(userAvg.acidity - restaurant.tasteProfile.acidity) +
      Math.abs(userAvg.richness - restaurant.tasteProfile.richness);

    return Math.round(Math.max(10, Math.min(99, 100 - (dist / 20 * 100))));
  }, [userRecords, restaurant]);

  // 2. Find My Reviews for this place
  const myReviews = userRecords.filter(r => r.title === restaurant.name);
  const visitCount = myReviews.length;

  // 3. Logic for Top Visitor (Gamification)
  const topVisitor = useMemo(() => {
    // Mock logic: Assign random visit counts to friends for demo purposes
    // In a real app, this would come from the backend
    const friendsData = restaurant.visitedFriends.map((name, idx) => ({
        name,
        visits: Math.floor(Math.random() * 8) + 1, // Random 1-8 visits
        avatar: `https://i.pravatar.cc/150?u=${name}`
    }));

    // Find max among friends
    const maxFriend = friendsData.reduce((prev, curr) => (prev.visits > curr.visits ? prev : curr), { name: '', visits: 0, avatar: '' });

    // Compare with me
    if (visitCount >= maxFriend.visits && visitCount > 0) {
        return {
            name: 'edwards',
            isMe: true,
            visits: visitCount,
            avatar: 'https://images.unsplash.com/photo-1563237023-b1e970526dcb?auto=format&fit=crop&w=400&q=80'
        };
    } else if (maxFriend.visits > 0) {
        return {
            name: maxFriend.name,
            isMe: false,
            visits: maxFriend.visits,
            avatar: maxFriend.avatar
        };
    } else {
        // No one visited yet (fallback)
        return null; 
    }
  }, [visitCount, restaurant]);

  // 4. Mock Community Records (Rich Data)
  const communityRecords = [
    {
      id: 'cr-1',
      author: '미식탐험가',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80',
      date: '3일 전',
      preference: Preference.GOOD,
      photo: restaurant.photo,
      tasteProfile: { ...restaurant.tasteProfile, spiciness: Math.max(1, restaurant.tasteProfile.spiciness - 1) },
      keywords: restaurant.keywords,
      aiText: `전반적으로 ${restaurant.keywords[0]} 느낌이 강해서 좋았습니다. 특히 재료의 신선함이 살아있어 ${restaurant.menu.split(',')[0]}의 풍미가 배가되는 경험이었습니다.`
    },
    {
      id: 'cr-2',
      author: '맛스타',
      avatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&w=100&q=80',
      date: '1주 전',
      preference: Preference.NORMAL,
      photo: restaurant.photo, 
      tasteProfile: { ...restaurant.tasteProfile, sweetness: Math.min(5, restaurant.tasteProfile.sweetness + 1) },
      keywords: ['웨이팅있음', '친절함'],
      aiText: '기대했던 것보다는 평범했지만, 분위기가 깡패라 데이트하기엔 최적입니다. 맛의 밸런스는 좋았으나 임팩트가 살짝 부족한 느낌.'
    }
  ];

  const renderTasteMiniBar = (label: string, value: number) => (
    <div className="flex flex-col items-center space-y-1 w-full">
      <div className="h-10 w-1.5 bg-gray-100 rounded-full relative flex items-end overflow-hidden">
        <div 
            className="w-full bg-secondary/80 rounded-full"
            style={{ height: `${(value / 5) * 100}%` }}
        />
      </div>
      <span className="text-[8px] text-gray-400 font-medium">{label}</span>
    </div>
  );

  return (
    <Layout title={restaurant.name} showBack hasTabBar={false}>
      <div className="pb-safe min-h-full bg-white">
        
        {/* Hero Section */}
        <div className="relative h-64 w-full">
          <img src={restaurant.photo} alt={restaurant.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
          
          <div className="absolute bottom-0 left-0 w-full p-6 text-white">
             <div className="flex items-center gap-2 text-sm font-medium mb-1 opacity-90">
                <span className="bg-white/20 backdrop-blur-md px-2 py-0.5 rounded">{restaurant.category}</span>
                <span className="flex items-center"><MapPin size={14} className="mr-1"/> 서울, 성수</span>
             </div>
             <h1 className="text-3xl font-bold mb-1">{restaurant.name}</h1>
          </div>

          {/* Match Badge */}
          <div className="absolute bottom-6 right-6">
             <div className="w-16 h-16 bg-white/10 backdrop-blur-xl rounded-full border border-white/20 flex flex-col items-center justify-center shadow-xl">
                <span className="text-[10px] text-white/80 uppercase font-bold">Match</span>
                <span className={`text-xl font-black ${matchScore >= 80 ? 'text-primary' : 'text-white'}`}>
                    {matchScore}%
                </span>
             </div>
          </div>
        </div>

        <div className="px-5 -mt-4 relative z-10">
            
            {/* --- NEW: Master & Visit Stats Card --- */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-50 p-5 mb-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-secondary flex items-center">
                        <Crown size={18} className="mr-2 text-yellow-500 fill-yellow-500" />
                        이 구역의 마스터
                    </h3>
                    {topVisitor && !topVisitor.isMe && (
                         <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded font-medium">
                            Top: {topVisitor.visits}회
                         </span>
                    )}
                </div>

                {topVisitor ? (
                    <div className="flex items-center bg-gray-50 rounded-xl p-3 mb-4">
                         <div className="w-10 h-10 rounded-full border-2 border-white shadow-sm overflow-hidden mr-3">
                             <img src={topVisitor.avatar} className="w-full h-full object-cover" alt="" />
                         </div>
                         <div className="flex-1">
                             <div className="flex items-center gap-2">
                                 <span className="font-bold text-secondary text-sm">{topVisitor.name}</span>
                                 {topVisitor.isMe && <span className="bg-primary/10 text-primary text-[10px] px-1.5 rounded font-bold">YOU</span>}
                             </div>
                             <p className="text-xs text-gray-400">총 {topVisitor.visits}회 방문하여 마스터 등극</p>
                         </div>
                         <div className="text-2xl">🥇</div>
                    </div>
                ) : (
                    <div className="text-center py-4 bg-gray-50 rounded-xl mb-4 text-xs text-gray-400">
                        아직 마스터가 없어요. 첫 번째 마스터가 되어보세요!
                    </div>
                )}

                {/* My Progress */}
                <div>
                    <div className="flex justify-between items-end mb-2">
                        <span className="text-xs font-bold text-gray-500">나의 방문 기록</span>
                        <span className="text-sm font-bold text-primary">{visitCount}회</span>
                    </div>
                    
                    {topVisitor && !topVisitor.isMe ? (
                        <div className="relative pt-1">
                            <div className="overflow-hidden h-2 mb-1 text-xs flex rounded-full bg-gray-100">
                                <div style={{ width: `${(visitCount / (topVisitor.visits + 1)) * 100}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary transition-all duration-500"></div>
                            </div>
                            <p className="text-[10px] text-gray-400 text-right">
                                마스터 탈환까지 <span className="text-secondary font-bold">{topVisitor.visits - visitCount + 1}번</span> 남았어요!
                            </p>
                        </div>
                    ) : (
                        <div className="text-[10px] text-primary font-medium bg-primary/5 p-2 rounded text-center">
                            현재 이 구역의 마스터는 바로 당신입니다! 🎉
                        </div>
                    )}
                </div>
            </div>

            {/* Taste Info */}
            <div className="mb-8">
                <h3 className="font-bold text-secondary mb-3 flex items-center">
                    <Utensils size={18} className="mr-2 text-gray-400" />
                    대표 메뉴 & 키워드
                </h3>
                <p className="text-sm text-gray-600 mb-3">{restaurant.menu}</p>
                <div className="flex flex-wrap gap-2">
                    {restaurant.keywords.map(k => (
                        <span key={k} className="px-3 py-1 bg-gray-50 border border-gray-100 text-gray-500 rounded-xl text-xs font-medium">
                            #{k}
                        </span>
                    ))}
                </div>
            </div>

            {/* My Reviews Section */}
            {visitCount > 0 && (
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="font-bold text-primary flex items-center">
                            <Star size={18} className="mr-2 fill-primary" />
                            나의 기록 모아보기
                        </h3>
                    </div>

                    <div className="space-y-5">
                        {myReviews.map(review => (
                            <Link key={review.id} to={`/record/${review.id}`} className="block group active:scale-[0.99] transition-transform">
                                <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-orange-200 ring-2 ring-orange-50">
                                    {/* Header */}
                                    <div className="h-40 relative">
                                        <img src={review.representativePhoto} alt={review.title} className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                                        <div className="absolute bottom-3 left-4 text-white">
                                            <span className="text-[10px] bg-white/20 backdrop-blur px-2 py-0.5 rounded font-bold mb-1 inline-block">
                                                {review.visitDate}
                                            </span>
                                            <h4 className="font-bold text-lg">{review.menu}</h4>
                                        </div>
                                        <span className="absolute top-3 right-3 bg-white/90 text-primary text-[10px] font-bold px-2 py-1 rounded-full shadow-sm">
                                            {review.preference}
                                        </span>
                                    </div>
                                    <div className="p-4">
                                        <div className="flex items-start gap-3">
                                            <Sparkles size={16} className="text-primary flex-shrink-0 mt-0.5" />
                                            <p className="text-sm text-gray-700 font-serif leading-relaxed italic">
                                                "{review.aiGeneratedText}"
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {/* Community Logs */}
            <div className="pb-8">
                <h3 className="font-bold text-secondary mb-4 flex items-center">
                    <Users size={18} className="mr-2 text-gray-400" />
                    Community Logs
                </h3>
                
                <div className="space-y-6">
                    {communityRecords.map((record) => (
                        <div key={record.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 group active:scale-[0.99] transition-transform">
                            {/* Card Header */}
                            <div className="h-48 relative">
                                <img src={record.photo} className="w-full h-full object-cover" alt="" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                                
                                {/* Author Overlay */}
                                <div className="absolute top-4 left-4 flex items-center gap-2 z-10">
                                     <div className="w-8 h-8 rounded-full border border-white/30 p-0.5 bg-white/10 backdrop-blur-sm">
                                         <img src={record.avatar} className="w-full h-full rounded-full object-cover" alt={record.author} />
                                     </div>
                                     <div>
                                         <p className="text-white text-xs font-bold shadow-sm leading-none mb-0.5">{record.author}</p>
                                         <p className="text-white/70 text-[9px] font-medium">{record.date}</p>
                                     </div>
                                </div>

                                {/* Preference Badge */}
                                <span className={`absolute top-4 right-4 px-2 py-1 rounded-full text-[10px] font-bold backdrop-blur-md ${
                                    record.preference === Preference.GOOD ? 'bg-white/90 text-primary' : 
                                    record.preference === Preference.NORMAL ? 'bg-gray-900/50 text-white' : 'bg-gray-900/50 text-gray-300'
                                }`}>
                                    {record.preference}
                                </span>

                                {/* Footer Overlay */}
                                <div className="absolute bottom-0 left-0 w-full p-4 text-white">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-1.5">
                                            <Sparkles size={14} className="text-primary" />
                                            <span className="text-xs font-bold">Tasting Note</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4">
                                {/* Content */}
                                <div className="flex gap-4 mb-4">
                                     {/* Taste DNA Mini */}
                                     <div className="flex-1 bg-gray-50 rounded-xl p-3 px-2 flex items-center justify-between gap-1 border border-gray-100">
                                        {renderTasteMiniBar('매운', record.tasteProfile.spiciness)}
                                        {renderTasteMiniBar('단맛', record.tasteProfile.sweetness)}
                                        {renderTasteMiniBar('짠맛', record.tasteProfile.saltiness)}
                                        {renderTasteMiniBar('신맛', record.tasteProfile.acidity)}
                                        {renderTasteMiniBar('풍미', record.tasteProfile.richness)}
                                     </div>
                                </div>

                                <p className="text-sm text-gray-700 font-serif leading-relaxed mb-4 pl-2 border-l-2 border-primary/20 italic">
                                    "{record.aiText}"
                                </p>

                                <div className="flex flex-wrap gap-1.5">
                                    {record.keywords.map(k => (
                                        <span key={k} className="text-[10px] bg-white border border-gray-200 text-gray-500 px-2 py-0.5 rounded-lg">
                                            #{k}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
      </div>
    </Layout>
  );
};
