
import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Users, Compass, Trophy } from 'lucide-react';

interface BottomTabBarProps {
  activeTab: 'home' | 'feed' | 'discover' | 'leaderboard';
}

export const BottomTabBar: React.FC<BottomTabBarProps> = ({ activeTab }) => {
  const tabs = [
    { id: 'home', label: '내 기록', icon: BookOpen, path: '/' },
    { id: 'feed', label: '친구들', icon: Users, path: '/feed' },
    { id: 'discover', label: '디스커버', icon: Compass, path: '/discover' },
    { id: 'leaderboard', label: '랭킹', icon: Trophy, path: '/leaderboard' },
  ];

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 w-[calc(100%-32px)] max-w-[360px] z-50">
      {/* Liquid Glass Container */}
      <div className="bg-black/60 backdrop-blur-2xl rounded-full border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)] flex items-center justify-between px-6 py-3 relative overflow-hidden ring-1 ring-white/5">
        
        {/* Top Gloss Reflection */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
        
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <Link 
              key={tab.id}
              to={tab.path} 
              className="relative flex flex-col items-center justify-center group w-12 h-12"
            >
              {/* Active Glow Blob */}
              {isActive && (
                <div className="absolute inset-0 bg-primary/40 blur-xl rounded-full scale-125 animate-pulse-slow"></div>
              )}

              {/* Icon */}
              <div className={`relative z-10 transition-all duration-300 transform ${isActive ? 'scale-110 -translate-y-0.5' : 'scale-100 group-active:scale-95'}`}>
                 <Icon 
                    size={24} 
                    strokeWidth={isActive ? 2.5 : 2}
                    className={`transition-colors duration-300 ${
                        isActive 
                        ? 'text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.7)]' 
                        : 'text-white/40 group-hover:text-white/80'
                    }`} 
                 />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
