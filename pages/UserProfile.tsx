
import React, { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Utensils, Trophy, Check, UserPlus, Sparkles, TrendingUp, Hash } from 'lucide-react';
import { Layout } from '../components/Layout';
import { BottomTabBar } from '../components/BottomTabBar';
import { ReviewRecord, Preference } from '../types';
import { calculateLevel } from '../utils/gamification';

const DUMMY_USER_RECORDS: ReviewRecord[] = [
  {
    id: 'u-1',
    title: '카페 레이어드',
    category: '카페',
    photos: ['https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=800&q=80'],
    representativePhoto: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=800&q=80',
    preference: Preference.GOOD,
    menu: '스콘, 얼그레이 케이크',
    visitDate: '2024-05-15',
    companions: '친구',
    tasteProfile: { spiciness: 1, sweetness: 5, saltiness: 2, acidity: 2, richness: 4 },
    keywords: ['감성적', '데이트용', '부드러운'],
    aiGeneratedText: '입안 가득 퍼지는 얼그레이의 향긋함과 스콘의 고소한 버터 풍미가 완벽한 조화를 이룬다.',
    createdAt: 1715700000000,
    rank: 1
  },
  {
    id: 'u-2',
    title: '블루보틀 성수',
    category: '카페',
    photos: ['https://images.unsplash.com/photo-1559496417-e7f25cb247f3?auto=format&fit=crop&w=800&q=80'],
    representativePhoto: 'https://images.unsplash.com/photo-1559496417-e7f25cb247f3?auto=format&fit=crop&w=800&q=80',
    preference: Preference.GOOD,
    menu: '뉴올리언스 아이스',
    visitDate: '2024-05-22',
    companions: '친구',
    tasteProfile: { spiciness: 1, sweetness: 4, saltiness: 1, acidity: 2, richness: 4 },
    keywords: ['감성적', '데이트용', '힙한'],
    aiGeneratedText: '부드러운 우유와 거친 커피 텍스처의 조화가 훌륭하다.',
    createdAt: 1716300000000,
    rank: 2
  },
  {
    id: 'u-3',
    title: '다운타우너',
    category: '버거',
    photos: ['https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?auto=format&fit=crop&w=800&q=80'],
    representativePhoto: 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?auto=format&fit=crop&w=800&q=80',
    preference: Preference.NORMAL,
    menu: '아보카도 버거',
    visitDate: '2024-05-10',
    companions: '혼자',
    tasteProfile: { spiciness: 2, sweetness: 2, saltiness: 4, acidity: 2, richness: 5 },
    keywords: ['묵직한', '웨이팅필수'],
    aiGeneratedText: '아보카도의 크리미함이 패티의 육즙과 환상적으로 어우러진다.',
    createdAt: 1715300000000
  }
];

interface UserProfileProps {
  currentUserRecords?: ReviewRecord[];
}

