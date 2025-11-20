
import React, { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Utensils, TrendingUp, Hash, Check, UserPlus, MapPin, Sparkles } from 'lucide-react';
import { Layout } from '../components/Layout';
import { BottomTabBar } from '../components/BottomTabBar';
import { ReviewRecord, Preference } from '../types';
import { calculateLevel, calculateGourmetMBTI } from '../utils/gamification';

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
    aiGeneratedText: '입안 가득 퍼지는 얼그레이의 향긋함과 스콘의 고소한 버터 풍미가 완벽한 조화를 이룬다. 공간이 주는 따뜻한 무드가 미식의 즐거움을 더한다.',
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
    aiGeneratedText: '부드러운 우유와 거친 커피 텍스처의 조화가 훌륭하다. 특유의 단맛이 과하지 않게 여운을 남긴다.',
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
    aiGeneratedText: '아보카도의 크리미함이 패티의 육즙과 환상적으로 어우러진다. 묵직한 바디감이 인상적이다.',
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
  
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('ko-KR', {
      month: 'long',
      day: 'numeric'
    });
  };

  // Calculate MBTI for Friend
  const mbti = useMemo(() => calculateGourmetMBTI(DUMMY_USER_RECORDS), []);

  // Calculate Top Keywords
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

  // Calculate Taste Match
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

  const renderTasteRow = (label: string, value: number, colorClass: string) => (
    <div className="mb-3">
        <div className="flex justify-between items-end mb-1">
            <span className="text-[10px] font-bold text-gray-400">{label}</span>
            <span className="text-[10px] font-bold text-secondary">{value.toFixed(1)}</span>
        </div>
        <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
            <div 
                className={`h-full rounded-full transition-all duration-1000 ${colorClass}`} 
                style={{ width: `${(value / 5) * 100}%` }} 
            />
        </div>
    </div>
  );

  return (
    <Layout title={displayName} showBack hasTabBar={true}>
      <div className="pb-4 px-5 pt-4 relative min-h-full">
        
        {/* 1. Unified Gourmet ID Card */}
        <section className="bg-[#2E2E2E] text-white rounded-[2rem] p-6 shadow-xl relative overflow-hidden mb-6">
            {/* Background Deco */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-primary/20 rounded-full blur-[50px] -translate-y-10 translate-x-10"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/10 rounded-full blur-[40px] translate-y-5 -translate-x-5"></div>

            <div className="relative z-10">
                {/* Header: Avatar & Name */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-full p-0.5 bg-gradient-to-tr from-gray-600 to-gray-800">
                            <img 
                                src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=400&q=80" 
                                alt={displayName} 
                                className="w-full h-full object-cover rounded-full border-2 border-[#2E2E2E]"
                            />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold leading-tight mb-0.5">{displayName}</h2>
                            <span className="inline-block bg-white/10 text-gray-300 px-2 py-0.5 rounded text-[10px] font-bold border border-white/10">
                                Lv.{level} Gourmet Explorer
                            </span>
                        </div>
                    </div>
                    
                    <button 
                        onClick={() => setIsFollowing(!isFollowing)}
                        className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 active:scale-95 ${
                            isFollowing 
                            ? 'bg-gray-700 text-white/70 border border-gray-600' 
                            : 'bg-primary text-white shadow-lg shadow-orange-900/30 border border-primary'
                        }`}
                    >
                        {isFollowing ? <Check size={14} /> : <UserPlus size={14} />}
                        {isFollowing ? '팔로잉' : '팔로우'}
                    </button>
                </div>

                {/* MBTI Info */}
                {mbti && (
                    <div className="mb-6">
                        <div className="flex items-baseline gap-2 mb-1">
                             <div className="text-4xl font-black tracking-tighter text-white">{mbti.code}</div>
                             <div className="text-sm font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
                                 {mbti.title}
                             </div>
                        </div>
                        <p className="text-xs text-gray-400 leading-relaxed mb-3 font-medium pl-1 border-l-2 border-white/10">
                            "{mbti.nuance}"
                        </p>
                        
                        {/* Favorite Categories */}
                        {mbti.favoriteCategories.length > 0 && (
                             <div className="flex gap-2 mt-2">
                                {mbti.favoriteCategories.map(cat => (
                                    <span key={cat} className="text-[10px] bg-black/30 px-2.5 py-1 rounded-lg border border-white/5 text-gray-300">
                                        {cat}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Taste Match Bar */}
                {matchResult && (
                    <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                        <div className="flex justify-between items-center mb-2">
                             <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">TASTE MATCH</span>
                             <span className="text-xs font-bold text-white">{matchResult.score}% <span className="text-gray-500 font-normal">({matchResult.label})</span></span>
                        </div>
                        <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                             <div 
                                className={`h-full rounded-full ${matchResult.score >= 80 ? 'bg-primary' : 'bg-white'}`}
                                style={{ width: `${matchResult.score}%` }}
                             ></div>
                        </div>
                    </div>
                )}
            </div>
        </section>

        {/* 2. Taste DNA Stats */}
        <section className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mb-6">
            <div className="flex items-center gap-2 mb-5">
                <div className="p-2 bg-orange-50 rounded-lg text-primary">
                    <TrendingUp size={18} />
                </div>
                <h3 className="font-bold text-secondary text-base">입맛 DNA</h3>
            </div>

            {mbti && (
                 <div className="grid grid-cols-2 gap-x-8 gap-y-2">
                    {renderTasteRow('맵기 (Kick)', mbti.scores.spiciness, 'bg-red-400')}
                    {renderTasteRow('단맛 (Main)', mbti.scores.sweetness, 'bg-pink-400')}
                    {renderTasteRow('짠맛 (Main)', mbti.scores.saltiness, 'bg-blue-400')}
                    {renderTasteRow('풍미 (Body)', mbti.scores.richness, 'bg-orange-400')}
                </div>
            )}

            {/* Top Keywords */}
            {topKeywords.length > 0 && (
                <div className="mt-5 pt-5 border-t border-gray-50">
                    <div className="flex items-center gap-2 mb-3">
                         <Hash size={14} className="text-gray-400" />
                         <span className="text-xs font-bold text-gray-400">자주 쓰는 표현</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {topKeywords.map(k => (
                            <span key={k} className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-xl text-xs font-bold">
                                #{k}
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </section>

        {/* 3. Gourmet Logs (Feed Style) */}
        <section>
          <h3 className="text-lg font-bold text-secondary mb-4 flex items-center pl-1">
             <Utensils size={18} className="mr-2 text-gray-400" />
             미식 로그
          </h3>
          
          <div className="space-y-4">
              {DUMMY_USER_RECORDS.map((record) => (
                <div key={record.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 group active:scale-[0.99] transition-transform">
                    {/* Card Header */}
                    <div className="h-40 relative">
                        <img 
                          src={record.representativePhoto} 
                          alt={record.title} 
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                        <div className="absolute bottom-3 left-4 text-white">
                            <div className="flex items-center gap-1 text-[10px] opacity-90 mb-0.5">
                                <MapPin size={10} />
                                {record.category}
                            </div>
                            <h4 className="font-bold text-lg leading-none">{record.title}</h4>
                        </div>
                        <span className={`absolute top-3 right-3 text-[10px] px-2 py-1 rounded-full font-bold shadow-sm ${
                             record.preference === '좋아요' ? 'bg-white/90 text-primary' : 
                             'bg-gray-900/50 text-white backdrop-blur-md'
                          }`}>
                            {record.preference}
                        </span>
                    </div>
                    
                    {/* Card Body */}
                    <div className="p-4">
                        <div className="flex items-start gap-3 mb-3">
                            <Sparkles size={16} className="text-primary flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-gray-600 font-serif leading-relaxed italic">
                                "{record.aiGeneratedText.length > 60 ? record.aiGeneratedText.slice(0, 60) + '...' : record.aiGeneratedText}"
                            </p>
                        </div>

                        <div className="flex items-center justify-between border-t border-gray-50 pt-3">
                             <span className="text-xs font-medium text-gray-500">{record.menu}</span>
                             <span className="text-[10px] text-gray-300">{formatDate(record.createdAt)}</span>
                        </div>
                    </div>
                </div>
              ))}
            </div>
        </section>
        
        <div className="h-20"></div>
        <BottomTabBar activeTab="feed" />
      </div>
    </Layout>
  );
};
