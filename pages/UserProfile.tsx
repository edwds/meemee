
import React, { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Utensils, Check, UserPlus, MapPin, Sparkles } from 'lucide-react';
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
    menu: '스콘', 
    visitDate: '2024-05-15', 
    companions: '친구', 
    tasteProfile: { spiciness: 1, sweetness: 5, saltiness: 2, acidity: 2, richness: 4 }, 
    detailedEvaluation: {
        venue: { atmosphere: ['유럽풍', '채광 좋은'], service: ['친절한'] },
        menu: { texture: ['촉촉한', '부드러운'], flavor: ['버터미', '향긋한'], note: ['여유로운'] }
    },
    keywords: ['유럽풍', '버터미', '촉촉한'], 
    reviewText: '얼그레이의 향긋함과 스콘의 버터 풍미가 완벽하다. 따뜻한 햇살 아래서 즐기는 여유로운 오후.', 
    createdAt: 1715700000000, 
    rank: 1
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
  const mbti = useMemo(() => calculateGourmetMBTI(DUMMY_USER_RECORDS), []);
  const matchResult = useMemo(() => {
    if (currentUserRecords.length === 0 || DUMMY_USER_RECORDS.length === 0) return null;
    return { score: 85, label: "꽤 잘 맞아요" }; // Simplified mock
  }, [currentUserRecords]);

  return (
    <Layout title={displayName} showBack hasTabBar={true}>
      <div className="pb-4 px-5 pt-4 relative min-h-full">
        <section className="bg-[#2E2E2E] text-white rounded-[2rem] p-6 shadow-xl relative overflow-hidden mb-6">
            <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-gray-700 overflow-hidden"><img src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=400&q=80" className="w-full h-full object-cover" /></div>
                        <div><h2 className="text-xl font-bold mb-1">{displayName}</h2><span className="bg-white/10 px-2 py-0.5 rounded text-xs">Lv.{level}</span></div>
                    </div>
                    <button onClick={() => setIsFollowing(!isFollowing)} className={`px-5 py-2.5 rounded-full text-xs font-bold ${isFollowing ? 'bg-gray-700' : 'bg-primary'}`}>{isFollowing ? <Check size={16} /> : <UserPlus size={16} />}{isFollowing ? '팔로잉' : '팔로우'}</button>
                </div>
                {mbti && <div className="mb-6"><h1 className="text-4xl font-black">{mbti.code}</h1><p className="text-sm text-gray-400">"{mbti.nuance}"</p></div>}
                {matchResult && <div className="bg-white/5 rounded-xl p-4"><div className="flex justify-between mb-2"><span className="text-xs text-gray-400">MATCH</span><span className="text-sm font-bold">{matchResult.score}%</span></div><div className="h-2 bg-white/10 rounded-full"><div className="h-full bg-primary rounded-full" style={{ width: `${matchResult.score}%` }}></div></div></div>}
            </div>
        </section>
        <section>
          <h3 className="text-lg font-bold text-secondary mb-4 flex items-center pl-1"><Utensils size={20} className="mr-2 text-gray-400" />미식 로그</h3>
          <div className="space-y-6">
              {DUMMY_USER_RECORDS.map((record) => (
                <div key={record.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
                    <div className="h-48 relative"><img src={record.representativePhoto} className="w-full h-full object-cover" /><div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div><div className="absolute bottom-4 left-5 text-white"><h4 className="font-bold text-xl">{record.title}</h4></div></div>
                    <div className="p-5">
                        <div className="flex items-start gap-3 mb-4"><Sparkles size={18} className="text-primary flex-shrink-0 mt-0.5" /><p className="text-base text-gray-600 font-serif italic">"{record.reviewText}"</p></div>
                        <div className="flex gap-1.5 flex-wrap">
                            {record.keywords.map(k => (
                                <span key={k} className="text-[10px] bg-gray-50 text-gray-500 px-2 py-1 rounded-md border border-gray-100 font-medium">#{k}</span>
                            ))}
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
