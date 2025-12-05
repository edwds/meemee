
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Globe, MapPin, Crown, ChevronRight, Briefcase, Filter } from 'lucide-react';
import { Layout } from '../components/Layout';
import { BottomTabBar } from '../components/BottomTabBar';
import { MOCK_ACTIVE_USERS, MOCK_GROUP_USERS, MOCK_REGIONAL_DATA } from '../data/dummyData';
import { LeaderboardUser } from '../types';

type TabType = 'group' | 'regional' | 'global';

export const Leaderboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('group');
  const [selectedRegion, setSelectedRegion] = useState<string>('성수');

  const getTabInfo = (type: TabType) => {
    switch (type) {
      case 'group': return { label: '내 그룹', icon: Briefcase };
      case 'regional': return { label: '지역별', icon: MapPin };
      case 'global': return { label: '전체', icon: Globe };
    }
  };

  const regions = Object.keys(MOCK_REGIONAL_DATA);

  const getCurrentList = (): LeaderboardUser[] => {
    if (activeTab === 'group') return MOCK_GROUP_USERS;
    if (activeTab === 'global') return MOCK_ACTIVE_USERS; // Global reuses active for MVP
    if (activeTab === 'regional') return MOCK_REGIONAL_DATA[selectedRegion] || [];
    return [];
  };

  const userList = getCurrentList();

  return (
    <Layout title="랭킹" hasTabBar={true} hideHeader={true} backgroundColor="bg-black">
      <div className="pb-8 pt-8 px-4 min-h-full bg-black text-white">
        
        {/* Custom Header Title */}
        <div className="mb-6 flex items-center justify-between px-1">
            <h1 className="text-3xl font-black text-white tracking-tight">Leaderboard</h1>
            <span className="text-xs font-bold text-black bg-yellow-400 px-3 py-1 rounded-full uppercase tracking-wider">
                Top Rankers
            </span>
        </div>

        {/* Tabs */}
        <div className="flex p-1 bg-[#1A1A1A] rounded-2xl mb-6 border border-white/5 relative">
          {(['group', 'regional', 'global'] as TabType[]).map((tab) => {
            const info = getTabInfo(tab);
            const Icon = info.icon;
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 flex items-center justify-center py-3 rounded-xl text-xs font-bold transition-all relative z-10 ${
                  isActive 
                    ? 'text-black' 
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                {isActive && (
                    <div className="absolute inset-0 bg-white rounded-xl shadow-md -z-10 animate-fade-in"></div>
                )}
                <Icon size={14} className="mr-1.5" strokeWidth={2.5} />
                {info.label}
              </button>
            );
          })}
        </div>

        {/* Filter & Sub-header */}
        <div className="mb-6 flex items-center justify-between">
            {activeTab === 'regional' ? (
                 <div className="flex gap-2 overflow-x-auto no-scrollbar mask-linear-fade flex-1 mr-4">
                    {regions.map(region => (
                    <button
                        key={region}
                        onClick={() => setSelectedRegion(region)}
                        className={`px-3 py-1.5 rounded-full text-[10px] font-bold whitespace-nowrap transition-colors border ${
                        selectedRegion === region 
                            ? 'bg-primary border-primary text-white' 
                            : 'bg-transparent border-white/10 text-gray-400 hover:border-white/30'
                        }`}
                    >
                        {region}
                    </button>
                    ))}
                </div>
            ) : (
                <div className="flex-1">
                    <h2 className="text-sm font-bold text-gray-300 flex items-center gap-2">
                        {activeTab === 'group' && 'Startup Crew 🚀'}
                        {activeTab === 'global' && 'Global Ranking 🌎'}
                    </h2>
                </div>
            )}
            
            {/* Filter Button */}
            <button className="w-8 h-8 rounded-full bg-[#1A1A1A] border border-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors flex-shrink-0">
                <Filter size={14} />
            </button>
        </div>

        {/* List */}
        <div className="space-y-3">
          {userList.map((user, index) => {
            let rankColor = 'text-gray-500';
            let rankBg = 'bg-[#252525]';
            let rankIcon = null;
            
            if (index === 0) {
              rankColor = 'text-yellow-400';
              rankBg = 'bg-yellow-400/10 border-yellow-400/20';
              rankIcon = <Crown size={12} className="absolute -top-1 -right-1 text-yellow-400 transform rotate-12 fill-yellow-400" />;
            } else if (index === 1) {
              rankColor = 'text-gray-300';
              rankBg = 'bg-gray-400/10 border-gray-400/20';
            } else if (index === 2) {
              rankColor = 'text-orange-400';
              rankBg = 'bg-orange-400/10 border-orange-400/20';
            }

            return (
              <Link 
                key={user.id} 
                to={`/profile/${user.name}`}
                className="block active:scale-[0.98] transition-transform"
              >
                <div className="bg-[#1A1A1A] rounded-2xl p-4 border border-white/5 flex items-center relative overflow-hidden hover:bg-[#222] transition-colors group">
                   
                   {/* Rank */}
                   <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-base mr-4 relative flex-shrink-0 border border-transparent ${rankBg} ${rankColor}`}>
                      {user.rank}
                      {rankIcon}
                   </div>

                   {/* Avatar */}
                   <div className="w-12 h-12 rounded-full p-0.5 bg-gradient-to-tr from-gray-700 to-gray-600 mr-3 flex-shrink-0 relative">
                      <img src={user.avatar} alt={user.name} className="w-full h-full object-cover rounded-full border border-[#1A1A1A]" />
                      <div className="absolute -bottom-1 -right-1 bg-black text-[9px] text-white px-1.5 py-0.5 rounded border border-white/10 font-bold">
                        Lv.{user.level}
                      </div>
                   </div>

                   {/* Info */}
                   <div className="flex-1 min-w-0 mr-2">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-white text-base truncate">{user.name}</h3>
                        <span className="text-[9px] text-primary font-black bg-primary/10 px-1.5 py-0.5 rounded uppercase tracking-wider border border-primary/20">
                            {user.mbti}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 truncate font-medium">"{user.nuance}"</p>
                   </div>

                   {/* Stats */}
                   <div className="text-right">
                      <div className="text-sm font-black text-white">{user.stats.count}</div>
                      <div className="text-[9px] text-gray-500 font-bold uppercase tracking-wide">{user.stats.label}</div>
                   </div>
                </div>
              </Link>
            );
          })}

          {userList.length === 0 && (
            <div className="text-center py-12 bg-[#1A1A1A] rounded-2xl border border-dashed border-white/5">
               <p className="text-gray-500 text-xs">아직 랭킹 데이터가 없어요 🥲</p>
            </div>
          )}
        </div>

      </div>
      <BottomTabBar activeTab="leaderboard" />
    </Layout>
  );
};
