
import React, { useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Utensils, Check, UserPlus, Sparkles, ChevronRight } from 'lucide-react';
import { Layout } from '../components/Layout';
import { BottomTabBar } from '../components/BottomTabBar';
import { ReviewRecord } from '../types';
import { calculateLevel, calculateGourmetMBTI } from '../utils/gamification';
import { MOCK_FRIEND_RECORDS } from '../data/dummyData';

interface UserProfileProps {
  currentUserRecords?: ReviewRecord[];
}

export const UserProfile: React.FC<UserProfileProps> = ({ currentUserRecords = [] }) => {
  const { userId } = useParams<{ userId: string }>();
  const [isFollowing, setIsFollowing] = useState(false);
  const displayName = decodeURIComponent(userId || 'User');
  const { level } = calculateLevel(MOCK_FRIEND_RECORDS.length);
  const mbti = useMemo(() => calculateGourmetMBTI(MOCK_FRIEND_RECORDS), []);
  
  const matchResult = useMemo(() => {
    if (currentUserRecords.length === 0 || MOCK_FRIEND_RECORDS.length === 0) return null;
    return { score: 85, label: "천생연분 입맛!" }; // Mock
  }, [currentUserRecords]);

  return (
    <Layout title={displayName} showBack hasTabBar={true} backgroundColor="bg-black">
      <div className="pb-32 relative min-h-full bg-black text-white">
        
        {/* Floating Premium Profile Card */}
        <div className="mx-4 mt-6 mb-8 bg-[#1A1A1A] rounded-[2.5rem] p-6 shadow-2xl border border-white/5 relative overflow-hidden z-10">
            {/* Background Deco */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -translate-y-10 translate-x-10"></div>

            <div className="relative z-10">
                <div className="flex justify-between items-start mb-6">
                    <Link to={`/profile/${userId}/achievement`} className="group flex items-center gap-4">
                        <div className="relative">
                            <div className="w-20 h-20 rounded-full p-1 bg-gradient-to-tr from-gray-600 to-gray-800 group-active:scale-95 transition-transform shadow-xl">
                                <img 
                                src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=400&q=80" 
                                alt={displayName} 
                                className="w-full h-full object-cover rounded-full border-4 border-[#1A1A1A]"
                                />
                            </div>
                            <div className="absolute -bottom-1 -right-1 bg-white text-black text-xs font-black px-2 py-0.5 rounded-lg border-2 border-[#1A1A1A] shadow-lg">
                                Lv.{level}
                            </div>
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-2xl font-black leading-none tracking-tight mb-2 group-active:text-gray-300 transition-colors">{displayName}</h2>
                                <ChevronRight size={18} className="text-gray-600 mb-1" />
                            </div>
                            
                            {mbti ? (
                                <div className="flex flex-col items-start gap-1">
                                    <div className="flex items-center gap-2">
                                        <span className="text-white/90 font-black text-xl leading-none">{mbti.code}</span>
                                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest border border-white/10 px-1.5 py-0.5 rounded">{mbti.title}</span>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-xs text-gray-500">No data yet.</p>
                            )}
                        </div>
                    </Link>
                    
                    {/* Follow Button */}
                    <button 
                        onClick={() => setIsFollowing(!isFollowing)} 
                        className={`px-4 py-2 rounded-full text-xs font-bold transition-all shadow-lg active:scale-95 ${
                            isFollowing 
                            ? 'bg-white/10 text-white border border-white/10' 
                            : 'bg-primary text-white shadow-orange-500/30'
                        }`}
                    >
                        {isFollowing ? 'Following' : 'Follow'}
                    </button>
                </div>

                {/* Taste Match Visualization */}
                {matchResult && (
                    <div className="border-t border-white/5 pt-4">
                         <div className="flex justify-between items-end mb-2">
                             <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Taste Match</span>
                             <div className="flex items-center gap-1.5">
                                 <Sparkles size={12} className="text-primary" />
                                 <span className="text-sm font-bold text-white">{matchResult.score}%</span>
                             </div>
                         </div>
                         <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden">
                             <div 
                                className="h-full bg-gradient-to-r from-primary to-purple-500 rounded-full shadow-[0_0_10px_rgba(255,107,53,0.5)] relative" 
                                style={{ width: `${matchResult.score}%` }}
                             >
                                 <div className="absolute top-0 left-0 w-full h-full bg-white/20 animate-pulse"></div>
                             </div>
                         </div>
                         <p className="text-[10px] text-gray-400 text-right mt-1.5 italic">"{matchResult.label}"</p>
                    </div>
                )}
            </div>
        </div>

        {/* Content Section: Album Grid */}
        <section className="px-1">
             <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest px-4 mb-4">Gourmet Logs</h3>
             
             <div className="grid grid-cols-2 gap-x-2 gap-y-6 px-3">
                {MOCK_FRIEND_RECORDS.map((record) => (
                    <Link key={record.id} to={`/record/${record.id}`} className="block group active:scale-[0.98] transition-transform">
                        <article className="relative aspect-[4/5] rounded-[2rem] overflow-hidden bg-[#1A1A1A] shadow-lg mb-2">
                            <img src={record.representativePhoto} alt={record.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-90 group-hover:opacity-100" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
                            
                            {/* Minimalist Badge Overlay */}
                            {record.rank && (
                                <div className="absolute top-3 left-3 bg-white/10 backdrop-blur-md border border-white/10 px-2 py-0.5 rounded-full">
                                    <span className="text-[10px] font-black text-yellow-400">#{record.rank}</span>
                                </div>
                            )}
                        </article>
                        {/* Magazine Style Caption */}
                        <div className="px-2">
                            <div className="flex items-center justify-between mb-0.5">
                                <span className="text-[10px] font-bold text-primary uppercase tracking-wider">
                                    {record.keywords[0] || 'Gourmet'}
                                </span>
                                <span className="text-[10px] text-gray-600 font-medium">{record.visitDate.slice(5).replace('-','.')}</span>
                            </div>
                            <h4 className="font-bold text-base text-white leading-tight line-clamp-1 group-hover:text-gray-300 transition-colors">
                                {record.title}
                            </h4>
                            <p className="text-xs text-gray-500 line-clamp-1 mt-0.5 font-medium">{record.menu}</p>
                        </div>
                    </Link>
                ))}
             </div>
        </section>

        <BottomTabBar activeTab="feed" />
      </div>
    </Layout>
  );
};