export const UserProfile: React.FC<UserProfileProps> = ({ currentUserRecords = [] }) => {
  const { userId } = useParams<{ userId: string }>();
  const [isFollowing, setIsFollowing] = useState(false);
  
  const displayName = decodeURIComponent(userId || 'User');
  const { level } = calculateLevel(DUMMY_USER_RECORDS.length);
  
  // Format date helper
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('ko-KR', {
      month: 'long',
      day: 'numeric'
    });
  };

  // --- 1. Calculate Taste Stats (For DNA Section) ---
  const tasteStats = useMemo(() => {
    const records = DUMMY_USER_RECORDS;
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
  }, []);

  // --- 2. Calculate Top Keywords ---
  const topKeywords = useMemo(() => {
    const counts: Record<string, number> = {};
    DUMMY_USER_RECORDS.forEach(r => {
        r.keywords.forEach(k => {
            counts[k] = (counts[k] || 0) + 1;
        });
    });
    return Object.entries(counts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([key]) => key);
  }, []);

  // --- 3. Taste Match Logic ---
  const matchResult = useMemo(() => {
    if (currentUserRecords.length === 0) return null;
    if (DUMMY_USER_RECORDS.length === 0) return null;

    const getAverageProfile = (records: ReviewRecord[]) => {
      const sum = records.reduce((acc, r) => ({
        spiciness: acc.spiciness + r.tasteProfile.spiciness,
        sweetness: acc.sweetness + r.tasteProfile.sweetness,
        saltiness: acc.saltiness + r.tasteProfile.saltiness,
        acidity: acc.acidity + r.tasteProfile.acidity,
        richness: acc.richness + r.tasteProfile.richness,
      }), { spiciness: 0, sweetness: 0, saltiness: 0, acidity: 0, richness: 0 });

      const count = records.length;
      return {
        spiciness: sum.spiciness / count,
        sweetness: sum.sweetness / count,
        saltiness: sum.saltiness / count,
        acidity: sum.acidity / count,
        richness: sum.richness / count,
      };
    };

    const myProfile = getAverageProfile(currentUserRecords);
    const targetProfile = getAverageProfile(DUMMY_USER_RECORDS);

    const distance = 
      Math.abs(myProfile.spiciness - targetProfile.spiciness) +
      Math.abs(myProfile.sweetness - targetProfile.sweetness) +
      Math.abs(myProfile.saltiness - targetProfile.saltiness) +
      Math.abs(myProfile.acidity - targetProfile.acidity) +
      Math.abs(myProfile.richness - targetProfile.richness);

    const score = Math.round(Math.max(0, 100 - (distance / 20 * 100)));
    
    let label = "알아가는 단계";
    if (score >= 90) label = "영혼의 미식 단짝";
    else if (score >= 70) label = "꽤 잘 맞아요";
    else if (score >= 50) label = "서로 다른 매력";
    
    return { score, label };
  }, [currentUserRecords]);

  // Helper for Taste Description (Same as Achievement)
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
    <Layout title={displayName} showBack hasTabBar={true}>
      <div className="pb-8 px-5 pt-4 relative min-h-full">
        
        {/* 1. Hero Card: Profile + Taste Match */}
        <section className="bg-secondary text-white rounded-[2rem] p-6 shadow-xl relative overflow-hidden mb-6">
            {/* Background Deco */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl -translate-y-10 translate-x-10"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl translate-y-10 -translate-x-10"></div>

            <div className="relative z-10 flex flex-col items-center text-center">
                {/* Avatar */}
                <div className="w-20 h-20 rounded-full p-1 bg-gradient-to-tr from-gray-700 to-gray-500 mb-3">
                    <img 
                        src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=400&q=80" 
                        alt={displayName} 
                        className="w-full h-full object-cover rounded-full border-2 border-secondary"
                    />
                </div>

                {/* Name & Level */}
                <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-xl font-bold">{displayName}</h2>
                    <span className="bg-white/10 text-white px-2 py-0.5 rounded text-[10px] font-bold border border-white/20">
                        Lv.{level}
                    </span>
                </div>

                {/* Identity Text (Dummy) */}
                <div className="bg-white/10 backdrop-blur-md rounded-xl px-4 py-2 mt-2 border border-white/10 mb-6">
                    <div className="flex items-center justify-center gap-2 text-orange-300 mb-1">
                        <Sparkles size={14} />
                        <span className="text-[10px] font-bold tracking-widest uppercase">TASTE IDENTITY</span>
                    </div>
                    <p className="text-sm font-medium leading-relaxed">"섬세한 향미를 즐기는 카페 탐험가"</p>
                </div>

                {/* Taste Match Section */}
                {matchResult && (
                    <div className="w-full bg-gray-800/50 rounded-2xl p-4 border border-white/5 flex items-center justify-between">
                        <div className="text-left">
                             <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-0.5">TASTE MATCH</span>
                             <span className="text-sm font-bold text-white">{matchResult.label}</span>
                        </div>
                        <div className="text-right">
                            <span className={`text-2xl font-black ${matchResult.score >= 80 ? 'text-primary' : 'text-white'}`}>
                                {matchResult.score}%
                            </span>
                        </div>
                    </div>
                )}
                
                {/* Follow Button */}
                <button 
                    onClick={() => setIsFollowing(!isFollowing)}
                    className={`w-full mt-4 py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 active:scale-95 ${
                        isFollowing 
                        ? 'bg-gray-700 text-white/70' 
                        : 'bg-primary text-white shadow-lg shadow-orange-900/20'
                    }`}
                >
                    {isFollowing ? (
                        <>
                            <Check size={16} /> 팔로잉
                        </>
                    ) : (
                        <>
                            <UserPlus size={16} /> 팔로우
                        </>
                    )}
                </button>
            </div>
        </section>

        {/* 2. User's Taste DNA Analysis */}
        <section className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mb-6">
            <div className="flex items-center gap-2 mb-6">
                <div className="p-2 bg-orange-50 rounded-lg text-primary">
                    <TrendingUp size={20} />
                </div>
                <div>
                    <h3 className="font-bold text-secondary text-lg">입맛 DNA</h3>
                    <p className="text-xs text-gray-400">{displayName}님의 취향 데이터</p>
                </div>
            </div>

            <div className="space-y-1">
                {renderTasteRow('맵기 선호도', tasteStats.spiciness, 'spiciness', 'bg-red-400')}
                {renderTasteRow('단맛 선호도', tasteStats.sweetness, 'sweetness', 'bg-pink-400')}
                {renderTasteRow('바디감/풍미', tasteStats.richness, 'richness', 'bg-orange-400')}
            </div>

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

        {/* 3. User Records Feed */}
        <section>
          <h3 className="text-lg font-bold text-secondary mb-4 flex items-center pl-1">
             <Utensils size={18} className="mr-2 text-gray-400" />
             최근 기록
          </h3>
          
          <div className="grid gap-4">
              {DUMMY_USER_RECORDS.map((record) => (
                <div key={record.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 flex h-32 relative">
                   {/* Rank Badge */}
                    {record.rank && (
                      <div className="absolute top-0 left-0 bg-yellow-400 text-white text-[10px] font-bold px-2 py-0.5 rounded-br-lg z-10 flex items-center shadow-sm">
                        <Trophy size={8} className="mr-1" />
                        #{record.rank}
                      </div>
                    )}

                    {/* Image */}
                    <div className="w-32 h-32 flex-shrink-0 bg-gray-100">
                        <img 
                          src={record.representativePhoto} 
                          alt={record.title} 
                          className="w-full h-full object-cover"
                        />
                    </div>
                    
                    {/* Content */}
                    <div className="p-4 flex flex-col justify-between flex-1 min-w-0">
                      <div>
                        <div className="flex justify-between items-start mb-1">
                            <h4 className="font-bold text-secondary truncate pr-2 text-base">{record.title}</h4>
                        </div>
                        <p className="text-xs text-gray-500 truncate mb-1">{record.menu}</p>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium inline-block ${
                             record.preference === '좋아요' ? 'bg-orange-50 text-primary' : 
                             record.preference === '보통' ? 'bg-gray-100 text-gray-600' : 'bg-gray-50 text-gray-400'
                          }`}>
                            {record.preference}
                          </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex gap-1 overflow-hidden">
                           {record.keywords?.slice(0, 2).map(k => (
                                <span key={k} className="text-[9px] bg-gray-50 text-gray-500 px-1.5 py-0.5 rounded border border-gray-100 truncate max-w-[60px]">#{k}</span>
                            ))}
                        </div>
                        <span className="text-[10px] text-gray-300 flex-shrink-0 ml-2">
                          {formatDate(record.createdAt)}
                        </span>
                      </div>
                    </div>
                </div>
              ))}
            </div>
        </section>

        <BottomTabBar activeTab="feed" />
      </div>
    </Layout>
  );
};
