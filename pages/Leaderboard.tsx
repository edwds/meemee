
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Flame, Heart, MapPin, Crown, ChevronRight } from 'lucide-react';
import { Layout } from '../components/Layout';
import { BottomTabBar } from '../components/BottomTabBar';
import { MOCK_ACTIVE_USERS, MOCK_POPULAR_USERS, MOCK_REGIONAL_DATA } from '../data/dummyData';
import { LeaderboardUser } from '../types';

type TabType = 'active' | 'popular' | 'regional';

export const Leaderboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('active');
  const [selectedRegion, setSelectedRegion] = useState<string>('성수');

  const getTabIcon = (type: TabType) => {
    switch (type) {
      case 'active': return <Flame size={16} className="mr-1" />;
      case 'popular': return <Heart size={16} className="mr-1" />;
      case 'regional': return <MapPin size={16} className="mr-1" />;
    }
  };

  const regions = Object.keys(MOCK_REGIONAL_DATA);

  const getCurrentList = (): LeaderboardUser[] => {
    if (activeTab === 'active') return MOCK_ACTIVE_USERS;
    if (activeTab === 'popular') return MOCK_POPULAR_USERS;
    if (activeTab === 'regional') return MOCK_REGIONAL_DATA[selectedRegion] || [];
    return [];
  };

  const userList = getCurrentList();

  return (
    <Layout title="랭킹" hasTabBar={true}>
      <div className="pb-4 pt-2 px-4 min-h-full">
        
        {/* Tabs */}
        <div className="flex p-1 bg-gray-100 rounded-xl mb-6">
          {(['active', 'popular', 'regional'] as TabType[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 flex items-center justify-center py-2.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === tab 
                  ? 'bg-white text-secondary shadow-sm' 
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {getTabIcon(tab)}
              {tab === 'active' ? '활동왕' : tab === 'popular' ? '인기왕' : '지역별'}
            </button>
          ))}
        </div>

        {/* Region Filter (Only for Regional Tab) */}
        {activeTab === 'regional' && (
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-4 mb-2">
            {regions.map(region => (
              <button
                key={region}
                onClick={() => setSelectedRegion(region)}
                className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
                  selectedRegion === region 
                    ? 'bg-secondary text-white' 
                    : 'bg-white border border-gray-200 text-gray-500'
                }`}
              >
                {region}
              </button>
            ))}
          </div>
        )}

        {/* Description */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-secondary">
            {activeTab === 'active' && '이번 달 열정 미식가 🔥'}
            {activeTab === 'popular' && '가장 사랑받는 미식가 💖'}
            {activeTab === 'regional' && `${selectedRegion}의 터줏대감 🗺️`}
          </h2>
          <span className="text-[10px] text-gray-400">실시간 업데이트</span>
        </div>

        {/* List */}
        <div className="space-y-3">
          {userList.map((user, index) => {
            const isTop3 = index < 3;
            let rankColor = 'bg-gray-100 text-gray-500';
            let rankIcon = null;
            
            if (index === 0) {
              rankColor = 'bg-yellow-100 text-yellow-700 border border-yellow-200';
              rankIcon = <Crown size={12} className="absolute -top-1.5 -right-1.5 text-yellow-500 transform rotate-12" />;
            } else if (index === 1) {
              rankColor = 'bg-gray-200 text-gray-600 border border-gray-300';
            } else if (index === 2) {
              rankColor = 'bg-orange-100 text-orange-700 border border-orange-200';
            }

            return (
              <Link 
                key={user.id} 
                to={`/profile/${user.name}`}
                className="block active:scale-[0.99] transition-transform"
              >
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center relative overflow-hidden">
                   {/* Gradient Highlight for #1 */}
                   {index === 0 && <div className="absolute top-0 left-0 w-1 h-full bg-yellow-400"></div>}

                   {/* Rank */}
                   <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm mr-4 relative flex-shrink-0 ${rankColor}`}>
                      {user.rank}
                      {rankIcon}
                   </div>

                   {/* Avatar */}
                   <div className="w-12 h-12 rounded-full p-0.5 bg-gradient-to-tr from-gray-100 to-gray-300 mr-3 flex-shrink-0">
                      <img src={user.avatar} alt={user.name} className="w-full h-full object-cover rounded-full border border-white" />
                   </div>

                   {/* Info */}
                   <div className="flex-1 min-w-0 mr-2">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <h3 className="font-bold text-secondary text-sm truncate">{user.name}</h3>
                        <span className="text-[9px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded font-bold">Lv.{user.level}</span>
                      </div>
                      <div className="flex items-center gap-2">
                         <span className="text-[9px] text-primary font-bold bg-orange-50 px-1.5 rounded border border-orange-100">{user.mbti}</span>
                      </div>
                   </div>

                   {/* Stats */}
                   <div className="text-right">
                      <div className="text-sm font-black text-secondary">{user.stats.count}</div>
                      <div className="text-[9px] text-gray-400 font-medium">{user.stats.label}</div>
                   </div>

                   <ChevronRight size={16} className="text-gray-300 ml-2" />
                </div>
              </Link>
            );
          })}

          {userList.length === 0 && (
            <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-200">
               <p className="text-gray-400 text-xs">아직 랭킹 데이터가 없어요 🥲</p>
            </div>
          )}
        </div>

      </div>
      <BottomTabBar activeTab="leaderboard" />
    </Layout>
  );
};
